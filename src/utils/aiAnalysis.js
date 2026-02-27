// utils/aiAnalysis.js

function getSafeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeUrgency(value) {
  const raw = String(value || "").toLowerCase();
  if (raw.includes("high") || raw.includes("critical") || raw.includes("urgent")) {
    return "High";
  }
  if (raw.includes("medium") || raw.includes("moderate") || raw.includes("watch")) {
    return "Medium";
  }
  return "Low";
}

function buildAnalysisText(structured, patientInfo = {}) {
  const patientName = patientInfo?.name || "Patient";
  const patientAge = patientInfo?.age ?? "N/A";

  const mainFindings = getSafeArray(structured?.mainFindings);
  const doctorChecks = getSafeArray(structured?.doctorChecks);
  const abnormalValues = getSafeArray(structured?.abnormalValues);

  const abnormalLines = abnormalValues.length
    ? abnormalValues.map((item, index) => {
        const label = item?.testName || item?.name || `Item ${index + 1}`;
        const value = item?.value ? `: ${item.value}` : "";
        const range = item?.referenceRange ? ` (Ref: ${item.referenceRange})` : "";
        const status = item?.status || item?.severity || "Abnormal";
        return `${index + 1}. ${label}${value} — ${status}${range}`;
      })
    : ["1. No clear abnormal values detected from extracted text"];

  const findingLines = mainFindings.length
    ? mainFindings.map((item, index) => `${index + 1}. ${item}`)
    : ["1. Main findings were limited due to report text quality"];

  const checkLines = doctorChecks.length
    ? doctorChecks.map((item, index) => `${index + 1}. ${item}`)
    : ["1. Correlate findings with symptoms and prior reports"];

  return `AI Analysis

Patient: ${patientName} (Age: ${patientAge})

Main Findings:
${findingLines.join("\n")}

Abnormal Values:
${abnormalLines.join("\n")}

Doctor Should Check:
${checkLines.join("\n")}

Urgency Level: ${structured?.urgencyLevel || "Medium"}${structured?.urgencyReason ? ` - ${structured.urgencyReason}` : ""}

Summary:
${structured?.summary || "Clinical review recommended."}`;
}

function extractFromFreeText(text = "") {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*\s]+/, "").trim())
    .filter(Boolean);

  const findingCandidates = lines.filter((line) => {
    const lc = line.toLowerCase();
    return (
      lc.includes("high") ||
      lc.includes("low") ||
      lc.includes("elevated") ||
      lc.includes("decreased") ||
      lc.includes("abnormal") ||
      lc.includes("critical")
    );
  });

  return {
    summary: lines.slice(0, 2).join(" ") || "AI generated analysis from available text.",
    mainFindings: findingCandidates.slice(0, 4),
    abnormalValues: findingCandidates.slice(0, 5).map((line) => ({
      testName: line,
      status: /critical/i.test(line) ? "Critical" : /high|elevated/i.test(line) ? "High" : /low|decreased/i.test(line) ? "Low" : "Abnormal",
    })),
    doctorChecks: lines.filter((line) => /review|check|repeat|monitor|consult/i.test(line)).slice(0, 4),
    urgencyLevel: normalizeUrgency(text),
    urgencyReason: "Derived from extracted abnormalities in the report text.",
  };
}

function normalizeStructuredAnalysis(rawStructured, fallbackText = "") {
  const fallback = extractFromFreeText(fallbackText);

  const mainFindings = getSafeArray(rawStructured?.mainFindings);
  const abnormalValues = getSafeArray(rawStructured?.abnormalValues)
    .map((item) => ({
      testName: item?.testName || item?.name || "",
      value: item?.value || "",
      referenceRange: item?.referenceRange || "",
      status: item?.status || item?.severity || "",
    }))
    .filter((item) => item.testName || item.value || item.status);

  const doctorChecks = getSafeArray(rawStructured?.doctorChecks);

  const summary = rawStructured?.summary || fallback.summary;
  const urgencyLevel = normalizeUrgency(rawStructured?.urgencyLevel || rawStructured?.urgency || fallback.urgencyLevel);
  const urgencyReason =
    rawStructured?.urgencyReason ||
    rawStructured?.urgencyExplanation ||
    fallback.urgencyReason;

  return {
    summary,
    mainFindings: mainFindings.length ? mainFindings : fallback.mainFindings,
    abnormalValues: abnormalValues.length ? abnormalValues : fallback.abnormalValues,
    doctorChecks: doctorChecks.length ? doctorChecks : fallback.doctorChecks,
    urgencyLevel,
    urgencyReason,
  };
}

