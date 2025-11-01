
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './App.css';
import Dashboard from './pages/Dashboard.tsx';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Dashboard />
  </React.StrictMode>
);
