
import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-gray-800 text-white h-screen p-4">
      <div className="text-2xl font-bold mb-10">EATMS</div>
      <nav>
        <ul>
          <li className="mb-4"><a href="#" className="hover:text-blue-300">Overview</a></li>
          <li className="mb-4"><a href="#" className="hover:text-blue-300">Market Prices</a></li>
          <li className="mb-4"><a href="#" className="hover:text-blue-300">Transport Monitoring</a></li>
          <li className="mb-4"><a href="#" className="hover:text-blue-300">Post-Harvest Loss</a></li>
          <li className="mb-4"><a href="#" className="hover:text-blue-300">Alerts</a></li>
          <li className="mb-4"><a href="#" className="hover:text-blue-300">Analytics</a></li>
          <li className="mb-4"><a href="#" className="hover:text-blue-300">Reports</a></li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
