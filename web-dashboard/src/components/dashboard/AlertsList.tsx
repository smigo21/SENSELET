
import React, { useState, useEffect } from 'react';

interface Alert {
  id: number;
  type: 'Price Spike' | 'Crop Shortage' | 'Spoilage' | 'Cold Storage Failure' | 'Transport Delay';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  message: string;
  location: string;
  timestamp: string;
  acknowledged: boolean;
}

const AlertsList: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 1,
      type: 'Price Spike',
      severity: 'Critical',
      message: 'Maize prices increased by 35% in Addis Ababa market',
      location: 'Addis Ababa',
      timestamp: '2024-01-15 14:30',
      acknowledged: false
    },
    {
      id: 2,
      type: 'Transport Delay',
      severity: 'High',
      message: 'Route Addis Ababa → Jimma delayed by 2 hours',
      location: 'Addis Ababa → Jimma',
      timestamp: '2024-01-15 13:45',
      acknowledged: false
    },
    {
      id: 3,
      type: 'Spoilage',
      severity: 'High',
      message: 'Cold storage failure detected at Hawassa facility',
      location: 'Hawassa',
      timestamp: '2024-01-15 12:20',
      acknowledged: true
    },
    {
      id: 4,
      type: 'Crop Shortage',
      severity: 'Medium',
      message: 'Wheat shortage expected in Tigray region',
      location: 'Tigray',
      timestamp: '2024-01-15 11:15',
      acknowledged: false
    },
    {
      id: 5,
      type: 'Cold Storage Failure',
      severity: 'Critical',
      message: 'Temperature sensor failure at Bahir Dar storage',
      location: 'Bahir Dar',
      timestamp: '2024-01-15 10:30',
      acknowledged: false
    }
  ]);

  const [showPopup, setShowPopup] = useState(false);
  const [latestAlert, setLatestAlert] = useState<Alert | null>(null);

  // Simulate real-time alerts
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly add new alerts for demo
      if (Math.random() < 0.3) {
        const newAlert: Alert = {
          id: Date.now(),
          type: ['Price Spike', 'Crop Shortage', 'Spoilage', 'Cold Storage Failure', 'Transport Delay'][Math.floor(Math.random() * 5)] as Alert['type'],
          severity: ['Critical', 'High', 'Medium', 'Low'][Math.floor(Math.random() * 4)] as Alert['severity'],
          message: 'New alert generated for monitoring',
          location: ['Addis Ababa', 'Hawassa', 'Bahir Dar', 'Dire Dawa'][Math.floor(Math.random() * 4)],
          timestamp: new Date().toLocaleString(),
          acknowledged: false
        };
        setAlerts(prevAlerts => [newAlert, ...prevAlerts]);
        setLatestAlert(newAlert);
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 5000);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const acknowledgeAlert = (id: number) => {
    setAlerts(prevAlerts =>
      prevAlerts.map(alert =>
        alert.id === id ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'critical';
      case 'High': return 'high';
      case 'Medium': return 'medium';
      case 'Low': return 'low';
      default: return 'gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Price Spike': return '📈';
      case 'Crop Shortage': return '🌾';
      case 'Spoilage': return '🗑️';
      case 'Cold Storage Failure': return '❄️';
      case 'Transport Delay': return '🚚';
      default: return '⚠️';
    }
  };

  return (
    <div className="bg-card p-4 shadow-md rounded-md border">
      <h2 className="font-bold text-lg mb-4">Critical Alerts</h2>

      {/* Popup for new alerts */}
      {showPopup && latestAlert && (
        <div className="mb-4 p-3 bg-warning text-white rounded-md animate-pulse">
          <strong>New Alert:</strong> {latestAlert.message}
        </div>
      )}

      <div className="max-h-96 overflow-y-auto">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex justify-between items-center p-3 mb-2 rounded-md border-2 cursor-pointer transition-all hover:shadow-md ${
              alert.acknowledged ? 'bg-gray-100 opacity-70' : 'bg-white'
            }`}
            style={{ borderColor: `var(--tw-ring-color-${getSeverityColor(alert.severity)})` }}
            onClick={() => !alert.acknowledged && acknowledgeAlert(alert.id)}
          >
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <span className="text-lg mr-2">{getTypeIcon(alert.type)}</span>
                <strong className={`text-${getSeverityColor(alert.severity)}`}>{alert.type}</strong>
                <span className={`ml-2 px-2 py-1 rounded text-xs text-white bg-${getSeverityColor(alert.severity)}`}>
                  {alert.severity}
                </span>
              </div>
              <p className="text-sm mb-1">{alert.message}</p>
              <small className="text-gray-600">
                {alert.location} • {alert.timestamp}
              </small>
            </div>

            {!alert.acknowledged && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  acknowledgeAlert(alert.id);
                }}
                className="px-3 py-1 bg-safe text-white rounded hover:bg-green-600 transition-colors"
              >
                Acknowledge
              </button>
            )}
          </div>
        ))}
      </div>

      {alerts.length === 0 && (
        <div className="text-center py-8 text-gray-500 italic">
          No alerts at this time
        </div>
      )}
    </div>
  );
};

export default AlertsList;
