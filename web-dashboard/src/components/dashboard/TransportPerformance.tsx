
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

const TransportPerformance: React.FC = () => {
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
      case 'On-Time': return 'safe';
      case 'Delayed': return 'warning';
      case 'Ghost Truck': return 'critical';
      case 'Route Deviation': return 'secondary';
      default: return 'gray-500';
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
    <div className="bg-card p-4 shadow-md rounded-md border">
      <h2 className="font-bold text-lg mb-4">Transport Performance</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 font-semibold">Route</th>
              <th className="text-left p-3 font-semibold">Vehicle</th>
              <th className="text-left p-3 font-semibold">Driver</th>
              <th className="text-left p-3 font-semibold">Status</th>
              <th className="text-left p-3 font-semibold">Delivery Time</th>
              <th className="text-left p-3 font-semibold">Delay</th>
              <th className="text-left p-3 font-semibold">QR</th>
            </tr>
          </thead>
          <tbody>
            {transportData.map((route) => (
              <tr
                key={route.id}
                className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedRoute(route)}
              >
                <td className="p-3">{route.route}</td>
                <td className="p-3">{route.vehicleId}</td>
                <td className="p-3">{route.driver}</td>
                <td className="p-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${getStatusColor(route.status)} text-white`}>
                    {getStatusIcon(route.status)} {route.status}
                  </span>
                </td>
                <td className="p-3">{route.tripStart}</td>
                <td className="p-3">
                  {route.delayMinutes > 0 ? `${route.delayMinutes}m` : '-'}
                </td>
                <td className="p-3">
                  {route.qrVerified ? '✅' : '❌'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedRoute && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md border">
          <h3 className="font-semibold text-sm mb-3">Route Details: {selectedRoute.route}</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
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

      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <h3 className="font-semibold text-sm mb-2">Performance Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>On-Time Deliveries: 68%</div>
          <div>Average Delay: 23 minutes</div>
          <div>Ghost Trucks Detected: 3</div>
          <div>Route Deviations: 2</div>
        </div>
      </div>
    </div>
  );
};

export default TransportPerformance;
