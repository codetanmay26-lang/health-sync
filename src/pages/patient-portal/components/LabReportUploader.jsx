import React, { useState } from 'react';
import Button from '../../../components/ui/Button.jsx';
import { analyzeLabReport, sendAnalysisToDoctor } from '../../../utils/aiAnalysis';

export default function LabReportUploader({ patientInfo, doctorId }) {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState({});

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      uploadDate: new Date().toLocaleDateString(),
      analyzed: false
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const extractTextFromFile = async (file) => {
    if (file.type === 'text/plain') {
      return await file.text();
    }
    // Demo content - replace with actual PDF/image text extraction
    return `Lab Report: ${file.name}
    
Patient: ${patientInfo.name}
Test Results:
- Glucose: 95 mg/dL (Normal range: 70-100 mg/dL)
- Cholesterol: 220 mg/dL (High - Normal < 200 mg/dL)
- Hemoglobin: 14.2 g/dL (Normal range: 13.5-17.5 g/dL)
- White Blood Cells: 8,500 cells/μL (Normal range: 4,000-11,000 cells/μL)
- Blood Pressure: 140/90 mmHg (High - Normal < 120/80 mmHg)`;
  };

  const handleAnalyzeAndSend = async (reportFile) => {
    setAnalyzing(true);
    
    try {
      const reportText = await extractTextFromFile(reportFile.file);
      const analysisResult = await analyzeLabReport(reportText, patientInfo);
      
      if (analysisResult.success) {
        // Send to doctor (stored locally)
        sendAnalysisToDoctor(analysisResult, doctorId, patientInfo.id);
        
        // Update UI with analysis
        setAnalysisResults(prev => ({
          ...prev,
          [reportFile.id]: {
            ...analysisResult,
            sentAt: new Date().toLocaleString()
          }
        }));
        
        // Mark as analyzed
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === reportFile.id ? { ...f, analyzed: true } : f
          )
        );
        
        alert('Report analyzed successfully!');
      } else {
        alert('Error: ' + analysisResult.error);
      }
    } catch (error) {
      alert('Analysis failed: ' + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Lab Reports</h3>
        <Button variant="outline" size="sm">
          <label className="cursor-pointer">
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
          <div key={report.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{report.name}</p>
                <p className="text-sm text-gray-500">Uploaded: {report.uploadDate}</p>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">View</Button>
                
                {!report.analyzed && (
                  <Button 
                    size="sm"
                    onClick={() => handleAnalyzeAndSend(report)}
                    disabled={analyzing}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {analyzing ? 'Analyzing...' : 'AI Analyze'}
                  </Button>
                )}
                
                {report.analyzed && (
                  <Button variant="outline" size="sm" disabled className="text-green-600">
                    ✓ Analyzed
                  </Button>
                )}
              </div>
            </div>
            
            {/* Show AI Analysis Results */}
            {analysisResults[report.id] && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-blue-900">🤖 AI Analysis</h4>
                  <span className="text-xs text-blue-600">
                    Analyzed: {analysisResults[report.id].sentAt}
                  </span>
                </div>
                <div className="text-sm text-blue-800 whitespace-pre-line">
                  {analysisResults[report.id].analysis}
                </div>
                <div className="mt-3 pt-2 border-t border-blue-200">
                  <p className="text-xs text-green-700 font-medium">
                    ✓ Analysis sent to your doctor
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {uploadedFiles.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No reports uploaded yet</p>
            <p className="text-sm">Upload lab reports for AI analysis</p>
          </div>
        )}
      </div>
    </div>
  );
}
