// Color System for RentEase
export const colors = {
  // Brand Colors
  brand: {
    primary: {
      50: '#EBF3FF',
      100: '#D6E7FF',
      200: '#ADCEFF',
      300: '#84B5FF',
      400: '#5B9CFF',
      500: '#2E86DE', // Main brand color
      600: '#2A78C8',
      700: '#266AB2',
      800: '#225C9C',
      900: '#1E4E86',
      950: '#1A4070',
    },
    secondary: {
      50: '#F0F9FF',
      100: '#E0F2FE',
      200: '#BAE6FD',
      300: '#7DD3FC',
      400: '#38BDF8',
      500: '#0EA5E9',
      600: '#0284C7',
      700: '#0369A1',
      800: '#075985',
      900: '#0C4A6E',
      950: '#082F49',
    },
  },

  // Semantic Colors
  semantic: {
    success: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      200: '#BBF7D0',
      300: '#86EFAC',
      400: '#4ADE80',
      500: '#22C55E',
      600: '#16A34A',
      700: '#15803D',
      800: '#166534',
      900: '#14532D',
      950: '#052E16',
    },
    warning: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      900: '#78350F',
      950: '#451A03',
    },
    error: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      200: '#FECACA',
      300: '#FCA5A5',
      400: '#F87171',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C',
      800: '#991B1B',
      900: '#7F1D1D',
      950: '#450A0A',
    },
    info: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A',
      950: '#172554',
    },
  },

  // Neutral Colors
  neutral: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },

  // Gray Scale (Alternative to neutral)
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    950: '#030712',
  },

  // Surface Colors
  surface: {
    primary: {
      light: '#FFFFFF',
      dark: '#0F172A',
    },
    secondary: {
      light: '#F8FAFC',
      dark: '#1E293B',
    },
    tertiary: {
      light: '#F1F5F9',
      dark: '#334155',
    },
    elevated: {
      light: '#FFFFFF',
      dark: '#1E293B',
    },
  },

  // Text Colors
  text: {
    primary: {
      light: '#0F172A',
      dark: '#F8FAFC',
    },
    secondary: {
      light: '#475569',
      dark: '#CBD5E1',
    },
    tertiary: {
      light: '#64748B',
      dark: '#94A3B8',
    },
    inverse: {
      light: '#FFFFFF',
      dark: '#0F172A',
    },
    disabled: {
      light: '#94A3B8',
      dark: '#475569',
    },
  },

  // Border Colors
  border: {
    light: {
      light: '#E2E8F0',
      dark: '#334155',
    },
    medium: {
      light: '#CBD5E1',
      dark: '#475569',
    },
    strong: {
      light: '#94A3B8',
      dark: '#64748B',
    },
  },

  // Shadow Colors
  shadow: {
    soft: {
      light: 'rgba(0, 0, 0, 0.05)',
      dark: 'rgba(0, 0, 0, 0.3)',
    },
    medium: {
      light: 'rgba(0, 0, 0, 0.1)',
      dark: 'rgba(0, 0, 0, 0.4)',
    },
    strong: {
      light: 'rgba(0, 0, 0, 0.15)',
      dark: 'rgba(0, 0, 0, 0.5)',
    },
    colored: {
      primary: 'rgba(46, 134, 222, 0.15)',
      success: 'rgba(34, 197, 94, 0.15)',
      warning: 'rgba(245, 158, 11, 0.15)',
      error: 'rgba(239, 68, 68, 0.15)',
    },
  },

  // Status Colors
  status: {
    online: '#22C55E',
    offline: '#94A3B8',
    busy: '#F59E0B',
    away: '#F59E0B',
    error: '#EF4444',
    warning: '#F59E0B',
    success: '#22C55E',
    info: '#3B82F6',
  },

  // Chart Colors
  chart: {
    primary: ['#2E86DE', '#0EA5E9', '#38BDF8', '#7DD3FC', '#BAE6FD'],
    success: ['#22C55E', '#4ADE80', '#86EFAC', '#BBF7D0', '#DCFCE7'],
    warning: ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A', '#FEF3C7'],
    error: ['#EF4444', '#F87171', '#FCA5A5', '#FECACA', '#FEE2E2'],
    neutral: ['#64748B', '#94A3B8', '#CBD5E1', '#E2E8F0', '#F1F5F9'],
  },

  // Accessibility
  accessibility: {
    // High contrast colors for better accessibility
    highContrast: {
      primary: '#0052CC',
      secondary: '#0065FF',
      success: '#00875A',
      warning: '#FF8B00',
      error: '#DE350B',
    },
    // Focus indicators
    focus: {
      light: '#2E86DE',
      dark: '#60A5FA',
    },
  },
};

// Color utility functions
export const colorUtils = {
  // Get color with opacity
  withOpacity: (color: string, opacity: number) => {
    // Convert hex to rgba
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  },

  // Get contrasting text color
  getContrastColor: (backgroundColor: string) => {
    // Simple contrast calculation
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  },

  // Get color variant
  getVariant: (color: string, variant: 'lighter' | 'darker' | 'muted') => {
    // Implementation for color variants
    return color; // Placeholder
  },
};

export default colors; 