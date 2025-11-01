import React, { useState } from 'react';
import { COLORS, getStatusColor } from '../constants/theme';

interface TransportRoute {
  id: number;
  route: string;
  tripStart: string;
  tripEnd: string | null;
  deliveryTime: string;
  delayMinutes: number;
  status: 'On-Time' | 'Delayed' | 'Ghost Truck' | 'Route Deviation';
  qrVerified: boolean;
  vehicleId: string;
  driver: string;
}

const TransportTable: React.FC = () => {
  // Placeholder data for transport routes
  const transportData: TransportRoute[] = [
    {
      id: 1,
      route: 'Addis Ababa → Jimma',
      tripStart: '2024-01-15 08:00',
      tripEnd: '2024-01-15 14:30',
      deliveryTime: '6h 30m',
      delayMinutes: 0,
      status: 'On-Time',
      qrVerified: true,
      vehicleId: 'ETH-001',
      driver: 'Ahmed Hassan'
    },
    {
      id: 2,
      route: 'Bahir Dar → Gondar',
      tripStart: '2024-01-15 09:15',
      tripEnd: '2024-01-15 16:45',
      deliveryTime: '7h 30m',
      delayMinutes: 45,
      status: 'Delayed',
      qrVerified: true,
      vehicleId: 'ETH-002',
      driver: 'Solomon Tekle'
    },
    {
      id: 3,
      route: 'Hawassa → Addis Ababa',
      tripStart: '2024-01-15 07:30',
      tripEnd: null,
      deliveryTime: 'In Transit',
      delayMinutes: 0,
      status: 'Ghost Truck',
      qrVerified: false,
      vehicleId: 'ETH-003',
      driver: 'Unknown'
    },
    {
      id: 4,
      route: 'Dire Dawa → Harar',
      tripStart: '2024-01-15 10:00',
      tripEnd: '2024-01-15 12:15',
      deliveryTime: '2h 15m',
      delayMinutes: 0,
      status: 'Route Deviation',
      qrVerified: true,
      vehicleId: 'ETH-004',
      driver: 'Fatima Ali'
    }
  ];

  const [selectedRoute, setSelectedRoute] = useState<TransportRoute | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'On-Time': return '✅';
      case 'Delayed': return '⏰';
      case 'Ghost Truck': return '👻';
      case 'Route Deviation': return '🚧';
      default: return '❓';
    }
  };

  return (
    <div className="card">
      <h3>Transport Performance</h3>

      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          backgroundColor: COLORS.CARD_BACKGROUND,
          borderRadius: '6px',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Route</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Trip Start</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Delivery Time</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Delay</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>QR Verified</th>
            </tr>
          </thead>
          <tbody>
            {transportData.map((route) => (
              <tr
                key={route.id}
                style={{
                  borderBottom: '1px solid #eee',
                  cursor: 'pointer',
                  backgroundColor: selectedRoute?.id === route.id ? '#e3f2fd' : 'transparent'
                }}
                onClick={() => setSelectedRoute(route)}
              >
                <td style={{ padding: '12px' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{route.route}</div>
                    <div style={{ fontSize: '0.8em', color: COLORS.TEXT_LIGHT }}>
                      {route.vehicleId} • {route.driver}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    color: getStatusColor(route.status),
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    {getStatusIcon(route.status)} {route.status}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>{route.tripStart}</td>
                <td style={{ padding: '12px' }}>{route.deliveryTime}</td>
                <td style={{ padding: '12px' }}>
                  {route.delayMinutes > 0 ? (
                    <span style={{ color: COLORS.WARNING, fontWeight: 'bold' }}>
                      {route.delayMinutes}m
                    </span>
                  ) : '-'}
                </td>
                <td style={{ padding: '12px' }}>
                  {route.qrVerified ? (
                    <span style={{ color: COLORS.SAFE }}>✅ Verified</span>
                  ) : (
                    <span style={{ color: COLORS.DANGER }}>❌ Not Verified</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedRoute && (
        <div style={{
          marginTop: '15px',
          padding: '15px',
          backgroundColor: '#e8f5e8',
          borderRadius: '6px',
          border: `1px solid ${COLORS.SAFE}`
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: getStatusColor(selectedRoute.status) }}>
            Route Details: {selectedRoute.route}
          </h4>
          <div className="grid-2" style={{ fontSize: '0.9em' }}>
            <div><strong>Vehicle:</strong> {selectedRoute.vehicleId}</div>
            <div><strong>Driver:</strong> {selectedRoute.driver}</div>
            <div><strong>Trip Start:</strong> {selectedRoute.tripStart}</div>
            <div><strong>Trip End:</strong> {selectedRoute.tripEnd ? selectedRoute.tripEnd : 'In Progress'}</div>
            <div><strong>Delivery Time:</strong> {selectedRoute.deliveryTime}</div>
            <div><strong>Delay:</strong> {selectedRoute.delayMinutes > 0 ? `${selectedRoute.delayMinutes} minutes` : 'None'}</div>
            <div><strong>QR Verification:</strong> {selectedRoute.qrVerified ? 'Verified' : 'Not Verified'}</div>
            <div><strong>Status:</strong> {selectedRoute.status}</div>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setSelectedRoute(null)}
            style={{ marginTop: '10px' }}
          >
            Close Details
          </button>
        </div>
      )}

      <div style={{
        marginTop: '15px',
        padding: '10px',
        backgroundColor: '#fff3e0',
        borderRadius: '6px',
        border: `1px solid ${COLORS.WARNING}`
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: COLORS.WARNING }}>Performance Summary</h4>
        <div className="grid-2" style={{ fontSize: '0.9em' }}>
          <div>On-Time Deliveries: <span style={{ color: COLORS.SAFE, fontWeight: 'bold' }}>68%</span></div>
          <div>Average Delay: <span style={{ color: COLORS.WARNING, fontWeight: 'bold' }}>23 minutes</span></div>
          <div>Ghost Trucks Detected: <span style={{ color: COLORS.DANGER, fontWeight: 'bold' }}>3</span></div>
          <div>Route Deviations: <span style={{ color: COLORS.DANGER, fontWeight: 'bold' }}>2</span></div>
        </div>
      </div>
    </div>
  );
};

export default TransportTable;
