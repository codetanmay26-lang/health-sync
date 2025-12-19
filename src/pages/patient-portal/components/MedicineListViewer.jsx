import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button.jsx';
import jsPDF from 'jspdf';

export default function MedicineListViewer({ patientId }) {
  const [medicineList, setMedicineList] = useState([]);

  useEffect(() => {
    // Load medicine lists from localStorage
    const storedMedicines = JSON.parse(localStorage.getItem('patientMedicines') || '[]');
    const patientMedicines = storedMedicines.filter(medicine => medicine.patientId === patientId);
    setMedicineList(patientMedicines.reverse());
  }, [patientId]);

  const downloadMedicineList = (medicine) => {
    const pdf = new jsPDF();
    
    pdf.setFontSize(16);
    pdf.text('Your Medicine List', 20, 30);
    
    pdf.setFontSize(12);
    pdf.text(`From: Dr. ${medicine.doctorName}`, 20, 50);
    pdf.text(`Date: ${new Date(medicine.timestamp).toLocaleDateString()}`, 20, 65);
    
    pdf.setFontSize(10);
    const splitText = pdf.splitTextToSize(medicine.medicineList, 170);
    pdf.text(splitText, 20, 85);
    
    pdf.save(`medicines_${new Date(medicine.timestamp).toLocaleDateString()}.pdf`);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        💊 Your Medicine Lists ({medicineList.length})
      </h3>
      
      <div className="space-y-4">
        {medicineList.map((medicine) => (
          <div key={medicine.id} className="border border-purple-200 bg-purple-50 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900">
                  From: Dr. {medicine.doctorName}
                </h4>
                <p className="text-sm text-gray-600">
                  Prescribed: {new Date(medicine.timestamp).toLocaleDateString()}
                </p>
              </div>
              
              <Button 
                size="sm"
                onClick={() => downloadMedicineList(medicine)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Download List
              </Button>
            </div>
            
            <div className="bg-white p-3 rounded text-sm border">
              <div className="whitespace-pre-line text-gray-800">
                {medicine.medicineList}
              </div>
            </div>
          </div>
        ))}
        
        {medicineList.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No medicine lists yet</p>
            <p className="text-sm">Medicine lists from doctors will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
