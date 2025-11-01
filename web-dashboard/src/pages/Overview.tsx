import React from 'react';
import MapCard from '../components/MapCard';
import PriceChart from '../components/PriceChart';
import LossCard from '../components/LossCard';
import TransportTable from '../components/TransportTable';
import AlertList from '../components/AlertList';

const Overview: React.FC = () => {
  return (
    <div>
      <h1>Overview</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <MapCard />
        <PriceChart />
        <LossCard />
        <TransportTable />
        <AlertList />
      </div>
    </div>
  );
};

export default Overview;
