import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './NavigationSidebar.css';

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  description: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'specifications',
    label: 'Specifications',
    path: '/specifications',
    icon: '📝',
    description: 'Manage Gherkin test specifications',
  },
  {
    id: 'code-generation',
    label: 'Code Generation',
    path: '/code-generation',
    icon: '⚙️',
    description: 'Generate JUnit test code',
  },
  {
    id: 'test-execution',
    label: 'Test Execution',
    path: '/test-execution',
    icon: '🚀',
    description: 'Run and monitor tests',
  },
  {
    id: 'reports',
    label: 'Reports',
    path: '/reports',
    icon: '📊',
    description: 'View test reports and analytics',
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: '⚙️',
    description: 'Project configuration and settings',
  },
];

export const NavigationSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="navigation-sidebar">
      <div className="sidebar-header">
        <div className="app-logo">
          <span className="logo-icon">🧪</span>
          <span className="logo-text">Spring Boot Test GUI</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => handleNavigation(item.path)}
            title={item.description}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="project-info">
          <div className="project-name">Current Project</div>
          <div className="project-path">Spring Boot App</div>
        </div>
      </div>
    </div>
  );
};
