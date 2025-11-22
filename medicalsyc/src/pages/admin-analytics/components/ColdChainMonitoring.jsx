import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ColdChainMonitoring = ({ coldChainData, breachLogs }) => {
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [showBreachDetails, setShowBreachDetails] = useState(false);

  const getTemperatureStatus = (temp, min, max) => {
    if (temp < min || temp > max) return 'critical';
    if (temp <= min + 1 || temp >= max - 1) return 'warning';
    return 'normal';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'text-error bg-error/10 border-error';
      case 'warning': return 'text-warning bg-warning/10 border-warning';
      case 'normal': return 'text-success bg-success/10 border-success';
      default: return 'text-text-secondary bg-muted border-border';
    }
  };

  const filteredData = selectedLocation === 'all' 
    ? coldChainData 
    : coldChainData?.filter(item => item?.location === selectedLocation);

  const recentBreaches = breachLogs?.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))?.slice(0, 10);

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Cold Chain Monitoring</h3>
        <div className="flex items-center space-x-2">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e?.target?.value)}
            className="px-3 py-1 border border-border rounded-lg bg-input text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Locations</option>
            <option value="main-pharmacy">Main Pharmacy</option>
            <option value="storage-room-a">Storage Room A</option>
            <option value="storage-room-b">Storage Room B</option>
            <option value="refrigerator-1">Refrigerator 1</option>
            <option value="refrigerator-2">Refrigerator 2</option>
          </select>
          <Button 
            variant="outline" 
            size="sm" 
            iconName="AlertTriangle" 
            iconPosition="left"
            onClick={() => setShowBreachDetails(true)}
          >
            View Breaches
          </Button>
        </div>
      </div>
      {/* Real-time Monitoring Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {filteredData?.map((sensor) => {
          const tempStatus = getTemperatureStatus(sensor?.currentTemp, sensor?.minTemp, sensor?.maxTemp);
          const humidityStatus = getTemperatureStatus(sensor?.currentHumidity, sensor?.minHumidity, sensor?.maxHumidity);
          
          return (
            <div key={sensor?.id} className={`p-4 rounded-lg border ${getStatusColor(tempStatus)}`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-text-primary">{sensor?.name}</h4>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${
                    tempStatus === 'critical' ? 'bg-error breathing-alert' :
                    tempStatus === 'warning'? 'bg-warning pulse-medical' : 'bg-success'
                  }`}></div>
                  <span className="text-xs text-text-secondary capitalize">{tempStatus}</span>
                </div>
              </div>
              <div className="space-y-3">
                {/* Temperature */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1">
                      <Icon name="Thermometer" size={14} />
                      <span className="text-sm text-text-secondary">Temperature</span>
                    </div>
                    <span className="text-lg font-bold text-text-primary">
                      {sensor?.currentTemp}°C
                    </span>
                  </div>
                  <div className="text-xs text-text-secondary">
                    Range: {sensor?.minTemp}°C - {sensor?.maxTemp}°C
                  </div>
                </div>

                {/* Humidity */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1">
                      <Icon name="Droplets" size={14} />
                      <span className="text-sm text-text-secondary">Humidity</span>
                    </div>
                    <span className="text-lg font-bold text-text-primary">
                      {sensor?.currentHumidity}%
                    </span>
                  </div>
                  <div className="text-xs text-text-secondary">
                    Range: {sensor?.minHumidity}% - {sensor?.maxHumidity}%
                  </div>
                </div>

                {/* Last Update */}
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span>Last update:</span>
                  <span>{new Date(sensor.lastUpdate)?.toLocaleTimeString()}</span>
                </div>

                {/* Medications Stored */}
                <div className="border-t border-border pt-2">
                  <div className="text-xs text-text-secondary mb-1">Medications stored:</div>
                  <div className="flex flex-wrap gap-1">
                    {sensor?.medications?.slice(0, 3)?.map((med, index) => (
                      <span key={index} className="px-2 py-1 bg-muted rounded text-xs">
                        {med}
                      </span>
                    ))}
                    {sensor?.medications?.length > 3 && (
                      <span className="px-2 py-1 bg-muted rounded text-xs">
                        +{sensor?.medications?.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-success/10 rounded-lg">
          <div className="text-2xl font-bold text-success">
            {filteredData?.filter(s => getTemperatureStatus(s?.currentTemp, s?.minTemp, s?.maxTemp) === 'normal')?.length}
          </div>
          <div className="text-sm text-success">Normal</div>
        </div>
        <div className="text-center p-3 bg-warning/10 rounded-lg">
          <div className="text-2xl font-bold text-warning">
            {filteredData?.filter(s => getTemperatureStatus(s?.currentTemp, s?.minTemp, s?.maxTemp) === 'warning')?.length}
          </div>
          <div className="text-sm text-warning">Warning</div>
        </div>
        <div className="text-center p-3 bg-error/10 rounded-lg">
          <div className="text-2xl font-bold text-error">
            {filteredData?.filter(s => getTemperatureStatus(s?.currentTemp, s?.minTemp, s?.maxTemp) === 'critical')?.length}
          </div>
          <div className="text-sm text-error">Critical</div>
        </div>
        <div className="text-center p-3 bg-primary/10 rounded-lg">
          <div className="text-2xl font-bold text-primary">
            {recentBreaches?.length}
          </div>
          <div className="text-sm text-primary">Recent Breaches</div>
        </div>
      </div>
      {/* Recent Alerts */}
      <div>
        <h4 className="font-medium text-text-primary mb-3">Recent Alerts</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {recentBreaches?.slice(0, 5)?.map((breach) => (
            <div key={breach?.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                <Icon 
                  name={breach?.severity === 'critical' ? 'AlertTriangle' : 'AlertCircle'} 
                  size={16} 
                  className={breach?.severity === 'critical' ? 'text-error' : 'text-warning'} 
                />
                <div>
                  <p className="text-sm font-medium text-text-primary">{breach?.location}</p>
                  <p className="text-xs text-text-secondary">{breach?.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-text-secondary">
                  {new Date(breach.timestamp)?.toLocaleString()}
                </p>
                <p className="text-xs text-text-secondary">
                  Duration: {breach?.duration}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Breach Details Modal */}
      {showBreachDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1030">
          <div className="bg-surface rounded-lg shadow-medical-md p-6 max-w-4xl mx-4 w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">Cold Chain Breach Logs</h3>
              <Button
                variant="ghost"
                size="icon"
                iconName="X"
                iconSize={20}
                onClick={() => setShowBreachDetails(false)}
              />
            </div>
            
            <div className="space-y-3">
              {breachLogs?.map((breach) => (
                <div key={breach?.id} className={`p-4 rounded-lg border ${
                  breach?.severity === 'critical' ? 'border-error bg-error/5' : 'border-warning bg-warning/5'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Icon 
                          name={breach?.severity === 'critical' ? 'AlertTriangle' : 'AlertCircle'} 
                          size={16} 
                          className={breach?.severity === 'critical' ? 'text-error' : 'text-warning'} 
                        />
                        <h4 className="font-medium text-text-primary">{breach?.location}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          breach?.severity === 'critical' ? 'bg-error/10 text-error' : 'bg-warning/10 text-warning'
                        }`}>
                          {breach?.severity}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary mb-2">{breach?.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-text-secondary">
                        <div>
                          <span className="font-medium">Start:</span><br />
                          {new Date(breach.timestamp)?.toLocaleString()}
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span><br />
                          {breach?.duration}
                        </div>
                        <div>
                          <span className="font-medium">Temperature:</span><br />
                          {breach?.temperature}°C
                        </div>
                        <div>
                          <span className="font-medium">Affected Items:</span><br />
                          {breach?.affectedMedications} medications
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColdChainMonitoring;