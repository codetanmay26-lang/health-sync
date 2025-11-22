import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import SummaryMetricsCards from './components/SummaryMetricsCards';
import EmergencyAlertBanner from '../../components/ui/EmergencyAlertBanner';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import PatientListTable from './components/PatientListTable';
import FilterControls from './components/FilterControls';
import EmergencyAlertsPanel from './components/EmergencyAlertsPanel';
import AnalysisReportsPanel from './components/AnalysisReportsPanel';
import QuickActionsPanel from './components/QuickActionsPanel';

const DoctorDashboard = () => {
  const { user, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const [selectedPatients, setSelectedPatients] = useState([]);
  const [filters, setFilters] = useState({
    searchTerm: '',
    complianceFilter: 'all',
    riskFilter: 'all',
    dateRange: { start: '', end: '' }
  });

  // Mock patient data
  const mockPatients = [
    {
      id: 'p001',
      patientId: 'PT-2024-001',
      name: 'John Smith',
      age: 45,
      gender: 'Male',
      dischargeDate: '2024-01-15',
      adherenceRate: 92.5,
      complianceStatus: 'Excellent',
      riskLevel: 'Low',
      lastActivity: '2024-01-20T10:30:00Z',
      medications: ['Metformin 500mg', 'Lisinopril 10mg'],
      contactInfo: {
        phone: '+1 (555) 123-4567',
        email: 'john.smith@email.com'
      }
    },
    {
      id: 'p002',
      patientId: 'PT-2024-002',
      name: 'Sarah Johnson',
      age: 32,
      gender: 'Female',
      dischargeDate: '2024-01-18',
      adherenceRate: 78.3,
      complianceStatus: 'Good',
      riskLevel: 'Medium',
      lastActivity: '2024-01-20T14:15:00Z',
      medications: ['Warfarin 5mg', 'Atorvastatin 20mg'],
      contactInfo: {
        phone: '+1 (555) 234-5678',
        email: 'sarah.j@email.com'
      }
    },
    {
      id: 'p003',
      patientId: 'PT-2024-003',
      name: 'Michael Brown',
      age: 58,
      gender: 'Male',
      dischargeDate: '2024-01-12',
      adherenceRate: 45.2,
      complianceStatus: 'Poor',
      riskLevel: 'High',
      lastActivity: '2024-01-19T09:45:00Z',
      medications: ['Metoprolol 50mg', 'Furosemide 40mg'],
      contactInfo: {
        phone: '+1 (555) 345-6789',
        email: 'mbrown@email.com'
      }
    },
    {
      id: 'p004',
      patientId: 'PT-2024-004',
      name: 'Emily Davis',
      age: 28,
      gender: 'Female',
      dischargeDate: '2024-01-20',
      adherenceRate: 88.7,
      complianceStatus: 'Good',
      riskLevel: 'Low',
      lastActivity: '2024-01-20T16:20:00Z',
      medications: ['Levothyroxine 75mcg'],
      contactInfo: {
        phone: '+1 (555) 456-7890',
        email: 'emily.davis@email.com'
      }
    },
    {
      id: 'p005',
      patientId: 'PT-2024-005',
      name: 'Robert Wilson',
      age: 67,
      gender: 'Male',
      dischargeDate: '2024-01-10',
      adherenceRate: 34.8,
      complianceStatus: 'Poor',
      riskLevel: 'Critical',
      lastActivity: '2024-01-18T11:30:00Z',
      medications: ['Insulin Glargine', 'Metformin 1000mg', 'Amlodipine 5mg'],
      contactInfo: {
        phone: '+1 (555) 567-8901',
        email: 'r.wilson@email.com'
      }
    },
    {
      id: 'p006',
      patientId: 'PT-2024-006',
      name: 'Lisa Anderson',
      age: 41,
      gender: 'Female',
      dischargeDate: '2024-01-22',
      adherenceRate: 95.1,
      complianceStatus: 'Excellent',
      riskLevel: 'Low',
      lastActivity: '2024-01-20T13:45:00Z',
      medications: ['Omeprazole 20mg', 'Calcium 600mg'],
      contactInfo: {
        phone: '+1 (555) 678-9012',
        email: 'lisa.anderson@email.com'
      }
    },
    {
      id: 'p007',
      patientId: 'PT-2024-007',
      name: 'David Martinez',
      age: 52,
      gender: 'Male',
      dischargeDate: '2024-01-14',
      adherenceRate: 67.4,
      complianceStatus: 'Fair',
      riskLevel: 'Medium',
      lastActivity: '2024-01-20T08:15:00Z',
      medications: ['Simvastatin 40mg', 'Aspirin 81mg'],
      contactInfo: {
        phone: '+1 (555) 789-0123',
        email: 'dmartinez@email.com'
      }
    },
    {
      id: 'p008',
      patientId: 'PT-2024-008',
      name: 'Jennifer Taylor',
      age: 35,
      gender: 'Female',
      dischargeDate: '2024-01-16',
      adherenceRate: 82.9,
      complianceStatus: 'Good',
      riskLevel: 'Low',
      lastActivity: '2024-01-20T15:30:00Z',
      medications: ['Sertraline 50mg', 'Vitamin D3 2000IU'],
      contactInfo: {
        phone: '+1 (555) 890-1234',
        email: 'jtaylor@email.com'
      }
    }
  ];

  // Mock emergency alerts
  const mockAlerts = [
    {
      id: 'alert-001',
      type: 'critical',
      priority: 'critical',
      title: 'Critical Medication Non-Adherence',
      message: 'Patient has missed 3 consecutive doses of critical heart medication',
      patientName: 'Robert Wilson',
      patientId: 'PT-2024-005',
      timestamp: '2024-01-20T16:45:00Z',
      active: true,
      roles: ['doctor', 'admin'],
      details: {
        medication: 'Metoprolol 50mg',
        missedDoses: 3,
        lastTaken: '2024-01-17T08:00:00Z',
        riskLevel: 'Critical'
      },
      actions: [
        { type: 'call-patient', label: 'Call Patient', primary: true },
        { type: 'emergency-contact', label: 'Contact Emergency' }
      ]
    },
    {
      id: 'alert-002',
      type: 'vitals',
      priority: 'high',
      title: 'Abnormal Vital Signs Detected',
      message: 'Blood pressure readings consistently above normal range',
      patientName: 'Michael Brown',
      patientId: 'PT-2024-003',
      timestamp: '2024-01-20T15:20:00Z',
      active: true,
      roles: ['doctor', 'admin'],
      details: {
        systolic: 165,
        diastolic: 98,
        heartRate: 92,
        lastReading: '2024-01-20T15:00:00Z'
      },
      actions: [
        { type: 'review-vitals', label: 'Review Vitals', primary: true },
        { type: 'adjust-medication', label: 'Adjust Medication' }
      ]
    },
    {
      id: 'alert-003',
      type: 'medication',
      priority: 'medium',
      title: 'Medication Interaction Warning',
      message: 'Potential interaction detected between prescribed medications',
      patientName: 'Sarah Johnson',
      patientId: 'PT-2024-002',
      timestamp: '2024-01-20T14:30:00Z',
      active: true,
      roles: ['doctor', 'pharmacy'],
      details: {
        medication1: 'Warfarin 5mg',
        medication2: 'Aspirin 81mg',
        interactionLevel: 'Moderate',
        recommendation: 'Monitor INR levels closely'
      },
      actions: [
        { type: 'review-medications', label: 'Review Medications', primary: true }
      ]
    },
    {
      id: 'alert-004',
      type: 'appointment',
      priority: 'low',
      title: 'Upcoming Follow-up Appointment',
      message: 'Patient scheduled for follow-up visit tomorrow',
      patientName: 'Emily Davis',
      patientId: 'PT-2024-004',
      timestamp: '2024-01-20T12:00:00Z',
      active: true,
      roles: ['doctor'],
      details: {
        appointmentTime: '2024-01-21T10:00:00Z',
        type: 'Follow-up',
        duration: '30 minutes'
      },
      actions: [
        { type: 'review-chart', label: 'Review Chart', primary: true }
      ]
    }
  ];

  // Filter patients based on current filters
  const filteredPatients = useMemo(() => {
    return mockPatients.filter(patient => {
      // Search filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        if (!patient.name.toLowerCase().includes(searchLower) && 
            !patient.patientId.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Compliance filter
      if (filters.complianceFilter !== 'all') {
        if (patient.complianceStatus.toLowerCase() !== filters.complianceFilter) {
          return false;
        }
      }

      // Risk filter
      if (filters.riskFilter !== 'all') {
        if (patient.riskLevel.toLowerCase() !== filters.riskFilter) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateRange?.start || filters.dateRange?.end) {
        const dischargeDate = new Date(patient.dischargeDate);
        if (filters.dateRange?.start && dischargeDate < new Date(filters.dateRange.start)) {
          return false;
        }
        if (filters.dateRange?.end && dischargeDate > new Date(filters.dateRange.end)) {
          return false;
        }
      }

      return true;
    });
  }, [filters, mockPatients]);

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const totalPatients = filteredPatients.length;
    const overallAdherence = totalPatients > 0 
      ? filteredPatients.reduce((sum, p) => sum + p.adherenceRate, 0) / totalPatients
      : 0;
    
    const activeAlerts = mockAlerts.filter(alert => 
      alert.active && (alert.roles.includes(user?.role) || alert.roles.includes('all'))
    ).length;
    
    const criticalPatients = filteredPatients.filter(p => p.riskLevel === 'Critical').length;
    const pendingActions = selectedPatients.length + mockAlerts.filter(a => a.priority === 'critical').length;

    return [
      {
        id: 'total-patients',
        type: 'patients',
        title: 'Total Patients',
        value: totalPatients,
        unit: '',
        trend: 12,
        trendPeriod: 'vs last month',
        description: 'Active monitored patients',
        target: null,
        clickable: true
      },
      {
        id: 'overall-adherence',
        type: 'adherence',
        title: 'Overall Adherence',
        value: Math.round(overallAdherence * 10) / 10,
        unit: '%',
        trend: 2.1,
        trendPeriod: 'vs last week',
        description: 'Average medication adherence',
        target: 90,
        clickable: true
      },
      {
        id: 'active-alerts',
        type: 'alerts',
        title: 'Active Alerts',
        value: activeAlerts,
        unit: '',
        trend: -3,
        trendPeriod: 'vs yesterday',
        description: 'Requiring immediate attention',
        target: 0,
        clickable: true
      },
      {
        id: 'critical-patients',
        type: 'critical',
        title: 'Critical Patients',
        value: criticalPatients,
        unit: '',
        trend: -1,
        trendPeriod: 'vs yesterday',
        description: 'High-risk patients needing attention',
        target: 0,
        clickable: true
      }
    ];
  }, [filteredPatients, selectedPatients, mockAlerts, user?.role]);

  // Event handlers
  const handlePatientClick = (patient) => {
    // Navigate to patient profile
    window.location.href = `/patient-profile?id=${patient.id}`;
  };

  const handleBulkMessage = (patientIds) => {
    console.log('Sending bulk message to patients:', patientIds);
    // Implementation for bulk messaging
    alert(`Sending message to ${patientIds.length} patients`);
  };

  const handleAlertAction = (alertId, actionType) => {
    console.log('Alert action:', alertId, actionType);
    const alert = mockAlerts.find(a => a.id === alertId);
    if (alert) {
      alert(`Executing action: ${actionType} for patient ${alert.patientName}`);
    }
  };

  const handleDismissAlert = (alertId) => {
    console.log('Dismissing alert:', alertId);
    // Implementation for dismissing alerts
    alert(`Alert ${alertId} dismissed`);
  };

  const handleMetricCardClick = (metricId, metric) => {
    console.log('Metric card clicked:', metricId, metric);
    // Implementation for metric card navigation
    switch (metricId) {
      case 'total-patients':
        // Navigate to patient list view
        break;
      case 'overall-adherence':
        // Navigate to adherence analytics
        break;
      case 'active-alerts':
        // Navigate to alerts panel
        break;
      case 'critical-patients':
        // Filter to show only critical patients
        setFilters(prev => ({ ...prev, riskFilter: 'critical' }));
        break;
      default:
        break;
    }
  };

  const handleQuickAction = (actionType, action) => {
    console.log('Quick action:', actionType, action);
    // Implementation for quick actions
    switch (actionType) {
      case 'new-patient':
        alert('Opening new patient form');
        break;
      case 'schedule-appointment':
        alert('Opening appointment scheduler');
        break;
      case 'send-reminder':
        alert('Sending medication reminders');
        break;
      case 'generate-report':
        alert('Generating patient report');
        break;
      default:
        break;
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', clickable: false }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header 
        userRole={user?.role} 
        userName={user?.name}
        onToggleSidebar={() => {}}
      />
      
      {/* Emergency Alert Banner */}
      <EmergencyAlertBanner 
        userRole={user?.role}
        alerts={mockAlerts}
      />
      <AnalysisReportsPanel />
      {/* Main Content */}
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb Navigation */}
          <BreadcrumbNavigation 
            items={breadcrumbItems}
            userRole={user?.role}
            showBackButton={false}
            onBack={() => {}}
          />

          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-text-primary mb-2">
                  Welcome back, {user?.name || 'Doctor'}
                </h1>
                <p className="text-text-secondary">
                  Monitor patient compliance and manage post-discharge care coordination
                </p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-text-secondary">
                <div className="bg-card px-3 py-1 rounded-md border border-border">
                  {new Date().toLocaleDateString()}
                </div>
                <div className="bg-card px-3 py-1 rounded-md border border-border">
                  {filteredPatients.length} patients
                </div>
              </div>
            </div>
          </div>

          {/* Summary Metrics */}
          <SummaryMetricsCards 
            metrics={summaryMetrics}
            onCardClick={handleMetricCardClick}
          />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8">
            {/* Left Column - Patient Management */}
            <div className="lg:col-span-3 space-y-6">
              {/* Filter Controls */}
              <FilterControls 
                onFiltersChange={setFilters}
                patientCount={filteredPatients.length}
                totalPatients={mockPatients.length}
                currentFilters={filters}
              />

              {/* Patient List Table */}
              <PatientListTable 
                patients={filteredPatients}
                onPatientClick={handlePatientClick}
                onBulkMessage={handleBulkMessage}
                selectedPatients={selectedPatients}
                onPatientSelect={setSelectedPatients}
              />
            </div>

            {/* Right Column - Alerts and Actions */}
            <div className="lg:col-span-1 space-y-6">
              {/* Emergency Alerts Panel */}
              <EmergencyAlertsPanel 
                alerts={mockAlerts.filter(alert => 
                  alert.active && (alert.roles.includes(user?.role) || alert.roles.includes('all'))
                )}
                onAlertAction={handleAlertAction}
                onDismissAlert={handleDismissAlert}
              />

              {/* Quick Actions Panel */}
              <QuickActionsPanel 
                onActionClick={handleQuickAction}
                userRole={user?.role}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;
