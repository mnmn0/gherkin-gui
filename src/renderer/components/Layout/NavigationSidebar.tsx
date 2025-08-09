import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FileText, 
  Code, 
  Play, 
  BarChart3, 
  Settings, 
  TestTube,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useUserPreferences } from '../../contexts/ThemeContext';
import ThemeToggle from '../Common/ThemeToggle';
import GlassCard from '../Common/GlassCard';
import './NavigationSidebar.css';

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
  badge?: {
    text: string;
    variant: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  };
}

const navigationItems: NavigationItem[] = [
  {
    id: 'specifications',
    label: '仕様書',
    path: '/specifications',
    icon: FileText,
    description: 'Gherkinテスト仕様書の管理',
  },
  {
    id: 'code-generation',
    label: 'コード生成',
    path: '/code-generation',
    icon: Code,
    description: 'JUnitテストコードの生成',
  },
  {
    id: 'test-execution',
    label: 'テスト実行',
    path: '/test-execution',
    icon: Play,
    description: 'テストの実行と監視',
    badge: { text: '2', variant: 'primary' }
  },
  {
    id: 'reports',
    label: 'レポート',
    path: '/reports',
    icon: BarChart3,
    description: 'テストレポートと分析の表示',
  },
  {
    id: 'settings',
    label: '設定',
    path: '/settings',
    icon: Settings,
    description: 'プロジェクトの構成と設定',
  },
];

interface NavigationSidebarProps {
  className?: string;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { preferences, updatePreferences } = useUserPreferences();
  const [isCollapsed, setIsCollapsed] = useState(preferences.sidebarCollapsed);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const toggleCollapsed = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    updatePreferences({ sidebarCollapsed: newCollapsed });
  };

  const isCurrentPath = (path: string) => {
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(path));
  };

  return (
    <div className={`navigation-sidebar ${isCollapsed ? 'collapsed' : ''} ${className}`}>
      {/* サイドバーヘッダー */}
      <div className="sidebar-header">
        <GlassCard 
          size="sm" 
          padding={false}
          className="app-logo-card"
          blur="light"
        >
          <div className="app-logo">
            <div className="logo-icon">
              <TestTube size={24} className="icon" />
            </div>
            {!isCollapsed && (
              <div className="logo-content">
                <span className="logo-text">Spring Boot Test GUI</span>
                <span className="logo-subtitle">テストツール</span>
              </div>
            )}
          </div>
        </GlassCard>

        <button
          className="collapse-toggle"
          onClick={toggleCollapsed}
          aria-label={isCollapsed ? 'サイドバーを展開' : 'サイドバーを折りたたみ'}
          title={isCollapsed ? 'サイドバーを展開' : 'サイドバーを折りたたみ'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* ナビゲーション */}
      <nav className="sidebar-nav" role="navigation" aria-label="メインナビゲーション">
        <div className="nav-section">
          <div className="nav-items">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = isCurrentPath(item.path);
              
              return (
                <button
                  key={item.id}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleNavigation(item.path)}
                  title={isCollapsed ? `${item.label} - ${item.description}` : item.description}
                  aria-label={`${item.label} - ${item.description}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="nav-item-content">
                    <div className="nav-icon">
                      <IconComponent size={20} className="icon" />
                    </div>
                    {!isCollapsed && (
                      <div className="nav-text">
                        <span className="nav-label">{item.label}</span>
                        {item.badge && (
                          <span className={`nav-badge nav-badge--${item.badge.variant}`}>
                            {item.badge.text}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {isActive && <div className="nav-indicator" />}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* サイドバーフッター */}
      <div className="sidebar-footer">
        {!isCollapsed && (
          <GlassCard size="sm" className="project-info-card">
            <div className="project-info">
              <div className="project-status">
                <div className="status-indicator status-indicator--active" />
                <span className="status-text">プロジェクト接続中</span>
              </div>
              <div className="project-details">
                <div className="project-name">Spring Boot アプリケーション</div>
                <div className="project-path">/workspace/my-project</div>
              </div>
            </div>
          </GlassCard>
        )}
        
        <div className="sidebar-controls">
          <ThemeToggle 
            size={isCollapsed ? "sm" : "md"} 
            className={isCollapsed ? "theme-toggle--icon-only" : ""}
          />
        </div>
      </div>
    </div>
  );
};
