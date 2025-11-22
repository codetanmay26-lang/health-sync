import React, { useState } from 'react';
import Button from '../../../components/ui/Button.jsx';
import { analyzePrescription, sendMedicineListToPatient } from '../../../utils/prescriptionAnalysis.js';
import pdfToText from 'react-pdftotext';
import Tesseract from 'tesseract.js';
import jsPDF from 'jspdf';

export default function PrescriptionUploader({ patientInfo, doctorId }) {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [medicineResults, setMedicineResults] = useState({});

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

const extractTextFromPrescription = async (file) => {
  try {
    if (file.type.startsWith('image/')) {
      // Convert image to base64 for Gemini Vision API
      const reader = new FileReader();
      const base64 = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(file);
      });
      
      // Use Gemini Vision API for handwritten prescription recognition
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': import.meta.env.VITE_GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { 
                text: "Extract all text from this prescription image, especially medicine names, dosages, and instructions. If handwriting is unclear, provide your best interpretation." 
              },
              { 
                inline_data: { 
                  mime_type: file.type, 
                  data: base64 
                }
              }
            ]
          }]
        })
      });
      
      const data = await response.json();
      const extractedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!extractedText || extractedText.trim().length < 10) {
        alert('Could not extract text from prescription image. Please try a clearer image.');
        return null;
      }
      
      return extractedText.trim();
      
    } else if (file.type === 'application/pdf') {
      // Extract from PDF using existing method
      const text = await pdfToText(file);
      if (!text || text.trim().length < 10) {
        alert('Could not extract text from PDF. Please try a different file.');
        return null;
      }
      return text.trim();
      
    } else if (file.type === 'text/plain') {
      // Read text files directly
      const text = await file.text();
      if (!text || text.trim().length < 10) {
        alert('Text file appears to be empty.');
        return null;
      }
      return text.trim();
      
    } else {
      // Try to read as text anyway
      const text = await file.text();
      if (!text || text.trim().length < 10) {
        alert('Could not read file content.');
        return null;
      }
      return text.trim();
    }
    
  } catch (error) {
    console.error('Error extracting text:', error);
    alert('Could not read prescription. Please try a different file format.');
    return null;
  }
};


  const handleAnalyzeAndSend = async (prescriptionFile) => {
    setAnalyzing(true);
    
    try {
      const prescriptionText = await extractTextFromPrescription(prescriptionFile.file);
      
      if (!prescriptionText) {
        setAnalyzing(false);
        return;
      }
      
      const medicineResult = await analyzePrescription(prescriptionText, patientInfo);
      
      if (medicineResult.success) {
        // Send to patient
        sendMedicineListToPatient(medicineResult, patientInfo.id, doctorId);
        
        // Update UI
        setMedicineResults(prev => ({
          ...prev,
          [prescriptionFile.id]: {
            ...medicineResult,
            sentAt: new Date().toLocaleString()
          }
        }));
        
        // Mark as analyzed
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === prescriptionFile.id ? { ...f, analyzed: true } : f
          )
        );
        
        alert('Prescription analyzed and medicine list sent to patient!');
      } else {
        alert('Error: ' + medicineResult.error);
      }
    } catch (error) {
      alert('Analysis failed: ' + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const downloadMedicineListAsPDF = (medicineList, fileName) => {
    const pdf = new jsPDF();
    
    pdf.setFontSize(16);
    pdf.text('Prescription Medicine List', 20, 30);
    
    pdf.setFontSize(12);
    pdf.text(`Patient: ${patientInfo.name}`, 20, 50);
    pdf.text(`Doctor: ${doctorId}`, 20, 65);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 80);
    
    pdf.setFontSize(10);
    const splitText = pdf.splitTextToSize(medicineList, 170);
    pdf.text(splitText, 20, 100);
    
    pdf.save(`${fileName}_medicines.pdf`);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Upload Prescriptions</h3>
        <Button variant="outline" size="sm">
          <label className="cursor-pointer">
            Upload Prescription
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
        {uploadedFiles.map((prescription) => (
          <div key={prescription.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{prescription.name}</p>
                <p className="text-sm text-gray-500">Uploaded: {prescription.uploadDate}</p>
              </div>
              
              <div className="flex gap-2">
                {/* Download Medicine List - only after analysis */}
                {prescription.analyzed && medicineResults[prescription.id] && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => downloadMedicineListAsPDF(
                      medicineResults[prescription.id].medicineList, 
                      prescription.name
                    )}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Download Medicine List
                  </Button>
                )}
                
                {/* Analyze Prescription - before analysis */}
                {!prescription.analyzed && (
                  <Button 
                    size="sm"
                    onClick={() => handleAnalyzeAndSend(prescription)}
                    disabled={analyzing}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {analyzing ? 'Analyzing...' : 'Extract Medicines'}
                  </Button>
                )}
                
                {/* Status - after analysis */}
                {prescription.analyzed && (
                  <Button variant="outline" size="sm" disabled className="text-green-600">
                    ✓ Sent to Patient
                  </Button>
                )}
              </div>
            </div>
            
            {/* Show Medicine List Results */}
            {medicineResults[prescription.id] && (
              <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-purple-900">💊 Extracted Medicines</h4>
                  <span className="text-xs text-purple-600">
                    Sent: {medicineResults[prescription.id].sentAt}
                  </span>
                </div>
                <div className="text-sm text-purple-800 whitespace-pre-line">
                  {medicineResults[prescription.id].medicineList}
                </div>
                <div className="mt-3 pt-2 border-t border-purple-200">
                  <p className="text-xs text-green-700 font-medium">
                    ✓ Medicine list sent to patient
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {uploadedFiles.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No prescriptions uploaded yet</p>
            <p className="text-sm">Upload prescription images/PDFs to extract medicine lists</p>
          </div>
        )}
      </div>
    </div>
  );
}
