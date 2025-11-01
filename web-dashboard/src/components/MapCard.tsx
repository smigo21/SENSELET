import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Shipment {
  id: number;
  farmer: string;
  trader: string;
  quantity: string;
  crop: string;
  status: 'On-time' | 'Delayed' | 'Delivered';
  expectedArrival: string;
  position: { lat: number; lng: number };
  origin?: { lat: number; lng: number }; // Origin for route visualization
}

const MapCard: React.FC = () => {
  // Placeholder data for shipments
  const shipments: Shipment[] = [
    { id: 1, farmer: 'Farmer A', trader: 'Trader X', quantity: '100kg', crop: 'Maize', status: 'On-time', expectedArrival: '2023-10-05', position: { lat: 9.145, lng: 38.731 }, origin: { lat: 9.0, lng: 38.5 } },
    { id: 2, farmer: 'Farmer B', trader: 'Trader Y', quantity: '200kg', crop: 'Wheat', status: 'Delayed', expectedArrival: '2023-10-06', position: { lat: 8.980, lng: 38.757 }, origin: { lat: 8.8, lng: 38.6 } },
    { id: 3, farmer: 'Farmer C', trader: 'Trader Z', quantity: '150kg', crop: 'Teff', status: 'Delivered', expectedArrival: '2023-10-04', position: { lat: 9.030, lng: 38.740 } },
  ];

  const [hoveredShipment, setHoveredShipment] = useState<Shipment | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On-time': return 'green';
      case 'Delayed': return 'orange';
      case 'Delivered': return 'red'; // Changed to red for urgency
      default: return 'gray';
    }
  };

  const createCustomIcon = (color: string) => {
    return new L.Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.5 0C5.596 0 0 5.596 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.596 19.404 0 12.5 0z" fill="${color}" stroke="#000" stroke-width="1"/>
          <circle cx="12.5" cy="12.5" r="5" fill="white"/>
        </svg>
      `)}`,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
  };

  // Render route for active shipments (On-time and Delayed)
  const renderRoute = (shipment: Shipment) => {
    if (!shipment.origin || shipment.status === 'Delivered') return null;

    return (
      <Polyline
        key={`route-${shipment.id}`}
        positions={[
          [shipment.origin.lat, shipment.origin.lng],
          [shipment.position.lat, shipment.position.lng]
        ]}
        color={getStatusColor(shipment.status)}
        weight={3}
        opacity={0.7}
      />
    );
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px' }}>
      <h2>Live Supply Chain Map - Ethiopia</h2>
      <MapContainer center={[9.145, 38.731]} zoom={7} style={{ height: '400px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {/* Render routes for active shipments */}
        {shipments.map((shipment) => renderRoute(shipment))}
        {/* Render markers */}
        {shipments.map((shipment) => (
          <Marker
            key={shipment.id}
            position={[shipment.position.lat, shipment.position.lng]}
            icon={createCustomIcon(getStatusColor(shipment.status))}
          >
            <Popup>
              <div>
                <h3>Shipment Details</h3>
                <p><strong>Farmer:</strong> {shipment.farmer}</p>
                <p><strong>Trader:</strong> {shipment.trader}</p>
                <p><strong>Quantity:</strong> {shipment.quantity}</p>
                <p><strong>Crop:</strong> {shipment.crop}</p>
                <p><strong>Status:</strong> {shipment.status}</p>
                <p><strong>Expected Arrival:</strong> {shipment.expectedArrival}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div>
        <h3>Legend</h3>
        <p><span style={{ color: 'green' }}>●</span> On-time</p>
        <p><span style={{ color: 'orange' }}>●</span> Delayed</p>
        <p><span style={{ color: 'red' }}>●</span> Delivered</p>
      </div>
    </div>
  );
};

export default MapCard;
