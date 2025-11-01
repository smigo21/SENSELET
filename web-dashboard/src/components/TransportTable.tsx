import React, { useState } from 'react';

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On-Time': return '#4CAF50';
      case 'Delayed': return '#FF9800';
      case 'Ghost Truck': return '#F44336';
      case 'Route Deviation': return '#9C27B0';
      default: return '#666';
    }
  };

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
    <div style={{
      border: '1px solid #ccc',
      padding: '15px',
      margin: '10px',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>Transport Performance</h3>

      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          backgroundColor: 'white',
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
                    <div style={{ fontSize: '0.8em', color: '#666' }}>
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
                  {route.delayMinutes > 0 ? `${route.delayMinutes}m` : '-'}
                </td>
                <td style={{ padding: '12px' }}>
                  {route.qrVerified ? '✅' : '❌'}
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
          border: '1px solid #c8e6c9'
        }}>
          <h4>Route Details: {selectedRoute.route}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9em' }}>
            <div><strong>Vehicle:</strong> {selectedRoute.vehicleId}</div>
            <div><strong>Driver:</strong> {selectedRoute.driver}</div>
            <div><strong>Trip Start:</strong> {selectedRoute.tripStart}</div>
            <div><strong>Trip End:</strong> {selectedRoute.tripEnd ? selectedRoute.tripEnd : 'In Progress'}</div>
            <div><strong>Delivery Time:</strong> {selectedRoute.deliveryTime}</div>
            <div><strong>Delay:</strong> {selectedRoute.delayMinutes > 0 ? `${selectedRoute.delayMinutes} minutes` : 'None'}</div>
            <div><strong>QR Verification:</strong> {selectedRoute.qrVerified ? 'Verified' : 'Not Verified'}</div>
            <div><strong>Status:</strong> {selectedRoute.status}</div>
          </div>
        </div>
      )}

      <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fff3e0', borderRadius: '6px' }}>
        <h4 style={{ margin: '0 0 10px 0' }}>Performance Summary</h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9em' }}>
          <span>On-Time Deliveries: 68%</span>
          <span>Average Delay: 23 minutes</span>
          <span>Ghost Trucks Detected: 3</span>
          <span>Route Deviations: 2</span>
        </div>
      </div>
    </div>
  );
};

export default TransportTable;
