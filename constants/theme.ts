export const Colors = {
  dark: {
    background: '#0f0f0f',
    surface: '#1a1a1a',
    surfaceElevated: '#242424',
    border: '#2e2e2e',
    text: '#f5f5f5',
    textSecondary: '#a3a3a3',
    textMuted: '#525252',
    accent: '#f97316',
    accentMuted: '#431407',
    accentForeground: '#fff7ed',
    noteCard: '#1a1a1a',
    checklistCard: '#1a1f1a',
    ideaCard: '#1a1a1f',
    success: '#22c55e',
    destructive: '#ef4444',
    overlay: 'rgba(0,0,0,0.6)',
  },
  light: {
    background: '#fafafa',
    surface: '#ffffff',
    surfaceElevated: '#f5f5f5',
    border: '#e5e5e5',
    text: '#0a0a0a',
    textSecondary: '#525252',
    textMuted: '#a3a3a3',
    accent: '#f97316',
    accentMuted: '#ffedd5',
    accentForeground: '#431407',
    noteCard: '#ffffff',
    checklistCard: '#f0fdf4',
    ideaCard: '#faf5ff',
    success: '#16a34a',
    destructive: '#dc2626',
    overlay: 'rgba(0,0,0,0.4)',
  },
} as const;

export const Typography = {
  size: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 30,
    '3xl': 36,
  },
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const Spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
} as const;

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  },
} as const;
