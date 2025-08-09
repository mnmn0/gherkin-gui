import React from 'react';
import './Page.css';

export const TestExecutionPage: React.FC = () => {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Test Execution</h1>
        <p>Run and monitor test executions</p>
      </div>
      <div className="coming-soon">
        <h3>🚧 Coming Soon</h3>
        <p>This feature is under development</p>
      </div>
    </div>
  );
};