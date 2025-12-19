import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button.jsx';
import { useNavigate } from 'react-router-dom';

export default function AnalysisReportsPanel() {
  const [analyses, setAnalyses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load only UNREVIEWED analyses
    const storedAnalyses = JSON.parse(localStorage.getItem('doctorAnalyses') || '[]');
    const unreviewedAnalyses = storedAnalyses.filter(analysis => !analysis.reviewed);
    setAnalyses(unreviewedAnalyses.reverse());
  }, []);

  const markAsReviewed = (analysisId) => {
    // Move to reviewed reports
    const allAnalyses = JSON.parse(localStorage.getItem('doctorAnalyses') || '[]');
    const updatedAnalyses = allAnalyses.map(analysis => 
      analysis.id === analysisId 
        ? { ...analysis, reviewed: true, reviewedAt: new Date().toLocaleString() }
        : analysis
    );
    localStorage.setItem('doctorAnalyses', JSON.stringify(updatedAnalyses));
    
    // Remove from current view
    setAnalyses(prev => prev.filter(analysis => analysis.id !== analysisId));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          🤖 New AI Analysis Reports ({analyses.length})
        </h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/doctor-dashboard/reviewed-reports')}
        >
          View Reviewed Reports
        </Button>
      </div>
      
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
              </div>
              
              <Button 
                size="sm"
                onClick={() => markAsReviewed(analysis.id)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Mark as Reviewed
              </Button>
              <Button 
  variant="outline" 
  size="sm"
  onClick={() => navigate('/doctor-dashboard/reviewed-reports')}
>
  View Reviewed Reports
</Button>
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
            <p>No new AI analysis reports</p>
            <p className="text-sm">Reports will appear here when patients upload lab results</p>
          </div>
        )}
      </div>
    </div>
  );
}
