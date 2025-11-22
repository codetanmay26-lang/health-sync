import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityBadges = () => {
  const badges = [
    {
      id: 'hipaa',
      title: 'HIPAA Compliant',
      description: 'Healthcare data protection certified',
      icon: 'Shield',
      color: 'text-primary'
    },
    {
      id: 'ssl',
      title: 'SSL Encrypted',
      description: '256-bit encryption for all data',
      icon: 'Lock',
      color: 'text-success'
    },
    {
      id: 'gdpr',
      title: 'GDPR Ready',
      description: 'Privacy regulation compliant',
      icon: 'FileCheck',
      color: 'text-accent'
    },
    {
      id: 'iso',
      title: 'ISO 27001',
      description: 'Information security certified',
      icon: 'Award',
      color: 'text-warning'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          Trusted Healthcare Platform
        </h3>
        <p className="text-sm text-text-secondary">
          Your data is protected by industry-leading security standards
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {badges?.map((badge) => (
          <div
            key={badge?.id}
            className="flex items-center space-x-3 p-3 bg-surface border border-border rounded-lg hover:shadow-medical-sm transition-medical"
          >
            <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center ${badge?.color}`}>
              <Icon name={badge?.icon} size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-text-primary truncate">
                {badge?.title}
              </h4>
              <p className="text-xs text-text-secondary truncate">
                {badge?.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center pt-4 border-t border-border">
        <div className="flex items-center justify-center space-x-2 text-xs text-text-secondary">
          <Icon name="Clock" size={12} />
          <span>Last updated: September 2025</span>
        </div>
      </div>
    </div>
  );
};

export default SecurityBadges;