import React from 'react';
import './Page.css';

export const ReportsPage: React.FC = () => {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Test Reports</h1>
        <p>View test reports and analytics</p>
      </div>
      <div className="coming-soon">
        <h3>🚧 Coming Soon</h3>
        <p>This feature is under development</p>
      </div>
    </div>
  );
};