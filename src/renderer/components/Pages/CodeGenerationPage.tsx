import React from 'react';
import './Page.css';

export const CodeGenerationPage: React.FC = () => {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Code Generation</h1>
        <p>Generate JUnit test code from Gherkin specifications</p>
      </div>
      <div className="coming-soon">
        <h3>🚧 Coming Soon</h3>
        <p>This feature is under development</p>
      </div>
    </div>
  );
};