import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './ThemeToggle.css';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  size = 'md',
}) => {
  const { theme, toggleTheme, systemTheme } = useTheme();

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="theme-icon">
            <path d="M12 2v2a8 8 0 1 0 8 8h2a10 10 0 1 1-10-10Z" />
            <path d="M12 2a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Z" />
            <path d="M19 12a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2h-2a1 1 0 0 1-1-1Z" />
            <path d="M17.071 17.071a1 1 0 0 1 0 1.414l-1.414 1.414a1 1 0 1 1-1.414-1.414l1.414-1.414a1 1 0 0 1 1.414 0Z" />
            <path d="M12 19a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1Z" />
            <path d="M6.929 17.071a1 1 0 0 1-1.414 0L4.101 15.657a1 1 0 1 1 1.414-1.414l1.414 1.414a1 1 0 0 1 0 1.414Z" />
            <path d="M5 12a1 1 0 0 1-1 1H2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1Z" />
            <path d="M6.929 6.929a1 1 0 0 1 0-1.414L8.343 4.101a1 1 0 1 1 1.414 1.414L8.343 6.929a1 1 0 0 1-1.414 0Z" />
          </svg>
        );
      case 'dark':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="theme-icon">
            <path d="M21.752 15.002A9.718 9.718 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
          </svg>
        );
      case 'auto':
      default:
        return systemTheme === 'dark' ? (
          <svg viewBox="0 0 24 24" fill="currentColor" className="theme-icon">
            <path d="M4.069 13h-1.5c-.825 0-1.5-.675-1.5-1.5s.675-1.5 1.5-1.5h1.5c.825 0 1.5.675 1.5 1.5s-.675 1.5-1.5 1.5zM6.282 7.482l-1.061-1.061c-.585-.585-.585-1.536 0-2.121.585-.585 1.536-.585 2.121 0l1.061 1.061c.585.585.585 1.536 0 2.121-.585.585-1.536.585-2.121 0zM12 4.5c-.825 0-1.5-.675-1.5-1.5v-1.5c0-.825.675-1.5 1.5-1.5s1.5.675 1.5 1.5V3c0 .825-.675 1.5-1.5 1.5zM17.718 7.482c-.585.585-1.536.585-2.121 0-.585-.585-.585-1.536 0-2.121l1.061-1.061c.585-.585 1.536-.585 2.121 0 .585.585.585 1.536 0 2.121l-1.061 1.061zM21.5 10h-1.5c-.825 0-1.5.675-1.5 1.5s.675 1.5 1.5 1.5h1.5c.825 0 1.5-.675 1.5-1.5s-.675-1.5-1.5-1.5z" />
            <path d="M17.718 16.518l1.061 1.061c.585.585.585 1.536 0 2.121-.585.585-1.536.585-2.121 0l-1.061-1.061c-.585-.585-.585-1.536 0-2.121.585-.585 1.536-.585 2.121 0zM12 19.5c.825 0 1.5.675 1.5 1.5v1.5c0 .825-.675 1.5-1.5 1.5s-1.5-.675-1.5-1.5V21c0-.825.675-1.5 1.5-1.5zM6.282 16.518c.585-.585 1.536-.585 2.121 0 .585.585.585 1.536 0 2.121l-1.061 1.061c-.585.585-1.536.585-2.121 0-.585-.585-.585-1.536 0-2.121l1.061-1.061z" />
            <path
              d="M12 6.75a5.25 5.25 0 1 0 0 10.5 5.25 5.25 0 0 0 0-10.5z"
              opacity="0.3"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" className="theme-icon">
            <path d="M12 6.75a5.25 5.25 0 1 0 0 10.5 5.25 5.25 0 0 0 0-10.5z" />
            <path d="M12 2a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1zM19 12a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2h-2a1 1 0 0 1-1-1zM17.071 17.071a1 1 0 0 1 0 1.414l-1.414 1.414a1 1 0 1 1-1.414-1.414l1.414-1.414a1 1 0 0 1 1.414 0zM12 19a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1zM6.929 17.071a1 1 0 0 1-1.414 0L4.101 15.657a1 1 0 1 1 1.414-1.414l1.414 1.414a1 1 0 0 1 0 1.414zM5 12a1 1 0 0 1-1 1H2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1zM6.929 6.929a1 1 0 0 1 0-1.414L8.343 4.101a1 1 0 1 1 1.414 1.414L8.343 6.929a1 1 0 0 1-1.414 0z" />
          </svg>
        );
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'ライト';
      case 'dark':
        return 'ダーク';
      case 'auto':
        return `自動 (${systemTheme === 'dark' ? 'ダーク' : 'ライト'})`;
      default:
        return 'テーマ';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle theme-toggle--${size} ${className}`}
      aria-label={`現在のテーマ: ${getThemeLabel()}。クリックしてテーマを切り替え`}
      title={`現在: ${getThemeLabel()}。クリックしてテーマを切り替え`}
    >
      <span className="theme-toggle__icon">{getThemeIcon()}</span>
      <span className="theme-toggle__label">{getThemeLabel()}</span>
    </button>
  );
};

export default ThemeToggle;
