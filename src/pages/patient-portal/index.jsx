import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

// Import all components
import PatientPortalOverview from './components/PatientPortalOverview';
import HealthLogger from './components/HealthLogger';
import LabReportUploader from './components/LabReportUploader';
import EmergencyContactPanel from './components/EmergencyContactPanel';
import MessagingInterface from './components/MessagingInterface';
import MedicineReminder from './components/MedicineReminder';
import PrescriptionUploader from './components/PrescriptionUploader';

const PatientPortal = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [patientData, setPatientData] = useState(null);
  const [analyzedMedicines, setAnalyzedMedicines] = useState([]);
  const [allMedications, setAllMedications] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Calculate real adherence rate based on medication tracking
  const calculateRealAdherenceRate = () => {
    const patientId = user?.id || 'patient_123';
    
    // Get all smart reminders for the patient
    const smartReminders = JSON.parse(localStorage.getItem('smartReminders') || '[]');
    const patientReminders = smartReminders.filter(r => r.patientId === patientId);
    
    // If no medications prescribed yet, show "N/A" (return null to handle in UI)
    if (patientReminders.length === 0) return null;
    
    // Count taken vs total for today
    const today = new Date().toDateString();
    const todayReminders = patientReminders.filter(r => {
      const reminderDate = new Date(r.createdAt).toDateString();
      return reminderDate === today || r.status === 'taken' || r.status === 'pending';
    });
    
    if (todayReminders.length === 0) return 0;
    
    const takenCount = todayReminders.filter(r => r.status === 'taken').length;
    return Math.round((takenCount / todayReminders.length) * 100);
  };

  useEffect(() => {
    const patientId = user?.id || 'patient_123';
    
    const mockPatientData = {
      id: patientId,
      name: user?.name || 'Rakesh Sharma',
      email: user?.email || 'patient@healthsync.com',
      phone: '+1 (555) 123-4567',
      emergencyContact: {
        name: 'Emergency Services',
        relationship: 'Medical Emergency',
        phone: '911'
      },
      primaryDoctor: {
        name: 'Dr. Sarah Johnson',
        specialty: 'Internal Medicine'
      },
      currentMedications: 0,
      upcomingAppointments: 0,
      adherenceRate: calculateRealAdherenceRate(),
      lastVisit: '2025-09-01'
    };

    // Get real medication count from localStorage
    const patientMedicines = JSON.parse(localStorage.getItem('patientMedicines') || '[]');
    const patientMedsList = patientMedicines.filter(m => m.patientId === patientId);
    const totalMeds = patientMedsList.reduce((sum, pm) => sum + (pm.medicines?.length || 0), 0);
    mockPatientData.currentMedications = totalMeds;

    setPatientData(mockPatientData);
  }, [user, refreshTrigger]);

  // Load analyzed medicines and medications list
  useEffect(() => {
    if (patientData?.id) {
      // Load smart reminders
      const smartReminders = JSON.parse(localStorage.getItem('smartReminders') || '[]');
      const patientReminders = smartReminders.filter(r => r.patientId === patientData.id);
      setAnalyzedMedicines(patientReminders);
      
      // Load medications from patientMedicines
      const patientMedicines = JSON.parse(localStorage.getItem('patientMedicines') || '[]');
      
      // Get all medications (simple approach)
      let allMeds = [];
      if (patientMedicines.length > 0) {
        // Filter by patientId first
        const filteredByPatient = patientMedicines.filter(m => m.patientId === patientData.id);
        allMeds = filteredByPatient.flatMap(pm => pm.medicines || []);
        
        // If no results, load everything as fallback
        if (allMeds.length === 0) {
          allMeds = patientMedicines.flatMap(pm => pm.medicines || []);
        }
      }
      
      setAllMedications(allMeds);
    }
  }, [patientData?.id, refreshTrigger]);

  // Listen for medication updates
  useEffect(() => {
    const handleMedicationsUpdate = () => setRefreshTrigger(prev => prev + 1);
    window.addEventListener('medicationsUpdated', handleMedicationsUpdate);
    return () => window.removeEventListener('medicationsUpdated', handleMedicationsUpdate);
  }, []);

  const tabItems = [
    { id: 'overview', label: 'Overview', icon: 'Home' },
    { id: 'medications', label: 'Medications', icon: 'Pill' },
    { id: 'reminders', label: 'Reminders', icon: 'Clock' },
    { id: 'prescriptions', label: 'Upload Prescription', icon: 'Upload' },
    { id: 'health-logs', label: 'Health Logs', icon: 'Activity' },
    { id: 'lab-reports', label: 'Lab Reports', icon: 'FileText' },
    { id: 'messages', label: 'Messages', icon: 'MessageCircle' },
    { id: 'emergency', label: 'Emergency', icon: 'Phone' }
  ];

  // Medications Tab
  const renderMedicationsTab = () => {
    const getTimingColor = (timing) => ({
      morning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      afternoon: 'bg-orange-100 text-orange-800 border-orange-200',
      evening: 'bg-blue-100 text-blue-800 border-blue-200',
      night: 'bg-purple-100 text-purple-800 border-purple-200'
    }[timing] || 'bg-gray-100 text-gray-800 border-gray-200');

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Your Medications</h3>
        <p className="text-gray-600 text-sm mb-6">
          Medicines from uploaded prescriptions. Upload in "Upload Prescription" tab.
        </p>
        <div className="space-y-3">
          {allMedications.map((med, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Icon name="Pill" size={20} className="text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{med.name || 'Medication'}</h4>
                  <p className="text-sm text-gray-600">{med.dosage || ''}</p>
                  <p className="text-xs text-gray-500 mt-1">{med.notes || ''}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {(med.timings || ['morning']).map((timing, tidx) => (
                  <span key={tidx} className={`px-3 py-1 rounded-full text-xs font-medium border ${getTimingColor(timing)}`}>
                    {timing}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {allMedications.length === 0 && (
            <div className="text-center py-12">
              <Icon name="Pill" size={48} className="mx-auto mb-4 opacity-30" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Medications Found</h4>
              <p className="text-sm text-gray-600 mb-4">Upload a prescription to see medications</p>
              <Button variant="outline" size="sm" onClick={() => setActiveTab('prescriptions')} 
                iconName="Upload" iconPosition="left">Go to Upload Prescription</Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': 
        return (
          <PatientPortalOverview
            patientData={patientData}
            onNavigateToTab={setActiveTab}
            refreshTrigger={refreshTrigger}
          />
        );
      case 'medications': return renderMedicationsTab();
      case 'reminders': return <MedicineReminder patientId={patientData?.id} />;
      case 'prescriptions': return <PrescriptionUploader patientId={patientData?.id} />;
      case 'health-logs': return <HealthLogger />;
      case 'lab-reports': return <LabReportUploader patientInfo={{id: patientData?.id, name: patientData?.name, age: 45}} />;
      case 'messages': return <MessagingInterface />;
      case 'emergency': return <EmergencyContactPanel />;
      default: 
        return (
          <PatientPortalOverview
            patientData={patientData}
            onNavigateToTab={setActiveTab}
          />
        );
    }
  };

  if (!patientData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <BreadcrumbNavigation items={[{ label: 'Patient Portal', path: '/patient-portal' }]} onBack={() => window.history.back()} />
          
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                {tabItems.map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-all ${
                      activeTab === tab.id ? 'border-blue-600 text-blue-600' : 
                      'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}>
                    <Icon name={tab.icon} size={16} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div>{renderTabContent()}</div>
        </div>
      </main>
    </div>
  );
};

export default PatientPortal;
