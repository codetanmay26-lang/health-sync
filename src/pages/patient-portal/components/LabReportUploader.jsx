import React, { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import Button from "../../../components/ui/Button.jsx";
import {
  analyzeLabReport,
  sendAnalysisToDoctor,
} from "../../../utils/aiAnalysis";
import pdfToText from "react-pdftotext";
import jsPDF from "jspdf";

export default function LabReportUploader({ patientInfo, doctorId }) {
  const { user } = useAuth(); // ✅ GET LOGGED-IN USER
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState({});

  // ✅ USE REAL PATIENT ID
  const realPatientId = user?.id || patientInfo?.id || 'guest';

  // Render AI text with highlighted findings and markdown-style sections
  const formatAnalysisText = (analysisPayload) => {
    const structured = analysisPayload?.structuredAnalysis;
    const text = analysisPayload?.analysis || analysisPayload;
    if (!text && !structured) return null;

    const getAbnormalTone = (line = "") => {
      if (/\b(critical|very high|urgent)\b/i.test(line)) return "text-red-700 bg-red-50 border border-red-200";
      if (/\b(high|elevated|abnormal)\b/i.test(line)) return "text-red-700 bg-red-50 border border-red-200";
      if (/\b(low|decreased|below)\b/i.test(line)) return "text-amber-700 bg-amber-50 border border-amber-200";
      if (/\b(borderline)\b/i.test(line)) return "text-yellow-700 bg-yellow-50 border border-yellow-200";
      return "text-gray-800";
    };

    if (structured) {
      const mainFindings = Array.isArray(structured.mainFindings) ? structured.mainFindings : [];
      const abnormalValues = Array.isArray(structured.abnormalValues) ? structured.abnormalValues : [];
      const doctorChecks = Array.isArray(structured.doctorChecks) ? structured.doctorChecks : [];

      return (
        <div className="space-y-4 text-gray-900">
          <div className="border-b border-gray-300 pb-2">
            <h4 className="text-base font-semibold">Lab Report Analysis</h4>
            <p className="text-xs text-gray-600">{new Date().toLocaleDateString()}</p>
          </div>

          {mainFindings.length > 0 && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <h5 className="text-sm font-semibold text-blue-900 mb-2">Main Findings</h5>
              <ul className="list-disc list-outside pl-5 space-y-1 text-sm text-blue-900">
                {mainFindings.map((finding, idx) => (
                  <li key={`mf-${idx}`} className="leading-relaxed">{finding}</li>
                ))}
              </ul>
            </div>
          )}

          {abnormalValues.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-semibold text-gray-900">Abnormal Values</h5>
              {abnormalValues.map((item, idx) => {
                const line = `${item?.testName || item?.name || "Parameter"}${item?.value ? `: ${item.value}` : ""} ${item?.status || ""}`.trim();
                return (
                  <div key={`ab-${idx}`} className={`rounded-md px-3 py-2 text-sm ${getAbnormalTone(line)}`}>
                    <span className="font-medium">{item?.testName || item?.name || "Parameter"}</span>
                    {item?.value ? `: ${item.value}` : ""}
                    {item?.status ? ` — ${item.status}` : ""}
                    {item?.referenceRange ? ` (Ref: ${item.referenceRange})` : ""}
                  </div>
                );
              })}
            </div>
          )}

          {doctorChecks.length > 0 && (
            <div>
              <h5 className="text-sm font-semibold text-gray-900 mb-2">Doctor Should Check</h5>
              <ul className="list-disc list-outside pl-5 space-y-1 text-sm text-gray-800">
                {doctorChecks.map((check, idx) => (
                  <li key={`dc-${idx}`} className="leading-relaxed">{check}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800">
            <span className="font-semibold">Urgency Level:</span> {structured.urgencyLevel || "Medium"}
            {structured.urgencyReason ? ` — ${structured.urgencyReason}` : ""}
          </div>

          {structured.summary && (
            <p className="text-sm text-gray-800 leading-relaxed">
              <span className="font-semibold">Summary:</span> {structured.summary}
            </p>
          )}

          <div className="border-t border-gray-200 pt-3 text-xs text-gray-600">
            Note: This analysis should be reviewed by your physician. Abnormal values require medical attention.
          </div>
        </div>
      );
    }

    const cleanText = text.replace(/\*/g, "").replace(/^\s*•\s?/gm, ""); // drop leading bullets
    const lines = cleanText.split("\n").map((l) => l.trim()).filter(Boolean);

    const blocks = [];
    let list = [];
    let table = [];

    const flushList = () => {
      if (list.length) {
        blocks.push({ type: "list", items: [...list] });
        list = [];
      }
    };

    const flushTable = () => {
      if (table.length) {
        blocks.push({ type: "table", rows: [...table] });
        table = [];
      }
    };

    lines.forEach((line, idx) => {
      const isHeading = /^#{2,6}\s+/.test(line) || /^\d+\.\s+/.test(line);
      const isTableRow = line.startsWith("|");
      const isBullet = /^[-*]\s+/.test(line);

      if (isTableRow) {
        flushList();
        const cells = line
          .split("|")
          .map((c) => c.trim())
          .filter((c) => c.length);
        table.push(cells);
        return;
      }

      if (table.length && !isTableRow) {
        flushTable();
      }

      if (isHeading) {
        flushList();
        flushTable();
        const level = line.startsWith("###") ? 3 : 2;
        blocks.push({ type: "heading", level, text: line.replace(/^#+\s*/, "") });
        return;
      }

      if (isBullet) {
        list.push(line.replace(/^[-*]\s+/, ""));
        return;
      }

      // Paragraphs: if previous is list, keep adding; else push paragraph
      if (list.length) {
        list.push(line);
      } else {
        blocks.push({ type: "paragraph", text: line });
      }
    });

    flushList();
    flushTable();

    const renderHeading = (block, i) => {
      const base = "font-semibold text-gray-900";
      const cls = block.level === 2 ? `${base} text-base mt-2` : `${base} text-sm`;
      return (
        <h4 key={`h-${i}`} className={cls}>
          {block.text}
        </h4>
      );
    };

    const renderList = (block, i) => (
      <ul key={`l-${i}`} className="list-disc list-outside pl-5 space-y-1 text-sm text-gray-800">
        {block.items.map((item, idx) => (
          <li key={idx} className="leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    );

    const renderParagraph = (block, i) => (
      <p key={`p-${i}`} className="text-sm leading-relaxed">
        <span className={`px-1 rounded ${getAbnormalTone(block.text)}`}>{block.text}</span>
      </p>
    );

    const renderTable = (block, i) => {
      const [header = [], ...rows] = block.rows;

      const cellTone = (cell) => {
        const lc = cell.toLowerCase();
        if (lc.includes("high")) return "bg-red-50 text-red-800 font-semibold";
        if (lc.includes("low")) return "bg-amber-50 text-amber-800 font-semibold";
        if (lc.includes("medium")) return "bg-amber-50 text-amber-800";
        return "text-gray-800";
      };

      return (
        <div key={`t-${i}`} className="overflow-x-auto text-sm">
          <table className="min-w-full border border-gray-200 text-left">
            <thead className="bg-gray-50">
              <tr>
                {header.map((cell, idx) => (
                  <th key={idx} className="px-3 py-2 border-b border-gray-200 font-semibold text-gray-900">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ridx) => (
                <tr key={ridx} className={ridx % 2 ? "bg-white" : "bg-gray-50"}>
                  {row.map((cell, cidx) => (
                    <td
                      key={cidx}
                      className={`px-3 py-2 border-b border-gray-200 ${cellTone(cell)}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    };

    return (
      <div className="space-y-3 text-gray-900">
        <div className="border-b border-gray-300 pb-2">
          <h4 className="text-base font-semibold">Lab Report Analysis</h4>
          <p className="text-xs text-gray-600">{new Date().toLocaleDateString()}</p>
        </div>

        {blocks.map((block, i) => {
          if (block.type === "heading") return renderHeading(block, i);
          if (block.type === "list") return renderList(block, i);
          if (block.type === "table") return renderTable(block, i);
          return renderParagraph(block, i);
        })}

        <div className="border-t border-gray-200 pt-3 text-xs text-gray-600">
          Note: This analysis should be reviewed by your physician. Abnormal values require medical attention.
        </div>
      </div>
    );
  };
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      uploadDate: new Date().toLocaleDateString(),
      analyzed: false,
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const extractTextFromFile = async (file) => {
    try {
      let text = "";

      if (file.type === "application/pdf") {
        text = await pdfToText(file);
      } else if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        text = await file.text();
      } else if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        text = await file.text();
      } else {
        text = await file.text();
      }

      if (!text || text.trim().length < 10) {
        alert("File seems empty or could not be read. Please try uploading a text file or PDF.");
        return null;
      }

      const cleanText = text.replace(/\s+/g, " ").trim();
      return cleanText;
    } catch (error) {
      console.error("Error extracting text:", error);
      alert("Could not read this file. Please make sure it's a valid PDF or text file.");
      return null;
    }
  };

  const handleAnalyzeAndSend = async (reportFile) => {
    if (!user || user.role !== 'patient') {
      alert('You must be logged in as a patient to analyze reports');
      return;
    }

    setAnalyzing(true);

    try {
      const reportText = await extractTextFromFile(reportFile.file);

      if (!reportText) {
        setAnalyzing(false);
        return;
      }

      const analysisResult = await analyzeLabReport(reportText, {
        ...patientInfo,
        id: realPatientId,
        name: user?.name || patientInfo?.name
      });

      if (analysisResult.success) {
        // ✅ SAVE LAB REPORT WITH REAL PATIENT ID
        const labReport = {
          id: `lab_${Date.now()}`,
          patientId: realPatientId,  // ✅ REAL PATIENT ID
          patientName: user?.name || patientInfo?.name,
          doctorId: doctorId || 'unassigned',
          reportType: 'lab_analysis',
          fileName: reportFile.name,
          fileSize: reportFile.file.size,
          fileType: reportFile.file.type,
          analysisText: analysisResult.analysis,
          structuredAnalysis: analysisResult.structuredAnalysis,
          uploadDate: new Date().toISOString(),
          status: 'analyzed',
          reviewed: false
        };

        // Save to localStorage
        const existingReports = JSON.parse(localStorage.getItem('labReports') || '[]');
        existingReports.push(labReport);
        localStorage.setItem('labReports', JSON.stringify(existingReports));

        // Send to doctor
        sendAnalysisToDoctor(analysisResult, doctorId, realPatientId);

        // Update UI
        setAnalysisResults((prev) => ({
          ...prev,
          [reportFile.id]: {
            ...analysisResult,
            sentAt: new Date().toLocaleString(),
          },
        }));

        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === reportFile.id ? { ...f, analyzed: true } : f
          )
        );

        console.log('✅ Lab report saved with patient ID:', realPatientId);
        alert("Report analyzed successfully!");
      } else {
        alert("Error: " + analysisResult.error);
      }
    } catch (error) {
      alert("Analysis failed: " + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const downloadAnalysisAsPDF = (analysis, reportName) => {
    const pdf = new jsPDF();
    let yPosition = 30;

    // Add title
    pdf.setFontSize(16);
    pdf.setFont(undefined, "bold");
    pdf.text("Medical Lab Report Analysis", 20, yPosition);
    yPosition += 15;

    pdf.setFontSize(12);
    pdf.setFont(undefined, "normal");
    pdf.text(`Report: ${reportName}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Patient: ${user?.name || patientInfo?.name}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, yPosition);
    yPosition += 15;

    const cleanText = analysis ? analysis.replace(/\*/g, "") : "No analysis available.";
    const lines = cleanText.split("\n").filter((line) => line.trim());

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      const isFirstLine = index === 0;
      const isNumberedHeading = /^\d+\.\s*[A-Z]/.test(trimmedLine);

      if (isNumberedHeading && yPosition > 100) {
        yPosition += 5;
      }

      if (isFirstLine) {
        pdf.setFontSize(12);
        pdf.setFont(undefined, "bold");
        pdf.setTextColor(0, 0, 0);
      } else if (isNumberedHeading) {
        pdf.setFontSize(11);
        pdf.setFont(undefined, "bold");
        pdf.setTextColor(41, 83, 124);
      } else {
        pdf.setFontSize(10);
        pdf.setFont(undefined, "normal");
        pdf.setTextColor(60, 60, 60);
      }

      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }

      const xPosition = isFirstLine || isNumberedHeading ? 20 : 25;
      if (!isFirstLine && !isNumberedHeading) {
        pdf.text("•", 20, yPosition);
      }

      let displayText = trimmedLine;
      if (/\b(High|HIGH|Critical|CRITICAL)\b/i.test(trimmedLine)) {
        pdf.setTextColor(220, 38, 38);
      } else if (/\b(Low|LOW)\b/i.test(trimmedLine)) {
        pdf.setTextColor(251, 146, 60);
      }

      const splitText = pdf.splitTextToSize(displayText, 170);
      pdf.text(splitText, xPosition, yPosition);
      yPosition += splitText.length * 7;
    });

    pdf.setTextColor(0, 0, 0);
    pdf.save(`${reportName}_analysis.pdf`);
  };

  useEffect(() => {
    // Debugging: Check if analysisResults are populated correctly
    console.log("Analysis Results:", analysisResults);
  }, [analysisResults]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Laboratory Reports</h3>
          <p className="text-sm text-gray-500 mt-1">Upload and analyze your medical lab reports</p>
          <p className="text-xs text-gray-400 mt-1">Uploading as: {user?.name} (ID: {realPatientId})</p>
        </div>
        <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
          <label className="cursor-pointer flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload Report
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </Button>
      </div>

      <div className="space-y-4">
        {uploadedFiles.map((report) => (
          <div
            key={report.id}
            className="border-2 border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  <p className="font-semibold text-gray-900">{report.name}</p>
                </div>
                <p className="text-sm text-gray-500 mt-1 ml-7">
                  Uploaded on {report.uploadDate}
                </p>
              </div>

              <div className="flex gap-2">
                {report.analyzed && analysisResults[report.id] && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadAnalysisAsPDF(analysisResults[report.id].analysis, report.name)}
                    className="bg-green-600 hover:bg-green-700 text-white border-0"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF
                  </Button>
                )}

                {!report.analyzed && (
                  <Button
                    size="sm"
                    onClick={() => handleAnalyzeAndSend(report)}
                    disabled={analyzing}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {analyzing ? "Analyzing..." : "Analyze Report"}
                  </Button>
                )}

                {report.analyzed && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Analyzed
                  </span>
                )}
              </div>
            </div>

            {/* Professional Analysis Display */}
            {analysisResults[report.id] && (
              <div className="mt-6 border-t-2 border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Analysis Report</h4>
                      <p className="text-xs text-gray-500">Generated {analysisResults[report.id].sentAt}</p>
                    </div>
                  </div>
                </div>

                {formatAnalysisText(analysisResults[report.id])}

                <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center text-green-700">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">Analysis sent to your doctor</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {uploadedFiles.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-600 font-medium">No lab reports uploaded</p>
            <p className="text-sm text-gray-500 mt-1">Upload your lab reports to get instant AI analysis</p>
          </div>
        )}
      </div>
    </div>
  );
}
