import React from 'react';
import MapCard from '../components/MapCard';
import LossCard from '../components/LossCard';
import TransportTable from '../components/TransportTable';
import AlertList from '../components/AlertList';

const Overview: React.FC = () => {
  return (
    <div>
      <h1>Supply Chain Overview Dashboard</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Real-time monitoring of agricultural supply chain operations in Ethiopia
      </p>

      <div className="grid-2">
        <MapCard />
        <AlertList />
        <LossCard />
        <TransportTable />
      </div>
    </div>
  );
};

export default Overview;
