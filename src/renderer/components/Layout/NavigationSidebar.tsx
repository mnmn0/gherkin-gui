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
    label: '仕様書',
    path: '/specifications',
    icon: '📝',
    description: 'Gherkinテスト仕様書の管理',
  },
  {
    id: 'code-generation',
    label: 'コード生成',
    path: '/code-generation',
    icon: '⚙️',
    description: 'JUnitテストコードの生成',
  },
  {
    id: 'test-execution',
    label: 'テスト実行',
    path: '/test-execution',
    icon: '🚀',
    description: 'テストの実行と監視',
  },
  {
    id: 'reports',
    label: 'レポート',
    path: '/reports',
    icon: '📊',
    description: 'テストレポートと分析の表示',
  },
  {
    id: 'settings',
    label: '設定',
    path: '/settings',
    icon: '⚙️',
    description: 'プロジェクトの構成と設定',
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
          <div className="project-name">現在のプロジェクト</div>
          <div className="project-path">Spring Boot アプリケーション</div>
        </div>
      </div>
    </div>
  );
};
