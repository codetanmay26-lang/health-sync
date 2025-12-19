import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import EmergencyAlertBanner from '../../components/ui/EmergencyAlertBanner';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import PatientHeader from './components/PatientHeader';
import MedicationTimeline from './components/MedicationTimeline';
import LabReportsViewer from './components/LabReportsViewer';
import HealthLogsChart from './components/HealthLogsChart';
import AISuggestions from './components/AISuggestions';
import ChatMessaging from './components/ChatMessaging';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const PatientProfile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('medications');
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock patient data
  const mockPatient = {
    id: "PT-2024-001",
    name: "John Michael Doe",
    age: 45,
    gender: "male",
    bloodType: "A+",
    phone: "(555) 123-4567",
    email: "john.doe@email.com",
    emergencyContact: "Jane Doe - (555) 987-6543",
    status: "monitoring",
    riskLevel: "medium",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    vitals: {
      heartRate: 78,
      bloodPressure: "135/85",
      temperature: 98.6,
      lastUpdated: "2025-01-08T10:30:00Z"
    },
    lastVisit: "2025-01-05",
    nextAppointment: "2025-01-15"
  };

  // Mock medications data
  const mockMedications = [
    {
      id: "med-001",
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      prescribedDate: "2024-12-15",
      duration: "90 days",
      adherence: 92,
      nextDose: "Tomorrow 8:00 AM",
      status: "active",
      instructions: "Take with food in the morning. Monitor blood pressure regularly.",
      aiWarnings: ["Potential interaction with potassium supplements", "Monitor kidney function"],
      recentDoses: [
        { time: "Today 8:00 AM", taken: true },
        { time: "Yesterday 8:00 AM", taken: true },
        { time: "Jan 6 8:00 AM", taken: false },
        { time: "Jan 5 8:00 AM", taken: true }
      ],
      sideEffects: ["Dry cough", "Dizziness", "Fatigue"]
    },
    {
      id: "med-002",
      name: "Metformin",
      dosage: "500mg",
      frequency: "Twice daily",
      prescribedDate: "2024-11-20",
      duration: "Ongoing",
      adherence: 88,
      nextDose: "Today 6:00 PM",
      status: "active",
      instructions: "Take with meals to reduce stomach upset. Monitor blood sugar levels.",
      aiWarnings: [],
      recentDoses: [
        { time: "Today 8:00 AM", taken: true },
        { time: "Yesterday 6:00 PM", taken: true },
        { time: "Yesterday 8:00 AM", taken: true },
        { time: "Jan 6 6:00 PM", taken: false }
      ],
      sideEffects: ["Nausea", "Stomach upset", "Metallic taste"]
    },
    {
      id: "med-003",
      name: "Atorvastatin",
      dosage: "20mg",
      frequency: "Once daily",
      prescribedDate: "2024-10-10",
      duration: "Ongoing",
      adherence: 95,
      nextDose: "Tomorrow 9:00 PM",
      status: "active",
      instructions: "Take in the evening. Avoid grapefruit juice.",
      aiWarnings: ["Monitor liver enzymes"],
      recentDoses: [
        { time: "Yesterday 9:00 PM", taken: true },
        { time: "Jan 6 9:00 PM", taken: true },
        { time: "Jan 5 9:00 PM", taken: true },
        { time: "Jan 4 9:00 PM", taken: true }
      ],
      sideEffects: ["Muscle pain", "Headache"]
    }
  ];

  // Mock lab reports data
  const mockLabReports = [
    {
      id: "lab-001",
      title: "Comprehensive Metabolic Panel",
      date: "2025-01-05",
      type: "blood",
      status: "abnormal",
      doctor: "Dr. Sarah Johnson",
      keyFindings: "Elevated glucose levels",
      fileType: "pdf",
      imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop",
      aiAnalysis: [
        {
          parameter: "Glucose",
          value: "145 mg/dL",
          reference: "70-100 mg/dL",
          status: "abnormal",
          notes: "Elevated fasting glucose indicates potential diabetes progression"
        },
        {
          parameter: "HbA1c",
          value: "7.2%",
          reference: "<7.0%",
          status: "abnormal",
          notes: "Above target range for diabetic patients"
        },
        {
          parameter: "Creatinine",
          value: "1.1 mg/dL",
          reference: "0.7-1.3 mg/dL",
          status: "normal",
          notes: "Kidney function within normal limits"
        }
      ],
      aiRecommendations: [
        "Consider adjusting Metformin dosage",
        "Schedule follow-up in 3 months",
        "Recommend dietary consultation",
        "Monitor blood pressure closely"
      ]
    },
    {
      id: "lab-002",
      title: "Lipid Panel",
      date: "2024-12-20",
      type: "blood",
      status: "normal",
      doctor: "Dr. Sarah Johnson",
      keyFindings: "Cholesterol levels improved",
      fileType: "image",
      imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=600&h=400&fit=crop",
      aiAnalysis: [
        {
          parameter: "Total Cholesterol",
          value: "185 mg/dL",
          reference: "<200 mg/dL",
          status: "normal",
          notes: "Significant improvement from previous test"
        },
        {
          parameter: "LDL",
          value: "110 mg/dL",
          reference: "<100 mg/dL",
          status: "abnormal",
          notes: "Slightly elevated but trending downward"
        },
        {
          parameter: "HDL",
          value: "45 mg/dL",
          reference: ">40 mg/dL",
          status: "normal",
          notes: "Within acceptable range"
        }
      ],
      aiRecommendations: [
        "Continue current statin therapy",
        "Increase physical activity",
        "Maintain low-fat diet"
      ]
    }
  ];

  // Mock health logs data
  const mockHealthLogs = [
    {
      date: "2025-01-08",
      heartRate: 78,
      bloodPressure: 135,
      temperature: 98.6,
      weight: 185,
      bloodSugar: 145,
      symptoms: ["Mild headache", "Fatigue"]
    },
    {
      date: "2025-01-07",
      heartRate: 82,
      bloodPressure: 140,
      temperature: 98.4,
      weight: 186,
      bloodSugar: 138,
      symptoms: ["Dizziness"]
    },
    {
      date: "2025-01-06",
      heartRate: 75,
      bloodPressure: 132,
      temperature: 98.7,
      weight: 185,
      bloodSugar: 142,
      symptoms: []
    },
    {
      date: "2025-01-05",
      heartRate: 80,
      bloodPressure: 138,
      temperature: 98.5,
      weight: 187,
      bloodSugar: 150,
      symptoms: ["Nausea"]
    },
    {
      date: "2025-01-04",
      heartRate: 77,
      bloodPressure: 134,
      temperature: 98.8,
      weight: 186,
      bloodSugar: 144,
      symptoms: []
    },
    {
      date: "2025-01-03",
      heartRate: 79,
      bloodPressure: 136,
      temperature: 98.3,
      weight: 185,
      bloodSugar: 141,
      symptoms: ["Mild fatigue"]
    },
    {
      date: "2025-01-02",
      heartRate: 81,
      bloodPressure: 139,
      temperature: 98.6,
      weight: 186,
      bloodSugar: 147,
      symptoms: []
    }
  ];

  // Mock AI suggestions data
  const mockAISuggestions = [
    {
      id: "ai-001",
      type: "medication",
      priority: "high",
      confidence: 87,
      title: "Metformin Dosage Adjustment Recommended",
      description: "Based on recent glucose levels and adherence patterns, consider increasing Metformin dosage to improve glycemic control.",
      evidence: [
        "HbA1c above target at 7.2%",
        "Fasting glucose consistently >140 mg/dL",
        "Good medication adherence (88%)",
        "No reported severe side effects"
      ],
      recommendations: [
        "Increase Metformin to 750mg twice daily",
        "Monitor for gastrointestinal side effects",
        "Recheck glucose levels in 2 weeks",
        "Consider adding SGLT2 inhibitor if no improvement"
      ],
      riskFactors: [
        "Potential for increased GI side effects",
        "Monitor kidney function closely"
      ],
      generatedAt: "2025-01-08 09:15 AM",
      reviewBy: "2025-01-10",
      dataSources: ["Lab Results", "Medication Adherence", "Patient History"],
      modelInfo: {
        name: "DiabetesOptimizer v2.1",
        version: "2.1.3",
        trainingData: "50K+ diabetic patients"
      }
    },
    {
      id: "ai-002",
      type: "risk",
      priority: "medium",
      confidence: 92,
      title: "Cardiovascular Risk Assessment",
      description: "Patient shows moderate cardiovascular risk based on current medication profile and lab results.",
      evidence: [
        "LDL cholesterol slightly elevated at 110 mg/dL",
        "Blood pressure trending upward",
        "Family history of heart disease",
        "Age and gender risk factors"
      ],
      recommendations: [
        "Consider ACE inhibitor optimization",
        "Increase statin intensity if tolerated",
        "Lifestyle counseling for diet and exercise",
        "Schedule cardiac risk stratification"
      ],
      riskFactors: [
        "Potential for medication interactions",
        "Monitor for muscle-related side effects"
      ],
      generatedAt: "2025-01-07 02:30 PM",
      reviewBy: "2025-01-12",
      dataSources: ["Lab Results", "Vital Signs", "Family History"],
      modelInfo: {
        name: "CardioRisk AI v1.8",
        version: "1.8.2",
        trainingData: "100K+ cardiac patients"
      }
    },
    {
      id: "ai-003",
      type: "monitoring",
      priority: "low",
      confidence: 78,
      title: "Enhanced Glucose Monitoring Suggested",
      description: "Consider continuous glucose monitoring to better understand glucose patterns and medication effectiveness.",
      evidence: [
        "Variable glucose readings",
        "Medication timing inconsistencies",
        "Patient reports feeling unaware of highs/lows"
      ],
      recommendations: [
        "Prescribe continuous glucose monitor",
        "Patient education on glucose patterns",
        "Adjust medication timing based on CGM data"
      ],
      riskFactors: [],
      generatedAt: "2025-01-06 11:45 AM",
      reviewBy: "2025-01-15",
      dataSources: ["Glucose Logs", "Medication Timing", "Patient Feedback"],
      modelInfo: {
        name: "GlucoseInsights v1.2",
        version: "1.2.1",
        trainingData: "25K+ CGM datasets"
      }
    }
  ];

  // Mock chat messages data
  const mockMessages = [
    {
      id: "msg-001",
      sender: "Dr. Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
      content: "Good morning John! I've reviewed your latest lab results. Your glucose levels are still a bit elevated. How are you feeling today?",
      timestamp: "2025-01-08T08:30:00Z",
      type: "text"
    },
    {
      id: "msg-002",
      sender: "John Michael Doe",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      content: "Hi Dr. Johnson! I'm feeling okay, though I've been having some mild headaches in the mornings. I've been taking my medications as prescribed.",
      timestamp: "2025-01-08T08:45:00Z",
      type: "text"
    },
    {
      id: "msg-003",
      sender: "PharmaCare Pharmacy",
      avatar: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=400&fit=crop&crop=face",
      content: "Prescription refill reminder: Your Metformin prescription is ready for pickup. We also have a question about your insurance coverage.",
      timestamp: "2025-01-08T09:15:00Z",
      type: "text"
    },
    {
      id: "msg-004",
      sender: "Dr. Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
      content: "I'm going to adjust your Metformin dosage based on your recent results. Please see the updated prescription details.",
      timestamp: "2025-01-08T10:00:00Z",
      type: "prescription"
    }
  ];

  // Mock chat participants
  const mockParticipants = [
    {
      id: "user-001",
      name: "Dr. Sarah Johnson",
      role: "doctor",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
      status: "online"
    },
    {
      id: "user-002",
      name: "John Michael Doe",
      role: "patient",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      status: "online"
    },
    {
      id: "user-003",
      name: "PharmaCare Pharmacy",
      role: "pharmacy",
      avatar: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=400&fit=crop&crop=face",
      status: "online"
    },
    {
      id: "user-004",
      name: "Nurse Jennifer",
      role: "nurse",
      avatar: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face",
      status: "away"
    }
  ];

  const currentUser = {
    name: "Dr. Sarah Johnson",
    role: "doctor"
  };

  // Mock emergency alerts
  const mockAlerts = [
    {
      id: 'alert-patient-001',
      type: 'patient',
      priority: 'medium',
      title: 'Medication Adherence Alert',
      message: 'John Doe missed 2 consecutive Metformin doses',
      timestamp: new Date()?.toISOString(),
      roles: ['doctor'],
      active: true,
      actionLabel: 'Contact Patient',
      actionUrl: '/patient-profile'
    }
  ];

  useEffect(() => {
    // Simulate loading patient data
    setTimeout(() => {
      setPatient(mockPatient);
      setLoading(false);
    }, 1000);
  }, []);

  const breadcrumbItems = [
    { label: 'Patients', path: '/doctor-dashboard' },
    { label: patient?.name || 'Loading...', clickable: false }
  ];

  const tabs = [
    { key: 'medications', label: 'Medications', icon: 'Pill', count: mockMedications?.length },
    { key: 'lab-reports', label: 'Lab Reports', icon: 'FileText', count: mockLabReports?.length },
    { key: 'health-logs', label: 'Health Logs', icon: 'BarChart3' },
    { key: 'ai-suggestions', label: 'AI Suggestions', icon: 'Brain', count: mockAISuggestions?.length },
    { key: 'messaging', label: 'Messages', icon: 'MessageCircle', count: 3 }
  ];

  const handleEditProfile = () => {
    console.log('Edit profile clicked');
  };

  const handleSendMessage = () => {
    setActiveTab('messaging');
  };

  const handleEmergencyContact = () => {
    console.log('Emergency contact initiated');
  };

  const handleEditMedication = (medication) => {
    console.log('Edit medication:', medication);
  };

  const handleAddMedication = () => {
    console.log('Add medication clicked');
  };

  const handleUploadReport = () => {
    console.log('Upload report clicked');
  };

  const handleViewReport = (report) => {
    console.log('View report:', report);
  };

  const handleAddLog = () => {
    console.log('Add health log clicked');
  };

  const handleAcceptSuggestion = (suggestion) => {
    console.log('Accept suggestion:', suggestion);
  };

  const handleDismissSuggestion = (suggestion) => {
    console.log('Dismiss suggestion:', suggestion);
  };

  const handleSendChatMessage = (message) => {
    console.log('Send message:', message);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header userRole="doctor" userName="Dr. Sarah Johnson" />
        <EmergencyAlertBanner userRole="doctor" alerts={mockAlerts} />
        
        <div className="pt-16">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
              <div className="bg-surface border border-border rounded-lg p-6 mb-6">
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-6 bg-muted rounded w-1/3"></div>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-96 bg-surface border border-border rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        userRole="doctor" 
        userName="Dr. Sarah Johnson" 
        onToggleSidebar={() => {}} 
      />
      <EmergencyAlertBanner userRole="doctor" alerts={mockAlerts} />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Breadcrumb Navigation */}
          <BreadcrumbNavigation 
            items={breadcrumbItems}
            userRole="doctor"
            onBack={() => navigate('/doctor-dashboard')}
          />

          {/* Patient Header */}
          <PatientHeader
            patient={patient}
            onEditProfile={handleEditProfile}
            onSendMessage={handleSendMessage}
            onEmergencyContact={handleEmergencyContact}
          />

          {/* Tab Navigation */}
          <div className="bg-surface border border-border rounded-lg mb-6">
            <div className="border-b border-border">
              <nav className="flex space-x-8 px-6">
                {tabs?.map((tab) => (
                  <button
                    key={tab?.key}
                    onClick={() => setActiveTab(tab?.key)}
                    className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-medical ${
                      activeTab === tab?.key
                        ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
                    }`}
                  >
                    <Icon name={tab?.icon} size={16} />
                    <span>{tab?.label}</span>
                    {tab?.count !== undefined && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        activeTab === tab?.key
                          ? 'bg-primary/10 text-primary' : 'bg-muted text-text-secondary'
                      }`}>
                        {tab?.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'medications' && (
                <MedicationTimeline
                  medications={mockMedications}
                  onEditMedication={handleEditMedication}
                  onAddMedication={handleAddMedication}
                />
              )}

              {activeTab === 'lab-reports' && (
                <LabReportsViewer
                  labReports={mockLabReports}
                  onUploadReport={handleUploadReport}
                  onViewReport={handleViewReport}
                />
              )}

              {activeTab === 'health-logs' && (
                <HealthLogsChart
                  healthLogs={mockHealthLogs}
                  onAddLog={handleAddLog}
                />
              )}

              {activeTab === 'ai-suggestions' && (
                <AISuggestions
                  suggestions={mockAISuggestions}
                  onAcceptSuggestion={handleAcceptSuggestion}
                  onDismissSuggestion={handleDismissSuggestion}
                />
              )}

              {activeTab === 'messaging' && (
                <ChatMessaging
                  messages={mockMessages}
                  participants={mockParticipants}
                  currentUser={currentUser}
                  onSendMessage={handleSendChatMessage}
                />
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-16 justify-start"
              iconName="Calendar"
              iconPosition="left"
              onClick={() => console.log('Schedule appointment')}
            >
              <div className="text-left">
                <div className="font-medium">Schedule Appointment</div>
                <div className="text-sm text-text-secondary">Next available: Jan 15</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-16 justify-start"
              iconName="FileText"
              iconPosition="left"
              onClick={() => console.log('Generate report')}
            >
              <div className="text-left">
                <div className="font-medium">Generate Report</div>
                <div className="text-sm text-text-secondary">Patient summary</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-16 justify-start"
              iconName="Share"
              iconPosition="left"
              onClick={() => console.log('Share profile')}
            >
              <div className="text-left">
                <div className="font-medium">Share Profile</div>
                <div className="text-sm text-text-secondary">With care team</div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;