
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold">Government Analytics Dashboard</h1>
      <div className="flex items-center">
        <div className="mr-4">Welcome, User</div>
        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
      </div>
    </header>
  );
};

export default Header;