function parseGeminiJson(rawText = "") {
  if (!rawText) return null;

  const cleaned = rawText.replace(/```json|```/gi, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

// Demo/fallback analysis for when API is unavailable
function generateDemoAnalysis(reportText, patientInfo) {
  const structuredAnalysis = normalizeStructuredAnalysis(
    {
      summary: "Demo mode response generated because AI service is unavailable.",
      mainFindings: [
        "Lab report uploaded and text extraction completed",
        "Potential abnormalities are flagged based on extracted text patterns",
        "Professional review is required for diagnosis",
      ],
      abnormalValues: [
        {
          testName: "Extracted report values",
          status: "Needs clinical validation",
        },
      ],
      doctorChecks: [
        "Correlate flagged items with patient symptoms",
        "Confirm values against original lab document",
      ],
      urgencyLevel: "Medium",
      urgencyReason: "Automatic fallback mode cannot provide full clinical confidence.",
    },
    reportText
  );

  return {
    success: true,
    analysis: buildAnalysisText(structuredAnalysis, patientInfo),
    structuredAnalysis,
    timestamp: new Date().toISOString(),
    isDemo: true,
  };
}

export async function analyzeLabReport(reportText, patientInfo) {
  // Check if API key is configured
  if (!import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY === 'YOUR_NEW_API_KEY_HERE') {
    console.warn('⚠️ API key not configured, using demo mode');
    return generateDemoAnalysis(reportText, patientInfo);
  }

  const prompt = `You are a clinical lab report analyzer.
Return STRICT JSON only. Do not include markdown.

Required response schema:
{
  "summary": "short 1-2 sentence summary",
  "mainFindings": ["finding 1", "finding 2"],
  "abnormalValues": [
    {
      "testName": "name of parameter",
      "value": "reported value",
      "referenceRange": "range if present",
      "status": "High|Low|Critical|Abnormal|Borderline"
    }
  ],
  "doctorChecks": ["what doctor should verify"],
  "urgencyLevel": "Low|Medium|High",
  "urgencyReason": "short reason"
}

Rules:
- Focus on clinically important findings first.
- Extract explicit abnormal flags from report text.
- If data is unclear, state uncertainty but still provide best extraction.
- Keep findings concise and actionable.

Patient: ${patientInfo.name} (Age: ${patientInfo.age})

Lab Report:
${reportText}`;

  const generationConfig = { response_mime_type: "application/json" };

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': import.meta.env.VITE_GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig
      })
    });

    const data = await response.json();
    console.log('API Response:', data); // Debugging: Log raw API response
    
    // Check for API errors (quota, invalid key, etc.)
    if (data.error) {
      const errorMsg = data.error.message || 'API Error';
      console.error('Gemini API Error:', data.error);
      
      if (data.error.code === 429) {
        console.warn('⚠️ API quota exceeded, using demo mode');
        return generateDemoAnalysis(reportText, patientInfo);
      } else if (data.error.code === 400) {
        return {
          success: false,
          error: 'Invalid API key or request. Please check your API key configuration.'
        };
      }
      
      return {
        success: false,
        error: errorMsg
      };
    }
    
    const rawAnalysis = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawAnalysis) {
      return {
        success: false,
        error: 'No analysis generated. The API response was empty.'
      };
    }

    const parsedJson = parseGeminiJson(rawAnalysis);
    const structuredAnalysis = normalizeStructuredAnalysis(parsedJson, rawAnalysis || reportText);
    const analysis = buildAnalysisText(structuredAnalysis, patientInfo);

    return {
      success: true,
      analysis: analysis,
      structuredAnalysis,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to connect to AI service'
    };
  }
}

// Simple function to simulate sending to doctor (just stores locally)
export function sendAnalysisToDoctor(analysisData, doctorId, patientId) {
  // Store in localStorage for demo purposes
  const analyses = JSON.parse(localStorage.getItem('doctorAnalyses') || '[]');
  analyses.push({
    id: Date.now(),
    doctorId,
    patientId,
    analysis: analysisData.analysis,
    structuredAnalysis: analysisData.structuredAnalysis,
    timestamp: analysisData.timestamp,
    patientName: patientId // You can improve this
  });
  localStorage.setItem('doctorAnalyses', JSON.stringify(analyses));
  
  return { success: true, message: 'Analysis sent to doctor' };
}
