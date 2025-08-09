// Theme System Types

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ThemeColors {
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  gray: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  success: {
    50: string;
    100: string;
    500: string;
    600: string;
    700: string;
  };
  warning: {
    50: string;
    100: string;
    500: string;
    600: string;
    700: string;
  };
  error: {
    50: string;
    100: string;
    500: string;
    600: string;
    700: string;
  };
  background: string;
  surface: string;
  surfaceHover: string;
  border: string;
  borderHover: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
    onPrimary: string;
  };
  glass: {
    background: string;
    border: string;
    shadow: string;
    backdrop: string;
  };
}

export interface TypographyConfig {
  fontFamily: {
    sans: string;
    mono: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  fontWeight: {
    thin: number;
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
  };
  lineHeight: {
    tight: number;
    snug: number;
    normal: number;
    relaxed: number;
    loose: number;
  };
}

export interface SpacingConfig {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  8: string;
  10: string;
  12: string;
  16: string;
  20: string;
  24: string;
}

export interface BorderRadiusConfig {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
}

export interface ShadowConfig {
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
}

export interface AnimationConfig {
  duration: {
    fast: string;
    base: string;
    slow: string;
  };
  easing: {
    easeIn: string;
    easeOut: string;
    easeInOut: string;
    bounce: string;
  };
}

export interface ZIndexConfig {
  auto: string;
  0: number;
  10: number;
  20: number;
  30: number;
  40: number;
  50: number;
  modal: number;
  popover: number;
  tooltip: number;
  toast: number;
}

export interface Theme {
  colors: ThemeColors;
  typography: TypographyConfig;
  spacing: SpacingConfig;
  borderRadius: BorderRadiusConfig;
  shadows: ShadowConfig;
  animations: AnimationConfig;
  zIndex: ZIndexConfig;
}

export interface ThemeContextType {
  theme: ThemeMode;
  currentTheme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  systemTheme: 'light' | 'dark';
}

export interface UserPreferences {
  theme: ThemeMode;
  fontSize: 'small' | 'medium' | 'large';
  viewMode: 'compact' | 'comfortable';
  animations: boolean;
  glassmorphism: boolean;
  sidebarCollapsed: boolean;
  reducedMotion: boolean;
}

// Glass Effect Variants
export type GlassBlurLevel = 'light' | 'medium' | 'heavy';
export type GlassOpacity = number; // 0-1

export interface GlassEffectProps {
  blur?: GlassBlurLevel;
  opacity?: GlassOpacity;
  border?: boolean;
  shadow?: boolean;
  fallback?: boolean; // For browsers without backdrop-filter support
}

// Component Size Variants
export type ComponentSize = 'sm' | 'md' | 'lg' | 'xl';

// Status Variants
export type StatusVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

// Button Variants
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass';

// Animation States
export type AnimationState = 'idle' | 'loading' | 'success' | 'error';

// Responsive Breakpoints (for TypeScript usage)
export interface Breakpoints {
  sm: string;  // 640px
  md: string;  // 768px
  lg: string;  // 1024px
  xl: string;  // 1280px
  '2xl': string; // 1536px
}