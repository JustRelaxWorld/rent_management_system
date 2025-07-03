// Typography System for RentEase
export const typography = {
  // Font Families
  fonts: {
    sans: [
      'Inter',
      'ui-sans-serif',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif'
    ],
    display: [
      'Montserrat',
      'ui-sans-serif',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif'
    ],
    mono: [
      'JetBrains Mono',
      'ui-monospace',
      'SFMono-Regular',
      'Menlo',
      'Monaco',
      'Consolas',
      'Liberation Mono',
      'Courier New',
      'monospace'
    ]
  },

  // Font Sizes
  sizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
    '7xl': '4.5rem',   // 72px
    '8xl': '6rem',     // 96px
    '9xl': '8rem',     // 128px
  },

  // Font Weights
  weights: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  // Line Heights
  lineHeights: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  // Text Styles
  styles: {
    // Headings
    h1: {
      fontSize: '2.25rem', // 36px
      lineHeight: '2.5rem',
      fontWeight: '700',
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '1.875rem', // 30px
      lineHeight: '2.25rem',
      fontWeight: '600',
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: '1.5rem', // 24px
      lineHeight: '2rem',
      fontWeight: '600',
      letterSpacing: '-0.025em',
    },
    h4: {
      fontSize: '1.25rem', // 20px
      lineHeight: '1.75rem',
      fontWeight: '600',
      letterSpacing: '-0.025em',
    },
    h5: {
      fontSize: '1.125rem', // 18px
      lineHeight: '1.75rem',
      fontWeight: '600',
      letterSpacing: '-0.025em',
    },
    h6: {
      fontSize: '1rem', // 16px
      lineHeight: '1.5rem',
      fontWeight: '600',
      letterSpacing: '-0.025em',
    },

    // Body Text
    body: {
      fontSize: '1rem', // 16px
      lineHeight: '1.625rem',
      fontWeight: '400',
    },
    bodyLarge: {
      fontSize: '1.125rem', // 18px
      lineHeight: '1.75rem',
      fontWeight: '400',
    },
    bodySmall: {
      fontSize: '0.875rem', // 14px
      lineHeight: '1.5rem',
      fontWeight: '400',
    },

    // UI Text
    caption: {
      fontSize: '0.75rem', // 12px
      lineHeight: '1rem',
      fontWeight: '500',
      letterSpacing: '0.025em',
    },
    button: {
      fontSize: '0.875rem', // 14px
      lineHeight: '1.25rem',
      fontWeight: '600',
      letterSpacing: '0.025em',
    },
    label: {
      fontSize: '0.875rem', // 14px
      lineHeight: '1.25rem',
      fontWeight: '500',
    },

    // Display Text
    display: {
      fontSize: '3.75rem', // 60px
      lineHeight: '4rem',
      fontWeight: '700',
      letterSpacing: '-0.05em',
    },
    displayLarge: {
      fontSize: '4.5rem', // 72px
      lineHeight: '5rem',
      fontWeight: '800',
      letterSpacing: '-0.05em',
    },
  },

  // Responsive Typography
  responsive: {
    h1: {
      xs: 'text-2xl',    // 24px
      sm: 'text-3xl',    // 30px
      md: 'text-4xl',    // 36px
      lg: 'text-5xl',    // 48px
      xl: 'text-6xl',    // 60px
    },
    h2: {
      xs: 'text-xl',     // 20px
      sm: 'text-2xl',    // 24px
      md: 'text-3xl',    // 30px
      lg: 'text-4xl',    // 36px
      xl: 'text-5xl',    // 48px
    },
    h3: {
      xs: 'text-lg',     // 18px
      sm: 'text-xl',     // 20px
      md: 'text-2xl',    // 24px
      lg: 'text-3xl',    // 30px
      xl: 'text-4xl',    // 36px
    },
    body: {
      xs: 'text-sm',     // 14px
      sm: 'text-base',   // 16px
      md: 'text-lg',     // 18px
      lg: 'text-xl',     // 20px
      xl: 'text-2xl',    // 24px
    },
  }
};

export default typography; 