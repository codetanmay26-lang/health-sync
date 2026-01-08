// utils/aiAnalysis.js - Simple version, no backend calls

// Demo/fallback analysis for when API is unavailable
function generateDemoAnalysis(reportText, patientInfo) {
  return {
    success: true,
    analysis: `**AI Analysis (Demo Mode)**

**Patient:** ${patientInfo.name} (Age: ${patientInfo.age})

**Main Findings:**
1. Lab report successfully uploaded and extracted
2. Values are being analyzed for abnormalities
3. This is a demo response (API quota exceeded or unavailable)

**Recommendations:**
- Review the extracted values manually
- Consult with your healthcare provider for professional interpretation
- Real AI analysis will be available when API quota resets

**Urgency Level:** Medium - Manual review recommended

*Note: This is a fallback response. For accurate AI analysis, please wait for API quota to reset or update your API key.*`,
    timestamp: new Date().toISOString(),
    isDemo: true
  };
}

export async function analyzeLabReport(reportText, patientInfo) {
  // Check if API key is configured
  if (!import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY === 'YOUR_NEW_API_KEY_HERE') {
    console.warn('⚠️ API key not configured, using demo mode');
    return generateDemoAnalysis(reportText, patientInfo);
  }

  const prompt = `Analyze this lab report and give basic medical insights:

Patient: ${patientInfo.name} (Age: ${patientInfo.age})

Lab Report:
${reportText}

Provide simple analysis:
1. Main findings
2. Any abnormal values
3. What doctor should check
4. Urgency: Low/Medium/High

Keep it short and clear.`;

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
        }]
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
    
    const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!analysis) {
      return {
        success: false,
        error: 'No analysis generated. The API response was empty.'
      };
    }

    return {
      success: true,
      analysis: analysis,
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
    timestamp: analysisData.timestamp,
    patientName: patientId // You can improve this
  });
  localStorage.setItem('doctorAnalyses', JSON.stringify(analyses));
  
  return { success: true, message: 'Analysis sent to doctor' };
}
