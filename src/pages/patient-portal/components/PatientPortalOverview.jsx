import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PatientPortalOverview = ({ patientData, onNavigateToTab, refreshTrigger }) => {
  const [todayMedications, setTodayMedications] = useState([]);
  const [activeMedicationsCount, setActiveMedicationsCount] = useState(0);

  useEffect(() => {
    loadTodayMedications();
    updateMedicationsCount();
  }, [patientData, refreshTrigger]);

  // Listen for medication updates
  useEffect(() => {
    const handleMedicationsUpdate = () => {
      loadTodayMedications();
    };
    window.addEventListener('medicationsUpdated', handleMedicationsUpdate);
    return () => window.removeEventListener('medicationsUpdated', handleMedicationsUpdate);
  }, [patientData]);

  const loadTodayMedications = () => {
    const patientId = patientData?.id;
    if (!patientId) return;
    
    const medicines = JSON.parse(localStorage.getItem('patientMedicines') || '[]');
    
    // Try filtering by patientId first
    let patientMeds = medicines.filter(m => m.patientId === patientId);
    
    // If no results, load everything as fallback
    if (patientMeds.length === 0) {
      patientMeds = medicines;
    }
    
    // Get all medicines from all prescription uploads
    const allMeds = patientMeds.flatMap(pm => pm.medicines || []);
    
    // Show first 3 for overview
    const todaysMeds = allMeds.slice(0, 3);
    
    setTodayMedications(todaysMeds);
  };

  const updateMedicationsCount = () => {
    const patientId = patientData?.id;
    if (!patientId) return;
    
    const medicines = JSON.parse(localStorage.getItem('patientMedicines') || '[]');
    
    // Try filtering by patientId first
    let patientMeds = medicines.filter(m => m.patientId === patientId);
    
    // If no results, load everything as fallback
    if (patientMeds.length === 0) {
      patientMeds = medicines;
    }
    
    // Count all medications
    const totalCount = patientMeds.reduce((sum, pm) => sum + (pm.medicines?.length || 0), 0);
    setActiveMedicationsCount(totalCount);
  };

  const handleMarkTaken = (medIndex) => {
    const patientId = patientData?.id;
    const smartReminders = JSON.parse(localStorage.getItem('smartReminders') || '[]');
    
    // Find or create reminder entry for this medication
    const med = todayMedications[medIndex];
    const existingIndex = smartReminders.findIndex(
      r => r.patientId === patientId && r.medicineName === (med.drugName || med.name)
    );

    if (existingIndex >= 0) {
      smartReminders[existingIndex].status = 'taken';
      smartReminders[existingIndex].takenAt = new Date().toISOString();
    } else {
      smartReminders.push({
        id: Date.now(),
        patientId,
        medicineName: med.drugName || med.name || 'Medication',
        status: 'taken',
        takenAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
    }

    localStorage.setItem('smartReminders', JSON.stringify(smartReminders));
    window.dispatchEvent(new Event('medicationsUpdated'));
    alert('Medication marked as taken!');
  };
  
  if (!patientData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Simple Welcome Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Welcome, {patientData.name}
            </h1>
            <p className="text-gray-600">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Icon name="User" size={32} className="text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Clean Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Medications Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <Icon name="Pill" size={20} className="text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {activeMedicationsCount}
            </div>
          </div>
          <p className="text-sm text-gray-600 font-medium">Active Medications</p>
          <button 
            onClick={() => onNavigateToTab('medications')}
            className="text-xs text-purple-600 hover:text-purple-700 mt-2 font-medium"
          >
            View all →
          </button>
        </div>

        {/* Adherence Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <Icon name="TrendingUp" size={20} className="text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {patientData.adherenceRate !== null ? `${patientData.adherenceRate}%` : 'N/A'}
            </div>
          </div>
          <p className="text-sm text-gray-600 font-medium">Adherence Rate</p>
          {patientData.adherenceRate !== null ? (
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
              <div 
                className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${patientData.adherenceRate || 0}%` }}
              />
            </div>
          ) : (
            <p className="text-xs text-gray-500 mt-2">No medications tracked yet</p>
          )}
        </div>

        {/* Appointments Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <Icon name="Calendar" size={20} className="text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {patientData.upcomingAppointments || 0}
            </div>
          </div>
          <p className="text-sm text-gray-600 font-medium">Appointments</p>
          <button 
            onClick={() => onNavigateToTab('appointments')}
            className="text-xs text-blue-600 hover:text-blue-700 mt-2 font-medium"
          >
            Schedule →
          </button>
        </div>

        {/* Last Visit Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
              <Icon name="Clock" size={20} className="text-orange-600" />
            </div>
            <div className="text-sm font-bold text-gray-900">
              {new Date(patientData.lastVisit).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>
          <p className="text-sm text-gray-600 font-medium">Last Doctor Visit</p>
          <p className="text-xs text-gray-500 mt-2">
            {Math.floor((new Date() - new Date(patientData.lastVisit)) / (1000 * 60 * 60 * 24))} days ago
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Section - Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onNavigateToTab('prescriptions')}
                className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
              >
                <Icon name="Upload" size={20} className="text-blue-600 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-gray-900 text-sm">Upload</div>
                  <div className="text-xs text-gray-600">Prescription</div>
                </div>
              </button>

              <button
                onClick={() => onNavigateToTab('health-logs')}
                className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
              >
                <Icon name="Activity" size={20} className="text-green-600 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-gray-900 text-sm">Log</div>
                  <div className="text-xs text-gray-600">Health Data</div>
                </div>
              </button>

              <button
                onClick={() => onNavigateToTab('lab-reports')}
                className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
              >
                <Icon name="FileText" size={20} className="text-orange-600 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-gray-900 text-sm">Upload</div>
                  <div className="text-xs text-gray-600">Lab Report</div>
                </div>
              </button>

              <button
                onClick={() => onNavigateToTab('messages')}
                className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
              >
                <Icon name="MessageCircle" size={20} className="text-purple-600 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-gray-900 text-sm">Message</div>
                  <div className="text-xs text-gray-600">Doctor</div>
                </div>
              </button>
            </div>
          </div>

          {/* Today's Medications Preview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Today's Medications</h3>
              <button 
                onClick={() => onNavigateToTab('medications')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All →
              </button>
            </div>
            
            {todayMedications.length > 0 ? (
              <div className="space-y-3">
                {todayMedications.map((med, i) => (
                  <div key={i} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <Icon name="Pill" size={16} className="text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{med.drugName || med.name || 'Medication'}</p>
                      <p className="text-xs text-gray-600">{med.dosage || ''} - {med.timings?.join(', ') || med.schedule || 'As prescribed'}</p>
                    </div>
                    <button 
                      onClick={() => handleMarkTaken(i)}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium hover:bg-green-200"
                    >
                      Mark Taken
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Icon name="Pill" size={40} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No medications for today</p>
                <p className="text-xs mt-1">Upload a prescription to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Doctor & Emergency */}
        <div className="space-y-6">
          
          {/* Doctor Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Doctor</h3>
            
            {patientData.primaryDoctor ? (
              <>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <Icon name="User" size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{patientData.primaryDoctor.name}</p>
                    <p className="text-sm text-gray-600">{patientData.primaryDoctor.specialty}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                    <Icon name="Phone" size={16} className="inline mr-2" />
                    Call Doctor
                  </button>
                  <button 
                    onClick={() => onNavigateToTab('messages')}
                    className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Icon name="MessageCircle" size={16} className="inline mr-2" />
                    Send Message
                  </button>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-600 text-center py-4">No doctor assigned yet</p>
            )}
          </div>

          {/* Emergency Card */}
          <div className="bg-red-50 rounded-lg border-2 border-red-200 p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
              <Icon name="AlertCircle" size={20} className="mr-2" />
              Emergency
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              {patientData.emergencyContact.name}
            </p>
            <button 
              onClick={() => onNavigateToTab('emergency')}
              className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
            >
              <Icon name="Phone" size={18} className="inline mr-2" />
              Emergency Call
            </button>
          </div>

          {/* Health Tip */}
          <div className="bg-green-50 rounded-lg border border-green-200 p-5">
            <div className="flex items-start">
              <Icon name="Lightbulb" size={20} className="text-green-600 mr-3 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-900 text-sm mb-1">Health Tip</h4>
                <p className="text-xs text-gray-700">
                  Take your medications at the same time daily for better results.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientPortalOverview;
