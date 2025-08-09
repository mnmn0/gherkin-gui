import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SpecificationsPage } from '../Pages/SpecificationsPage';
import { CodeGenerationPage } from '../Pages/CodeGenerationPage';
import { TestExecutionPage } from '../Pages/TestExecutionPage';
import { ReportsPage } from '../Pages/ReportsPage';
import { SettingsPage } from '../Pages/SettingsPage';
import './ContentArea.css';

export const ContentArea: React.FC = () => {
  return (
    <div className="content-area">
      <Routes>
        <Route path="/" element={<Navigate to="/specifications" replace />} />
        <Route path="/specifications" element={<SpecificationsPage />} />
        <Route path="/code-generation" element={<CodeGenerationPage />} />
        <Route path="/test-execution" element={<TestExecutionPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </div>
  );
};