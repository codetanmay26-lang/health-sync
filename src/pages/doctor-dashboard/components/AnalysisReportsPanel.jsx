import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button.jsx';

export default function AnalysisReportsPanel() {
  const [analyses, setAnalyses] = useState([]);

  useEffect(() => {
    // Load analyses from localStorage
    const storedAnalyses = JSON.parse(localStorage.getItem('doctorAnalyses') || '[]');
    setAnalyses(storedAnalyses.reverse()); // Show newest first
  }, []);

  const markAsReviewed = (analysisId) => {
    const updatedAnalyses = analyses.map(analysis => 
      analysis.id === analysisId 
        ? { ...analysis, reviewed: true, reviewedAt: new Date().toLocaleString() }
        : analysis
    );
    setAnalyses(updatedAnalyses);
    localStorage.setItem('doctorAnalyses', JSON.stringify(updatedAnalyses.reverse()));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        🤖 AI Analysis Reports ({analyses.length})
      </h3>
      
      <div className="space-y-4">
        {analyses.map((analysis) => (
          <div key={analysis.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900">
                  Patient: {analysis.patientName || 'Unknown'}
                </h4>
                <p className="text-sm text-gray-500">
                  Analyzed: {new Date(analysis.timestamp).toLocaleString()}
                </p>
                {analysis.reviewed && (
                  <p className="text-xs text-green-600">
                    ✓ Reviewed: {analysis.reviewedAt}
                  </p>
                )}
              </div>
              
              {!analysis.reviewed && (
                <Button 
                  size="sm"
                  onClick={() => markAsReviewed(analysis.id)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Mark as Reviewed
                </Button>
              )}
            </div>
            
            <div className="bg-gray-50 p-3 rounded text-sm">
              <div className="whitespace-pre-line text-gray-800">
                {analysis.analysis}
              </div>
            </div>
          </div>
        ))}
        
        {analyses.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No AI analysis reports yet</p>
            <p className="text-sm">Reports will appear here when patients upload lab results</p>
          </div>
        )}
      </div>
    </div>
  );
}
