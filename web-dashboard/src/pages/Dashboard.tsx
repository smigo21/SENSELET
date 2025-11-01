
import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/dashboard/Header';
import SupplyChainMap from '../components/dashboard/SupplyChainMap';
import MarketPriceChart from '../components/dashboard/MarketPriceChart';
import PostHarvestLoss from '../components/dashboard/PostHarvestLoss';
import TransportPerformance from '../components/dashboard/TransportPerformance';
import AlertsList from '../components/dashboard/AlertsList';

const Dashboard: React.FC = () => {
  return (
    <div className="flex bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SupplyChainMap />
            </div>
            <MarketPriceChart />
            <PostHarvestLoss />
            <div className="lg:col-span-2">
              <TransportPerformance />
            </div>
            <AlertsList />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
