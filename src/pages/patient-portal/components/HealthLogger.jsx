import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const HealthLogger = ({ onLogSubmit }) => {
  const [activeTab, setActiveTab] = useState('vitals');
  const [vitalsData, setVitalsData] = useState({
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    temperature: '',
    weight: '',
    bloodSugar: '',
    oxygenSaturation: ''
  });
  const [symptomsData, setSymptomsData] = useState({
    symptom: '',
    severity: '',
    duration: '',
    notes: ''
  });
  const [sideEffectsData, setSideEffectsData] = useState({
    medication: '',
    sideEffect: '',
    severity: '',
    notes: ''
  });

  const symptomOptions = [
    { value: 'headache', label: 'Headache' },
    { value: 'nausea', label: 'Nausea' },
    { value: 'dizziness', label: 'Dizziness' },
    { value: 'fatigue', label: 'Fatigue' },
    { value: 'chest_pain', label: 'Chest Pain' },
    { value: 'shortness_breath', label: 'Shortness of Breath' },
    { value: 'abdominal_pain', label: 'Abdominal Pain' },
    { value: 'joint_pain', label: 'Joint Pain' },
    { value: 'muscle_pain', label: 'Muscle Pain' },
    { value: 'other', label: 'Other' }
  ];

  const severityOptions = [
    { value: 'mild', label: 'Mild (1-3)' },
    { value: 'moderate', label: 'Moderate (4-6)' },
    { value: 'severe', label: 'Severe (7-10)' }
  ];

  const durationOptions = [
    { value: 'minutes', label: 'Minutes' },
    { value: 'hours', label: 'Hours' },
    { value: 'days', label: 'Days' },
    { value: 'weeks', label: 'Weeks' }
  ];

  const medicationOptions = [
    { value: 'metformin', label: 'Metformin' },
    { value: 'lisinopril', label: 'Lisinopril' },
    { value: 'atorvastatin', label: 'Atorvastatin' },
    { value: 'insulin', label: 'Insulin Glargine' },
    { value: 'other', label: 'Other' }
  ];

  const sideEffectOptions = [
    { value: 'nausea', label: 'Nausea' },
    { value: 'diarrhea', label: 'Diarrhea' },
    { value: 'constipation', label: 'Constipation' },
    { value: 'drowsiness', label: 'Drowsiness' },
    { value: 'dizziness', label: 'Dizziness' },
    { value: 'rash', label: 'Skin Rash' },
    { value: 'headache', label: 'Headache' },
    { value: 'insomnia', label: 'Insomnia' },
    { value: 'other', label: 'Other' }
  ];

  const handleVitalsChange = (field, value) => {
    setVitalsData(prev => ({ ...prev, [field]: value }));
  };

  const handleSymptomsChange = (field, value) => {
    setSymptomsData(prev => ({ ...prev, [field]: value }));
  };

  const handleSideEffectsChange = (field, value) => {
    setSideEffectsData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (type) => {
    const timestamp = new Date()?.toISOString();
    let logData = { type, timestamp };

    switch (type) {
      case 'vitals':
        logData = { ...logData, data: vitalsData };
        setVitalsData({
          bloodPressureSystolic: '',
          bloodPressureDiastolic: '',
          heartRate: '',
          temperature: '',
          weight: '',
          bloodSugar: '',
          oxygenSaturation: ''
        });
        break;
      case 'symptoms':
        logData = { ...logData, data: symptomsData };
        setSymptomsData({
          symptom: '',
          severity: '',
          duration: '',
          notes: ''
        });
        break;
      case 'sideEffects':
        logData = { ...logData, data: sideEffectsData };
        setSideEffectsData({
          medication: '',
          sideEffect: '',
          severity: '',
          notes: ''
        });
        break;
    }

    if (onLogSubmit) {
      onLogSubmit(logData);
    }

    // Show success message (in real app, this would be handled by parent component)
    alert('Health log entry submitted successfully!');
  };

  const getVitalStatus = (vital, value) => {
    const numValue = parseFloat(value);
    if (!numValue) return null;

    switch (vital) {
      case 'bloodPressureSystolic':
        if (numValue < 120) return { status: 'normal', color: 'text-success' };
        if (numValue < 140) return { status: 'elevated', color: 'text-warning' };
        return { status: 'high', color: 'text-error' };
      case 'heartRate':
        if (numValue >= 60 && numValue <= 100) return { status: 'normal', color: 'text-success' };
        return { status: 'abnormal', color: 'text-warning' };
      case 'temperature':
        if (numValue >= 97.0 && numValue <= 99.0) return { status: 'normal', color: 'text-success' };
        return { status: 'abnormal', color: 'text-warning' };
      case 'bloodSugar':
        if (numValue >= 70 && numValue <= 140) return { status: 'normal', color: 'text-success' };
        return { status: 'abnormal', color: 'text-warning' };
      case 'oxygenSaturation':
        if (numValue >= 95) return { status: 'normal', color: 'text-success' };
        return { status: 'low', color: 'text-error' };
      default:
        return null;
    }
  };

  const renderVitalsTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">Blood Pressure</label>
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Input
                type="number"
                placeholder="Systolic"
                value={vitalsData?.bloodPressureSystolic}
                onChange={(e) => handleVitalsChange('bloodPressureSystolic', e?.target?.value)}
                className="pr-12"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-text-secondary">
                mmHg
              </span>
              {getVitalStatus('bloodPressureSystolic', vitalsData?.bloodPressureSystolic) && (
                <Icon 
                  name="AlertCircle" 
                  size={16} 
                  className={`absolute right-8 top-1/2 transform -translate-y-1/2 ${getVitalStatus('bloodPressureSystolic', vitalsData?.bloodPressureSystolic)?.color}`}
                />
              )}
            </div>
            <span className="self-center text-text-secondary">/</span>
            <div className="flex-1 relative">
              <Input
                type="number"
                placeholder="Diastolic"
                value={vitalsData?.bloodPressureDiastolic}
                onChange={(e) => handleVitalsChange('bloodPressureDiastolic', e?.target?.value)}
                className="pr-12"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-text-secondary">
                mmHg
              </span>
            </div>
          </div>
        </div>

        <div className="relative">
          <Input
            label="Heart Rate"
            type="number"
            placeholder="Enter heart rate"
            value={vitalsData?.heartRate}
            onChange={(e) => handleVitalsChange('heartRate', e?.target?.value)}
            className="pr-12"
          />
          <span className="absolute right-3 top-9 text-sm text-text-secondary">bpm</span>
          {getVitalStatus('heartRate', vitalsData?.heartRate) && (
            <Icon 
              name="Heart" 
              size={16} 
              className={`absolute right-8 top-9 ${getVitalStatus('heartRate', vitalsData?.heartRate)?.color}`}
            />
          )}
        </div>

        <div className="relative">
          <Input
            label="Temperature"
            type="number"
            step="0.1"
            placeholder="Enter temperature"
            value={vitalsData?.temperature}
            onChange={(e) => handleVitalsChange('temperature', e?.target?.value)}
            className="pr-8"
          />
          <span className="absolute right-3 top-9 text-sm text-text-secondary">°F</span>
        </div>

        <div className="relative">
          <Input
            label="Weight"
            type="number"
            step="0.1"
            placeholder="Enter weight"
            value={vitalsData?.weight}
            onChange={(e) => handleVitalsChange('weight', e?.target?.value)}
            className="pr-8"
          />
          <span className="absolute right-3 top-9 text-sm text-text-secondary">lbs</span>
        </div>

        <div className="relative">
          <Input
            label="Blood Sugar"
            type="number"
            placeholder="Enter blood sugar"
            value={vitalsData?.bloodSugar}
            onChange={(e) => handleVitalsChange('bloodSugar', e?.target?.value)}
            className="pr-12"
          />
          <span className="absolute right-3 top-9 text-sm text-text-secondary">mg/dL</span>
          {getVitalStatus('bloodSugar', vitalsData?.bloodSugar) && (
            <Icon 
              name="Droplets" 
              size={16} 
              className={`absolute right-8 top-9 ${getVitalStatus('bloodSugar', vitalsData?.bloodSugar)?.color}`}
            />
          )}
        </div>

        <div className="relative">
          <Input
            label="Oxygen Saturation"
            type="number"
            placeholder="Enter O2 saturation"
            value={vitalsData?.oxygenSaturation}
            onChange={(e) => handleVitalsChange('oxygenSaturation', e?.target?.value)}
            className="pr-8"
          />
          <span className="absolute right-3 top-9 text-sm text-text-secondary">%</span>
          {getVitalStatus('oxygenSaturation', vitalsData?.oxygenSaturation) && (
            <Icon 
              name="Activity" 
              size={16} 
              className={`absolute right-8 top-9 ${getVitalStatus('oxygenSaturation', vitalsData?.oxygenSaturation)?.color}`}
            />
          )}
        </div>
      </div>

      <Button
        variant="default"
        onClick={() => handleSubmit('vitals')}
        iconName="Save"
        iconPosition="left"
        iconSize={16}
        className="w-full"
      >
        Log Vitals
      </Button>
    </div>
  );

  const renderSymptomsTab = () => (
    <div className="space-y-4">
      <Select
        label="Symptom"
        options={symptomOptions}
        value={symptomsData?.symptom}
        onChange={(value) => handleSymptomsChange('symptom', value)}
        placeholder="Select a symptom"
        searchable
      />

      <Select
        label="Severity"
        options={severityOptions}
        value={symptomsData?.severity}
        onChange={(value) => handleSymptomsChange('severity', value)}
        placeholder="Rate severity (1-10)"
      />

      <Select
        label="Duration"
        options={durationOptions}
        value={symptomsData?.duration}
        onChange={(value) => handleSymptomsChange('duration', value)}
        placeholder="How long have you experienced this?"
      />

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Additional Notes
        </label>
        <textarea
          className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          rows="4"
          placeholder="Describe your symptoms in detail..."
          value={symptomsData?.notes}
          onChange={(e) => handleSymptomsChange('notes', e?.target?.value)}
        />
      </div>

      <Button
        variant="default"
        onClick={() => handleSubmit('symptoms')}
        iconName="Save"
        iconPosition="left"
        iconSize={16}
        className="w-full"
      >
        Log Symptoms
      </Button>
    </div>
  );

  const renderSideEffectsTab = () => (
    <div className="space-y-4">
      <Select
        label="Medication"
        options={medicationOptions}
        value={sideEffectsData?.medication}
        onChange={(value) => handleSideEffectsChange('medication', value)}
        placeholder="Select medication"
        searchable
      />

      <Select
        label="Side Effect"
        options={sideEffectOptions}
        value={sideEffectsData?.sideEffect}
        onChange={(value) => handleSideEffectsChange('sideEffect', value)}
        placeholder="Select side effect"
        searchable
      />

      <Select
        label="Severity"
        options={severityOptions}
        value={sideEffectsData?.severity}
        onChange={(value) => handleSideEffectsChange('severity', value)}
        placeholder="Rate severity (1-10)"
      />

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Additional Notes
        </label>
        <textarea
          className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          rows="4"
          placeholder="Describe the side effect and any relevant details..."
          value={sideEffectsData?.notes}
          onChange={(e) => handleSideEffectsChange('notes', e?.target?.value)}
        />
      </div>

      <Button
        variant="default"
        onClick={() => handleSubmit('sideEffects')}
        iconName="Save"
        iconPosition="left"
        iconSize={16}
        className="w-full"
      >
        Log Side Effect
      </Button>
    </div>
  );

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-text-primary">Health Logger</h2>
        <p className="text-sm text-text-secondary mt-1">
          Track your vitals, symptoms, and medication side effects
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('vitals')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-medical ${
            activeTab === 'vitals' ?'bg-surface text-text-primary shadow-sm' :'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Icon name="Activity" size={16} />
          <span>Vitals</span>
        </button>
        <button
          onClick={() => setActiveTab('symptoms')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-medical ${
            activeTab === 'symptoms' ?'bg-surface text-text-primary shadow-sm' :'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Icon name="AlertTriangle" size={16} />
          <span>Symptoms</span>
        </button>
        <button
          onClick={() => setActiveTab('sideEffects')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-medical ${
            activeTab === 'sideEffects' ?'bg-surface text-text-primary shadow-sm' :'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Icon name="AlertCircle" size={16} />
          <span>Side Effects</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'vitals' && renderVitalsTab()}
      {activeTab === 'symptoms' && renderSymptomsTab()}
      {activeTab === 'sideEffects' && renderSideEffectsTab()}
    </div>
  );
};

export default HealthLogger;