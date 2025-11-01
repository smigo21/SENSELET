import React, { useState, useEffect } from 'react';
import { COLORS, getSeverityColor, getStatusColor } from '../constants/theme';

interface Alert {
  id: number;
  type: 'Price Spike' | 'Crop Shortage' | 'Spoilage' | 'Cold Storage Failure' | 'Transport Delay';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  message: string;
  location: string;
  timestamp: string;
  acknowledged: boolean;
}

const AlertList: React.FC = () => {
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
        setAlerts(prev => [newAlert, ...prev.slice(0, 9)]); // Keep only 10 most recent
        setLatestAlert(newAlert);
        setShowPopup(true);

        // Auto-hide popup after 5 seconds
        setTimeout(() => setShowPopup(false), 5000);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

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

  const acknowledgeAlert = (id: number) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === id ? { ...alert, acknowledged: true } : alert
    ));
  };

  const criticalAlerts = alerts.filter(alert => alert.severity === 'Critical' && !alert.acknowledged);
  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3>Alerts & Notifications</h3>
        <div style={{ fontSize: '0.9em', color: COLORS.TEXT_LIGHT }}>
          {criticalAlerts.length > 0 && (
            <span style={{ color: COLORS.CRITICAL, fontWeight: 'bold', marginRight: '10px' }}>
              🚨 {criticalAlerts.length} Critical
            </span>
          )}
          {unacknowledgedAlerts.length} Unacknowledged
        </div>
      </div>

      {/* Live Alert Popup */}
      {showPopup && latestAlert && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: getSeverityColor(latestAlert.severity),
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 1000,
          maxWidth: '300px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.5em', marginRight: '8px' }}>
              {getTypeIcon(latestAlert.type)}
            </span>
            <strong>{latestAlert.type}</strong>
          </div>
          <p style={{ margin: '0', fontSize: '0.9em' }}>{latestAlert.message}</p>
          <small>{latestAlert.location} • {latestAlert.timestamp}</small>
        </div>
      )}

      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {alerts.map((alert) => (
          <div
            key={alert.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              marginBottom: '8px',
              backgroundColor: alert.acknowledged ? '#f0f0f0' : COLORS.CARD_BACKGROUND,
              borderRadius: '6px',
              border: `2px solid ${getSeverityColor(alert.severity)}`,
              opacity: alert.acknowledged ? 0.7 : 1,
              cursor: 'pointer'
            }}
            onClick={() => !alert.acknowledged && acknowledgeAlert(alert.id)}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '1.2em', marginRight: '8px' }}>
                  {getTypeIcon(alert.type)}
                </span>
                <strong style={{ color: getSeverityColor(alert.severity) }}>
                  {alert.type}
                </strong>
                <span style={{
                  marginLeft: '8px',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontSize: '0.8em',
                  backgroundColor: getSeverityColor(alert.severity),
                  color: 'white'
                }}>
                  {alert.severity}
                </span>
              </div>
              <p style={{ margin: '4px 0', fontSize: '0.9em' }}>{alert.message}</p>
              <small style={{ color: COLORS.TEXT_LIGHT }}>
                {alert.location} • {alert.timestamp}
              </small>
            </div>

            {!alert.acknowledged && (
              <button
                className="btn btn-success"
                onClick={(e) => {
                  e.stopPropagation();
                  acknowledgeAlert(alert.id);
                }}
              >
                Acknowledge
              </button>
            )}
          </div>
        ))}
      </div>

      {alerts.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: COLORS.TEXT_LIGHT,
          fontStyle: 'italic'
        }}>
          No alerts at this time
        </div>
      )}
    </div>
  );
};

export default AlertList;
