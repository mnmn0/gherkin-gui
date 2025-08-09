import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../../renderer/contexts/ThemeContext';

// モックコンポーネント
const TestComponent: React.FC = () => {
  const { theme, toggleTheme, systemTheme } = useTheme();

  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <span data-testid="system-theme">{systemTheme}</span>
      <button onClick={toggleTheme} data-testid="toggle-theme">
        テーマ切り替え
      </button>
    </div>
  );
};

// matchMediaのモック
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

// localStorageのモック
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('ThemeContext', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  test('初期テーマが正しく設定される', () => {
    mockMatchMedia(false); // ライトテーマのシステム設定

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('auto');
    expect(screen.getByTestId('system-theme')).toHaveTextContent('light');
  });

  test('システムがダークモードの場合の初期設定', () => {
    mockMatchMedia(true); // ダークテーマのシステム設定

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('system-theme')).toHaveTextContent('dark');
  });

  test('テーマの切り替えが正しく動作する', async () => {
    mockMatchMedia(false);

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    const toggleButton = screen.getByTestId('toggle-theme');
    const themeDisplay = screen.getByTestId('current-theme');

    // auto -> light -> dark -> auto のサイクル
    expect(themeDisplay).toHaveTextContent('auto');

    fireEvent.click(toggleButton);
    await waitFor(() => {
      expect(themeDisplay).toHaveTextContent('light');
    });

    fireEvent.click(toggleButton);
    await waitFor(() => {
      expect(themeDisplay).toHaveTextContent('dark');
    });

    fireEvent.click(toggleButton);
    await waitFor(() => {
      expect(themeDisplay).toHaveTextContent('auto');
    });
  });

  test('テーマ設定がローカルストレージに保存される', async () => {
    mockMatchMedia(false);

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    const toggleButton = screen.getByTestId('toggle-theme');

    fireEvent.click(toggleButton); // auto -> light

    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'gherkin-gui-preferences',
        expect.stringContaining('"theme":"light"'),
      );
    });
  });

  test('保存されたテーマ設定が復元される', () => {
    mockMatchMedia(false);
    mockLocalStorage.setItem(
      'gherkin-gui-preferences',
      JSON.stringify({
        theme: 'dark',
        fontSize: 'large',
        animations: false,
      }),
    );

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
  });

  test('不正なローカルストレージデータを適切に処理する', () => {
    mockMatchMedia(false);
    mockLocalStorage.setItem('gherkin-gui-preferences', 'invalid-json');

    // エラーが発生してもアプリが落ちないことを確認
    expect(() => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );
    }).not.toThrow();

    expect(screen.getByTestId('current-theme')).toHaveTextContent('auto');
  });

  test('useThemeがThemeProvider外で使用された場合にエラーをスローする', () => {
    // console.errorをモック
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useTheme must be used within a ThemeProvider');

    consoleSpy.mockRestore();
  });

  test('prefers-reduced-motionに応答する', () => {
    const reducedMotionQuery = {
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query: string) => {
        if (query === '(prefers-reduced-motion: reduce)') {
          return reducedMotionQuery;
        }
        return {
          matches: false,
          media: query,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
        };
      }),
    });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    // reducedMotionQueryのイベントリスナーが登録されていることを確認
    expect(reducedMotionQuery.addEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function),
    );
  });

  test('data-theme属性がドキュメントに正しく設定される', async () => {
    mockMatchMedia(false);

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    const toggleButton = screen.getByTestId('toggle-theme');

    // 初期状態（auto -> light）
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    fireEvent.click(toggleButton); // light
    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    fireEvent.click(toggleButton); // dark
    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });
});
