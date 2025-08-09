import React from 'react';
import { NavigationSidebar } from './NavigationSidebar';
import { ContentArea } from './ContentArea';
import './AppLayout.css';

export const AppLayout: React.FC = () => {
  return (
    <div className="app-layout">
      <NavigationSidebar />
      <ContentArea />
    </div>
  );
};
