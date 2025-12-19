import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button.jsx';

export default function MedicineReminder({ patientId }) {
  const [reminders, setReminders] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Load medicine schedules and create reminders
    const schedules = JSON.parse(localStorage.getItem('medicineSchedule') || '[]');
    const patientSchedules = schedules.filter(s => s.patientId === patientId && s.active);
    
    // Simple reminder system
    const todayReminders = patientSchedules.map(schedule => ({
      id: schedule.id,
      schedule: schedule.schedule,
      nextDue: getNextReminderTime(schedule.schedule),
      status: 'pending'
    }));
    
    setReminders(todayReminders);

    return () => clearInterval(timer);
  }, [patientId]);

  const getNextReminderTime = (scheduleText) => {
    // Simple time parsing - you can make this more sophisticated
    const now = new Date();
    if (scheduleText.toLowerCase().includes('morning')) {
      const morning = new Date(now);
      morning.setHours(8, 0, 0, 0);
      return morning > now ? morning : new Date(morning.getTime() + 24 * 60 * 60 * 1000);
    }
    if (scheduleText.toLowerCase().includes('evening')) {
      const evening = new Date(now);
      evening.setHours(18, 0, 0, 0);
      return evening > now ? evening : new Date(evening.getTime() + 24 * 60 * 60 * 1000);
    }
    return new Date(now.getTime() + 60 * 60 * 1000); // Default 1 hour
  };

  const markAsTaken = (reminderId) => {
    setReminders(prev => 
      prev.map(r => r.id === reminderId ? { ...r, status: 'taken' } : r)
    );

    // Report to doctor
    const adherenceReport = {
      patientId,
      medicationTaken: true,
      timestamp: new Date().toISOString(),
      reminderId
    };

    const reports = JSON.parse(localStorage.getItem('adherenceReports') || '[]');
    reports.push(adherenceReport);
    localStorage.setItem('adherenceReports', JSON.stringify(reports));
  };

  const markAsMissed = (reminderId) => {
    setReminders(prev => 
      prev.map(r => r.id === reminderId ? { ...r, status: 'missed' } : r)
    );

    // Report missed to doctor
    const adherenceReport = {
      patientId,
      medicationTaken: false,
      timestamp: new Date().toISOString(),
      reminderId
    };

    const reports = JSON.parse(localStorage.getItem('adherenceReports') || '[]');
    reports.push(adherenceReport);
    localStorage.setItem('adherenceReports', JSON.stringify(reports));

    // Emergency alert if too many missed
    const recentReports = reports.filter(r => 
      new Date() - new Date(r.timestamp) < 24 * 60 * 60 * 1000 && !r.medicationTaken
    );

    if (recentReports.length >= 3) {
      // Add emergency alert for doctor
      const alerts = JSON.parse(localStorage.getItem('doctorAlerts') || '[]');
      alerts.push({
        id: Date.now(),
        type: 'medication',
        priority: 'high',
        title: 'Patient Medication Non-Adherence',
        message: `Patient has missed ${recentReports.length} medications in 24 hours`,
        patientId,
        timestamp: new Date().toISOString(),
        active: true
      });
      localStorage.setItem('doctorAlerts', JSON.stringify(alerts));
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          ⏰ Medicine Reminders
        </h3>
        <div className="text-sm text-gray-600">
          {currentTime.toLocaleTimeString()}
        </div>
      </div>

      <div className="space-y-3">
        {reminders.map((reminder) => (
          <div key={reminder.id} className={`p-4 rounded-lg border-2 ${
            reminder.status === 'taken' ? 'border-green-200 bg-green-50' :
            reminder.status === 'missed' ? 'border-red-200 bg-red-50' :
            'border-yellow-200 bg-yellow-50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-900">Medicine Time</p>
                <p className="text-sm text-gray-600">
                  Next due: {reminder.nextDue.toLocaleTimeString()}
                </p>
                <div className="text-xs text-gray-500 mt-1">
                  {reminder.schedule.substring(0, 100)}...
                </div>
              </div>

              {reminder.status === 'pending' && (
                <div className="flex space-x-2">
                  <Button 
                    size="sm"
                    onClick={() => markAsTaken(reminder.id)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    ✓ Taken
                  </Button>
                  
                  <Button 
                    size="sm"
                    onClick={() => markAsMissed(reminder.id)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    ✗ Missed
                  </Button>
                </div>
              )}

              {reminder.status !== 'pending' && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  reminder.status === 'taken' ? 'bg-green-200 text-green-800' :
                  'bg-red-200 text-red-800'
                }`}>
                  {reminder.status === 'taken' ? '✓ Taken' : '✗ Missed'}
                </span>
              )}
            </div>
          </div>
        ))}

        {reminders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No active medicine reminders</p>
            <p className="text-sm">Create a schedule from your medicine lists</p>
          </div>
        )}
      </div>
    </div>
  );
}
