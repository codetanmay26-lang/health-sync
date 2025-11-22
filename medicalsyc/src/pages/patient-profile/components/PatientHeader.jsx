import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const PatientHeader = ({ patient, onEditProfile, onSendMessage, onEmergencyContact }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'stable': return 'bg-success/10 text-success';
      case 'monitoring': return 'bg-warning/10 text-warning';
      case 'critical': return 'bg-error/10 text-error';
      default: return 'bg-muted text-text-secondary';
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'low': return 'text-success';
      case 'medium': return 'text-warning';
      case 'high': return 'text-error';
      default: return 'text-text-secondary';
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          {/* Patient Avatar */}
          <div className="relative">
            <Image
              src={patient?.avatar}
              alt={patient?.name}
              className="w-20 h-20 rounded-full object-cover"
            />
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${getStatusColor(patient?.status)}`}>
              <Icon 
                name={patient?.status === 'stable' ? 'Check' : patient?.status === 'monitoring' ? 'Eye' : 'AlertTriangle'} 
                size={12} 
              />
            </div>
          </div>

          {/* Patient Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-semibold text-text-primary">{patient?.name}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(patient?.status)}`}>
                {patient?.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-text-secondary">Patient ID:</span>
                <p className="font-medium text-text-primary">{patient?.id}</p>
              </div>
              <div>
                <span className="text-text-secondary">Age:</span>
                <p className="font-medium text-text-primary">{patient?.age} years</p>
              </div>
              <div>
                <span className="text-text-secondary">Gender:</span>
                <p className="font-medium text-text-primary capitalize">{patient?.gender}</p>
              </div>
              <div>
                <span className="text-text-secondary">Blood Type:</span>
                <p className="font-medium text-text-primary">{patient?.bloodType}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-3">
              <div>
                <span className="text-text-secondary">Phone:</span>
                <p className="font-medium text-text-primary">{patient?.phone}</p>
              </div>
              <div>
                <span className="text-text-secondary">Email:</span>
                <p className="font-medium text-text-primary">{patient?.email}</p>
              </div>
              <div>
                <span className="text-text-secondary">Emergency Contact:</span>
                <p className="font-medium text-text-primary">{patient?.emergencyContact}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            iconName="MessageCircle"
            iconPosition="left"
            onClick={onSendMessage}
          >
            Message
          </Button>
          <Button
            variant="outline"
            size="sm"
            iconName="Edit"
            iconPosition="left"
            onClick={onEditProfile}
          >
            Edit Profile
          </Button>
          <Button
            variant="destructive"
            size="sm"
            iconName="Phone"
            iconPosition="left"
            onClick={onEmergencyContact}
          >
            Emergency
          </Button>
        </div>
      </div>
      {/* Health Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Icon name="Heart" size={16} className="text-error" />
            <span className="text-sm text-text-secondary">Heart Rate</span>
          </div>
          <p className="text-lg font-semibold text-text-primary">{patient?.vitals?.heartRate} bpm</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Icon name="Activity" size={16} className="text-primary" />
            <span className="text-sm text-text-secondary">Blood Pressure</span>
          </div>
          <p className="text-lg font-semibold text-text-primary">{patient?.vitals?.bloodPressure}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Icon name="Thermometer" size={16} className="text-warning" />
            <span className="text-sm text-text-secondary">Temperature</span>
          </div>
          <p className="text-lg font-semibold text-text-primary">{patient?.vitals?.temperature}°F</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Icon name="TrendingUp" size={16} className={getRiskColor(patient?.riskLevel)} />
            <span className="text-sm text-text-secondary">Risk Level</span>
          </div>
          <p className={`text-lg font-semibold capitalize ${getRiskColor(patient?.riskLevel)}`}>
            {patient?.riskLevel}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientHeader;