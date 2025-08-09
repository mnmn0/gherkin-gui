import React from 'react';
import './Page.css';

export const SettingsPage: React.FC = () => {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Project configuration and application settings</p>
      </div>
      <div className="coming-soon">
        <h3>🚧 Coming Soon</h3>
        <p>This feature is under development</p>
      </div>
    </div>
  );
};