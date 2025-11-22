import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const ColdChainMonitoring = ({ onAlertAcknowledge, onViewDetails }) => {
  const [sensorData, setSensorData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedStorage, setSelectedStorage] = useState('all');

  useEffect(() => {
    // Mock sensor data for the last 24 hours
    const generateSensorData = () => {
      const data = [];
      const now = new Date();
      const hoursBack = selectedTimeRange === '24h' ? 24 : selectedTimeRange === '7d' ? 168 : 720;
      
      for (let i = hoursBack; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
        data?.push({
          time: timestamp?.toISOString(),
          displayTime: i === 0 ? 'Now' : `${i}h ago`,
          refrigerator1Temp: 2 + Math.random() * 4 + (Math.random() > 0.95 ? 3 : 0), // Occasional spike
          refrigerator1Humidity: 45 + Math.random() * 10,
          refrigerator2Temp: 3 + Math.random() * 3,
          refrigerator2Humidity: 50 + Math.random() * 8,
          freezerTemp: -18 + Math.random() * 4,
          freezerHumidity: 30 + Math.random() * 15,
          roomTemp: 20 + Math.random() * 5,
          roomHumidity: 40 + Math.random() * 20
        });
      }
      return data;
    };

    setSensorData(generateSensorData());

    // Mock alerts
    const mockAlerts = [
      {
        id: 'alert-001',
        type: 'temperature',
        severity: 'critical',
        storage: 'Refrigerator 1',
        message: 'Temperature exceeded safe range (8.2°C)',
        timestamp: new Date(Date.now() - 300000)?.toISOString(),
        acknowledged: false,
        affectedMedications: ['Insulin Glargine', 'Vaccines'],
        duration: '5 minutes',
        currentValue: 8.2,
        threshold: 8.0
      },
      {
        id: 'alert-002',
        type: 'humidity',
        severity: 'warning',
        storage: 'Freezer',
        message: 'Humidity levels elevated (65%)',
        timestamp: new Date(Date.now() - 1800000)?.toISOString(),
        acknowledged: false,
        affectedMedications: ['Frozen Biologics'],
        duration: '30 minutes',
        currentValue: 65,
        threshold: 60
      },
      {
        id: 'alert-003',
        type: 'power',
        severity: 'warning',
        storage: 'Refrigerator 2',
        message: 'Power fluctuation detected',
        timestamp: new Date(Date.now() - 3600000)?.toISOString(),
        acknowledged: true,
        affectedMedications: ['Various refrigerated items'],
        duration: '2 minutes',
        resolvedAt: new Date(Date.now() - 3540000)?.toISOString()
      }
    ];
    setAlerts(mockAlerts);
  }, [selectedTimeRange]);

  const getAlertSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-error bg-error/10 border-error/20';
      case 'warning': return 'text-warning bg-warning/10 border-warning/20';
      case 'info': return 'text-primary bg-primary/10 border-primary/20';
      default: return 'text-text-secondary bg-muted border-border';
    }
  };

  const getStorageIcon = (storage) => {
    if (storage?.toLowerCase()?.includes('freezer')) return 'Snowflake';
    if (storage?.toLowerCase()?.includes('refrigerator')) return 'Thermometer';
    return 'Package';
  };

  const handleAcknowledgeAlert = (alertId) => {
    setAlerts(prev => 
      prev?.map(alert => 
        alert?.id === alertId 
          ? { ...alert, acknowledged: true, acknowledgedAt: new Date()?.toISOString() }
          : alert
      )
    );
    if (onAlertAcknowledge) {
      onAlertAcknowledge(alertId);
    }
  };

  const filteredData = selectedStorage === 'all' ? sensorData : 
    sensorData?.map(data => ({
      ...data,
      // Filter based on selected storage unit
    }));

  const activeAlerts = alerts?.filter(alert => !alert?.acknowledged);
  const acknowledgedAlerts = alerts?.filter(alert => alert?.acknowledged);

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Cold Chain Monitoring</h2>
          <p className="text-sm text-text-secondary mt-1">
            Real-time temperature and humidity monitoring • {activeAlerts?.length} active alerts
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e?.target?.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm bg-input text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          
          <select
            value={selectedStorage}
            onChange={(e) => setSelectedStorage(e?.target?.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm bg-input text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Storage Units</option>
            <option value="refrigerator1">Refrigerator 1</option>
            <option value="refrigerator2">Refrigerator 2</option>
            <option value="freezer">Freezer</option>
            <option value="room">Room Temperature</option>
          </select>
        </div>
      </div>
      {/* Active Alerts */}
      {activeAlerts?.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-text-primary mb-3 flex items-center">
            <Icon name="AlertTriangle" size={20} className="text-error mr-2" />
            Active Alerts ({activeAlerts?.length})
          </h3>
          <div className="space-y-3">
            {activeAlerts?.map((alert) => (
              <div key={alert?.id} className={`border rounded-lg p-4 ${getAlertSeverityColor(alert?.severity)} breathing-alert`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Icon name={getStorageIcon(alert?.storage)} size={20} />
                      <div>
                        <h4 className="font-medium">{alert?.storage}</h4>
                        <p className="text-sm opacity-90">{alert?.message}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3">
                      <div>
                        <span className="opacity-75">Current Value:</span>
                        <div className="font-medium">{alert?.currentValue}{alert?.type === 'temperature' ? '°C' : '%'}</div>
                      </div>
                      <div>
                        <span className="opacity-75">Threshold:</span>
                        <div className="font-medium">{alert?.threshold}{alert?.type === 'temperature' ? '°C' : '%'}</div>
                      </div>
                      <div>
                        <span className="opacity-75">Duration:</span>
                        <div className="font-medium">{alert?.duration}</div>
                      </div>
                      <div>
                        <span className="opacity-75">Time:</span>
                        <div className="font-medium">{new Date(alert.timestamp)?.toLocaleTimeString()}</div>
                      </div>
                    </div>
                    
                    {alert?.affectedMedications && (
                      <div className="mt-3">
                        <span className="text-sm opacity-75">Affected Medications:</span>
                        <div className="text-sm font-medium">{alert?.affectedMedications?.join(', ')}</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="Eye"
                      iconPosition="left"
                      iconSize={14}
                      onClick={() => onViewDetails && onViewDetails(alert)}
                    >
                      Details
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      iconName="Check"
                      iconPosition="left"
                      iconSize={14}
                      onClick={() => handleAcknowledgeAlert(alert?.id)}
                    >
                      Acknowledge
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Temperature Chart */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-text-primary mb-3">Temperature Monitoring</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="displayTime" 
                stroke="var(--color-text-secondary)"
                fontSize={12}
              />
              <YAxis 
                stroke="var(--color-text-secondary)"
                fontSize={12}
                label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--color-popover)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="refrigerator1Temp" 
                stroke="var(--color-primary)" 
                strokeWidth={2}
                name="Refrigerator 1"
              />
              <Line 
                type="monotone" 
                dataKey="refrigerator2Temp" 
                stroke="var(--color-accent)" 
                strokeWidth={2}
                name="Refrigerator 2"
              />
              <Line 
                type="monotone" 
                dataKey="freezerTemp" 
                stroke="var(--color-error)" 
                strokeWidth={2}
                name="Freezer"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Humidity Chart */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-text-primary mb-3">Humidity Monitoring</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="displayTime" 
                stroke="var(--color-text-secondary)"
                fontSize={12}
              />
              <YAxis 
                stroke="var(--color-text-secondary)"
                fontSize={12}
                label={{ value: 'Humidity (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--color-popover)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="refrigerator1Humidity" 
                stackId="1"
                stroke="var(--color-primary)" 
                fill="var(--color-primary)"
                fillOpacity={0.3}
                name="Refrigerator 1"
              />
              <Area 
                type="monotone" 
                dataKey="refrigerator2Humidity" 
                stackId="2"
                stroke="var(--color-accent)" 
                fill="var(--color-accent)"
                fillOpacity={0.3}
                name="Refrigerator 2"
              />
              <Area 
                type="monotone" 
                dataKey="freezerHumidity" 
                stackId="3"
                stroke="var(--color-warning)" 
                fill="var(--color-warning)"
                fillOpacity={0.3}
                name="Freezer"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Storage Unit Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { name: 'Refrigerator 1', temp: '4.2°C', humidity: '52%', status: 'normal', icon: 'Thermometer' },
          { name: 'Refrigerator 2', temp: '3.8°C', humidity: '48%', status: 'normal', icon: 'Thermometer' },
          { name: 'Freezer', temp: '-16.5°C', humidity: '35%', status: 'warning', icon: 'Snowflake' },
          { name: 'Room Storage', temp: '22.1°C', humidity: '45%', status: 'normal', icon: 'Package' }
        ]?.map((unit) => (
          <div key={unit?.name} className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <Icon name={unit?.icon} size={24} className="text-primary" />
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                unit?.status === 'normal' ? 'bg-success/10 text-success' :
                unit?.status === 'warning'? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'
              }`}>
                {unit?.status}
              </span>
            </div>
            <h4 className="font-medium text-text-primary mb-2">{unit?.name}</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Temperature:</span>
                <span className="font-medium text-text-primary">{unit?.temp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Humidity:</span>
                <span className="font-medium text-text-primary">{unit?.humidity}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColdChainMonitoring;