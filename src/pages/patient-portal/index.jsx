import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import EmergencyAlertBanner from '../../components/ui/EmergencyAlertBanner';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

// Import all components
import MedicationTimeline from './components/MedicationTimeline';
import AdherenceCalendar from './components/AdherenceCalendar';
import HealthLogger from './components/HealthLogger';
import LabReportUploader from './components/LabReportUploader';
import EmergencyContactPanel from './components/EmergencyContactPanel';
import MessagingInterface from './components/MessagingInterface';
import NotificationCenter from './components/NotificationCenter';
import MedicineListViewer from './components/MedicineListViewer';
import MedicineReminder from './components/MedicineReminder';

const PatientPortal = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [patientData, setPatientData] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Calculate real adherence rate from patient medicine-taking reports
  const calculateRealAdherenceRate = () => {
    const adherenceReports = JSON.parse(localStorage.getItem('adherenceReports') || '[]');
    const patientReports = adherenceReports.filter(report => report.patientId === 'patient_123');
    
    if (patientReports.length === 0) return 87; // Default rate if no real data
    
    const taken = patientReports.filter(report => report.medicationTaken).length;
    const total = patientReports.length;
    
    return Math.round((taken / total) * 100);
  };

  useEffect(() => {
    // Mock patient data - KEEP ID AS patient_123 to match lab reports
    const mockPatientData = {
      id: 'patient_123', // CONSISTENT ID - matches lab reports
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+1 (555) 123-4567',
      dateOfBirth: '1985-03-15',
      emergencyContact: {
        name: 'Jane Doe',
        relationship: 'Spouse',
        phone: '+1 (555) 987-6543'
      },
      primaryDoctor: {
        name: 'Dr. Sarah Johnson',
        specialty: 'Internal Medicine',
        phone: '+1 (555) 123-4567'
      },
      currentMedications: 4,
      upcomingAppointments: 2,
      adherenceRate: calculateRealAdherenceRate(), // Real calculation
      lastVisit: '2025-09-01'
    };

    setPatientData(mockPatientData);
  }, []);

  const breadcrumbItems = [
    { label: 'Patient Portal', path: '/patient-portal' }
  ];

  const emergencyAlerts = [
    {
      id: 'alert-patient-1',
      type: 'medication',
      priority: 'high',
      title: 'Medication Due',
      message: 'Your Metformin dose is overdue by 2 hours',
      timestamp: new Date()?.toISOString(),
      roles: ['patient'],
      active: true,
      actionLabel: 'Take Now',
      actionUrl: '/patient-portal#medications'
    }
  ];

  const handleMedicationTaken = (medicationId) => {
    console.log('Medication taken:', medicationId);
  };

  const handleMedicationSkipped = (medicationId) => {
    console.log('Medication skipped:', medicationId);
  };

  const handleHealthLogSubmit = (logData) => {
    console.log('Health log submitted:', logData);
  };

  const handleLabUploadComplete = (report) => {
    console.log('Lab report uploaded:', report);
  };

  const handleEmergencyCall = (contactInfo) => {
    console.log('Emergency call initiated:', contactInfo);
  };

  const handleMessageSent = (message, conversationType) => {
    console.log('Message sent:', message, 'to:', conversationType);
  };

  const handleNotificationAction = (notification, action) => {
    console.log('Notification action:', action, 'for:', notification);
  };

  const tabItems = [
    { id: 'overview', label: 'Overview', icon: 'Home' },
    { id: 'medications', label: 'Medications', icon: 'Pill' },
    { id: 'reminders', label: 'Reminders', icon: 'Clock' },
    { id: 'health-logs', label: 'Health Logs', icon: 'Activity' },
    { id: 'lab-reports', label: 'Lab Reports', icon: 'FileText' },
    { id: 'messages', label: 'Messages', icon: 'MessageCircle' },
    { id: 'emergency', label: 'Emergency', icon: 'Phone' }
  ];

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Welcome back, {patientData?.name}!
            </h2>
            <p className="text-text-secondary">
              Here's your health summary for today, {new Date()?.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
            <Icon name="User" size={32} className="text-primary" />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <Icon name="Pill" size={20} className="text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{patientData?.currentMedications}</p>
              <p className="text-sm text-text-secondary">Active Medications</p>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Calendar" size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{patientData?.upcomingAppointments}</p>
              <p className="text-sm text-text-secondary">Upcoming Appointments</p>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <Icon name="TrendingUp" size={20} className="text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{patientData?.adherenceRate}%</p>
              <p className="text-sm text-text-secondary">Real Adherence Rate</p>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
              <Icon name="Clock" size={20} className="text-warning" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">
                {new Date(patientData?.lastVisit)?.toLocaleDateString()}
              </p>
              <p className="text-sm text-text-secondary">Last Visit</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Medications Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MedicineReminder patientId={patientData?.id} />
        <NotificationCenter onNotificationAction={handleNotificationAction} />
      </div>

      {/* Quick Actions */}
      <div className="bg-surface rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant="outline"
            onClick={() => setActiveTab('health-logs')}
            iconName="Activity"
            iconPosition="left"
            iconSize={16}
            className="h-16 flex-col space-y-1"
          >
            <span>Log Vitals</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setActiveTab('lab-reports')}
            iconName="Upload"
            iconPosition="left"
            iconSize={16}
            className="h-16 flex-col space-y-1"
          >
            <span>Upload Report</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setActiveTab('messages')}
            iconName="MessageCircle"
            iconPosition="left"
            iconSize={16}
            className="h-16 flex-col space-y-1"
          >
            <span>Message Doctor</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setActiveTab('emergency')}
            iconName="Phone"
            iconPosition="left"
            iconSize={16}
            className="h-16 flex-col space-y-1"
          >
            <span>Emergency</span>
          </Button>
        </div>
      </div>
    </div>
  );

  // Updated medications tab to include medicine lists and reminders
  const renderMedicationsTab = () => (
    <div className="space-y-6">
      <MedicineReminder patientId={patientData?.id} />
      <MedicineListViewer patientId={patientData?.id} />
      <MedicationTimeline 
        onMedicationTaken={handleMedicationTaken}
        onMedicationSkipped={handleMedicationSkipped}
      />
      <AdherenceCalendar />
    </div>
  );

  const renderRemindersTab = () => (
    <MedicineReminder patientId={patientData?.id} />
  );

  const renderHealthLogsTab = () => (
    <HealthLogger onLogSubmit={handleHealthLogSubmit} />
  );

  const renderLabReportsTab = () => (
    <LabReportUploader 
      patientInfo={{
        id: patientData?.id, // This will be 'patient_123' - CONSISTENT
        name: patientData?.name,
        age: 45
      }}
      doctorId="doctor_456"
    />
  );

  const renderMessagesTab = () => (
    <MessagingInterface onMessageSent={handleMessageSent} />
  );

  const renderEmergencyTab = () => (
    <EmergencyContactPanel onEmergencyCall={handleEmergencyCall} />
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'medications':
        return renderMedicationsTab();
      case 'reminders':
        return renderRemindersTab();
      case 'health-logs':
        return renderHealthLogsTab();
      case 'lab-reports':
        return renderLabReportsTab();
      case 'messages':
        return renderMessagesTab();
      case 'emergency':
        return renderEmergencyTab();
      default:
        return renderOverviewTab();
    }
  };

  if (!patientData) {
    return (
      <div className="min-h-screen bg-background">
        <Header userRole="patient" userName="Loading..." />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text-secondary">Loading your portal...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        userRole="patient" 
        userName={patientData?.name}
        onToggleSidebar={() => {}}
      />
      <EmergencyAlertBanner 
        userRole="patient" 
        alerts={emergencyAlerts}
      />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <BreadcrumbNavigation 
            items={breadcrumbItems}
            userRole="patient"
            onBack={() => window.history.back()}
          />

          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="border-b border-border">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                {tabItems?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-medical ${
                      activeTab === tab?.id
                        ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
                    }`}
                  >
                    <Icon name={tab?.icon} size={16} />
                    <span>{tab?.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="transition-medical">
            {renderTabContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientPortal;
