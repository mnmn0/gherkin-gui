import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { ThemeMode, ThemeContextType, UserPreferences } from '../types/theme';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'auto',
  fontSize: 'medium',
  viewMode: 'comfortable',
  animations: true,
  glassmorphism: true,
  sidebarCollapsed: false,
  reducedMotion: false,
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>('auto');
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
  const [preferences, setPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES);

  // システムテーマの検出
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // prefers-reduced-motionの検出
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (e: MediaQueryListEvent) => {
      setPreferences((prev) => ({
        ...prev,
        reducedMotion: e.matches,
        animations: !e.matches && prev.animations,
      }));
    };

    setPreferences((prev) => ({
      ...prev,
      reducedMotion: mediaQuery.matches,
    }));

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // ローカルストレージから設定を読み込み
  useEffect(() => {
    const loadPreferences = () => {
      try {
        const saved = localStorage.getItem('gherkin-gui-preferences');
        if (saved) {
          const parsedPreferences = JSON.parse(saved);
          setPreferences((prev) => ({ ...prev, ...parsedPreferences }));
          setTheme(parsedPreferences.theme || 'auto');
        }
      } catch (error) {
        // 設定の読み込みに失敗した場合はデフォルト設定を使用
      }
    };

    loadPreferences();
  }, []);

  // 設定をローカルストレージに保存
  useEffect(() => {
    try {
      localStorage.setItem(
        'gherkin-gui-preferences',
        JSON.stringify(preferences),
      );
    } catch (error) {
      // 設定の保存に失敗した場合はログに記録
    }
  }, [preferences]);

  // テーマをDOMに適用
  useEffect(() => {
    const actualTheme = theme === 'auto' ? systemTheme : theme;
    document.documentElement.setAttribute('data-theme', actualTheme);

    // フォントサイズの適用
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
    };
    document.documentElement.style.fontSize = fontSizeMap[preferences.fontSize];

    // アニメーションの無効化
    if (preferences.reducedMotion || !preferences.animations) {
      document.documentElement.style.setProperty('--transition-fast', 'none');
      document.documentElement.style.setProperty('--transition-base', 'none');
      document.documentElement.style.setProperty('--transition-slow', 'none');
    } else {
      document.documentElement.style.removeProperty('--transition-fast');
      document.documentElement.style.removeProperty('--transition-base');
      document.documentElement.style.removeProperty('--transition-slow');
    }

    // ビューモードクラスの適用
    document.body.classList.toggle(
      'view-compact',
      preferences.viewMode === 'compact',
    );
    document.body.classList.toggle(
      'view-comfortable',
      preferences.viewMode === 'comfortable',
    );

    // グラスモーフィズム効果の制御
    document.body.classList.toggle(
      'glassmorphism-disabled',
      !preferences.glassmorphism,
    );
  }, [theme, systemTheme, preferences]);

  const toggleTheme = () => {
    const newTheme: ThemeMode =
      theme === 'light' ? 'dark' : theme === 'dark' ? 'auto' : 'light';
    setTheme(newTheme);
    setPreferences((prev) => ({ ...prev, theme: newTheme }));
  };

  const setThemeMode = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    setPreferences((prev) => ({ ...prev, theme: newTheme }));
  };

  // ダミーテーマオブジェクト（実際にはCSS変数を使用）
  const currentTheme = {
    colors: {} as any,
    typography: {} as any,
    spacing: {} as any,
    borderRadius: {} as any,
    shadows: {} as any,
    animations: {} as any,
    zIndex: {} as any,
  };

  const contextValue: ThemeContextType = useMemo(() => ({
    theme,
    currentTheme,
    toggleTheme,
    setTheme: setThemeMode,
    systemTheme,
  }), [theme, currentTheme, toggleTheme, setThemeMode, systemTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <div
        className={`theme-provider ${preferences.viewMode === 'compact' ? 'compact' : 'comfortable'}`}
        data-theme={theme === 'auto' ? systemTheme : theme}
        data-animations={preferences.animations ? 'enabled' : 'disabled'}
        data-glassmorphism={preferences.glassmorphism ? 'enabled' : 'disabled'}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// カスタムフックでユーザー設定へのアクセスを提供
export const useUserPreferences = () => {
  const [preferences, setPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    const loadPreferences = () => {
      try {
        const saved = localStorage.getItem('gherkin-gui-preferences');
        if (saved) {
          const parsedPreferences = JSON.parse(saved);
          setPreferences((prev) => ({ ...prev, ...parsedPreferences }));
        }
      } catch (error) {
        // 設定の読み込みに失敗した場合はデフォルト設定を使用
      }
    };

    loadPreferences();
  }, []);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);

    try {
      localStorage.setItem(
        'gherkin-gui-preferences',
        JSON.stringify(newPreferences),
      );
    } catch (error) {
      // 設定の保存に失敗した場合はログに記録
    }

    // テーマが変更された場合の処理
    if (updates.theme) {
      const actualTheme =
        updates.theme === 'auto'
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
          : updates.theme;
      document.documentElement.setAttribute('data-theme', actualTheme);
    }

    // その他の設定の適用
    if (updates.fontSize) {
      const fontSizeMap = {
        small: '14px',
        medium: '16px',
        large: '18px',
      };
      document.documentElement.style.fontSize = fontSizeMap[updates.fontSize];
    }

    if (
      updates.animations !== undefined ||
      updates.reducedMotion !== undefined
    ) {
      const shouldDisableAnimations =
        updates.reducedMotion || !updates.animations;
      if (shouldDisableAnimations) {
        document.documentElement.style.setProperty('--transition-fast', 'none');
        document.documentElement.style.setProperty('--transition-base', 'none');
        document.documentElement.style.setProperty('--transition-slow', 'none');
      } else {
        document.documentElement.style.removeProperty('--transition-fast');
        document.documentElement.style.removeProperty('--transition-base');
        document.documentElement.style.removeProperty('--transition-slow');
      }
    }

    if (updates.viewMode) {
      document.body.classList.toggle(
        'view-compact',
        updates.viewMode === 'compact',
      );
      document.body.classList.toggle(
        'view-comfortable',
        updates.viewMode === 'comfortable',
      );
    }

    if (updates.glassmorphism !== undefined) {
      document.body.classList.toggle(
        'glassmorphism-disabled',
        !updates.glassmorphism,
      );
    }
  };

  return {
    preferences,
    updatePreferences,
  };
};
