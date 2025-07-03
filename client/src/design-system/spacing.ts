// Spacing System for RentEase
export const spacing = {
  // Base spacing units (in rem)
  base: {
    0: '0rem',      // 0px
    0.5: '0.125rem', // 2px
    1: '0.25rem',   // 4px
    1.5: '0.375rem', // 6px
    2: '0.5rem',    // 8px
    2.5: '0.625rem', // 10px
    3: '0.75rem',   // 12px
    3.5: '0.875rem', // 14px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    7: '1.75rem',   // 28px
    8: '2rem',      // 32px
    9: '2.25rem',   // 36px
    10: '2.5rem',   // 40px
    11: '2.75rem',  // 44px
    12: '3rem',     // 48px
    14: '3.5rem',   // 56px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    28: '7rem',     // 112px
    32: '8rem',     // 128px
    36: '9rem',     // 144px
    40: '10rem',    // 160px
    44: '11rem',    // 176px
    48: '12rem',    // 192px
    52: '13rem',    // 208px
    56: '14rem',    // 224px
    60: '15rem',    // 240px
    64: '16rem',    // 256px
    72: '18rem',    // 288px
    80: '20rem',    // 320px
    96: '24rem',    // 384px
  },

  // Component-specific spacing
  components: {
    // Button spacing
    button: {
      padding: {
        sm: '0.5rem 1rem',    // 8px 16px
        md: '0.75rem 1.5rem', // 12px 24px
        lg: '1rem 2rem',      // 16px 32px
        xl: '1.25rem 2.5rem', // 20px 40px
      },
      gap: {
        sm: '0.5rem',         // 8px
        md: '0.75rem',        // 12px
        lg: '1rem',           // 16px
        xl: '1.25rem',        // 20px
      },
    },

    // Form spacing
    form: {
      field: {
        padding: '0.75rem 1rem', // 12px 16px
        margin: '0.5rem 0',      // 8px 0
        gap: '0.25rem',          // 4px
      },
      group: {
        gap: '1rem',             // 16px
        margin: '1.5rem 0',      // 24px 0
      },
      section: {
        padding: '2rem',         // 32px
        margin: '2rem 0',        // 32px 0
        gap: '1.5rem',           // 24px
      },
    },

    // Card spacing
    card: {
      padding: {
        sm: '1rem',              // 16px
        md: '1.5rem',            // 24px
        lg: '2rem',              // 32px
        xl: '2.5rem',            // 40px
      },
      gap: '1rem',               // 16px
      margin: '1rem 0',          // 16px 0
    },

    // Layout spacing
    layout: {
      container: {
        padding: '2rem',         // 32px
        maxWidth: '80rem',       // 1280px
        margin: '0 auto',        // 0 auto
      },
      section: {
        padding: '4rem 2rem',    // 64px 32px
        margin: '2rem 0',        // 32px 0
      },
      header: {
        padding: '1rem 2rem',    // 16px 32px
        height: '4rem',          // 64px
      },
      sidebar: {
        width: '20rem',          // 320px
        padding: '1.5rem',       // 24px
      },
    },

    // Navigation spacing
    navigation: {
      item: {
        padding: '0.75rem 1rem', // 12px 16px
        gap: '0.75rem',          // 12px
        margin: '0.25rem 0',     // 4px 0
      },
      group: {
        gap: '0.5rem',           // 8px
        margin: '1rem 0',        // 16px 0
      },
    },

    // Table spacing
    table: {
      cell: {
        padding: '0.75rem 1rem', // 12px 16px
        gap: '0.5rem',           // 8px
      },
      row: {
        padding: '0.5rem 0',     // 8px 0
        gap: '1rem',             // 16px
      },
      header: {
        padding: '1rem',         // 16px
        gap: '0.75rem',          // 12px
      },
    },

    // Modal spacing
    modal: {
      padding: '2rem',           // 32px
      gap: '1.5rem',             // 24px
      margin: '2rem',            // 32px
      maxWidth: '32rem',         // 512px
    },

    // Alert spacing
    alert: {
      padding: '1rem 1.5rem',    // 16px 24px
      gap: '0.75rem',            // 12px
      margin: '1rem 0',          // 16px 0
    },

    // Badge spacing
    badge: {
      padding: '0.25rem 0.75rem', // 4px 12px
      gap: '0.25rem',             // 4px
      margin: '0.25rem',          // 4px
    },
  },

  // Responsive spacing
  responsive: {
    // Mobile-first spacing
    mobile: {
      container: '1rem',         // 16px
      section: '2rem 1rem',      // 32px 16px
      card: '1rem',              // 16px
      button: '0.75rem 1.5rem',  // 12px 24px
    },
    tablet: {
      container: '2rem',         // 32px
      section: '3rem 2rem',      // 48px 32px
      card: '1.5rem',            // 24px
      button: '0.75rem 1.5rem',  // 12px 24px
    },
    desktop: {
      container: '2rem',         // 32px
      section: '4rem 2rem',      // 64px 32px
      card: '2rem',              // 32px
      button: '1rem 2rem',       // 16px 32px
    },
    wide: {
      container: '3rem',         // 48px
      section: '5rem 3rem',      // 80px 48px
      card: '2.5rem',            // 40px
      button: '1.25rem 2.5rem',  // 20px 40px
    },
  },

  // Spacing utilities
  utilities: {
    // Margin utilities
    margin: {
      auto: 'auto',
      none: '0',
      xs: '0.25rem',    // 4px
      sm: '0.5rem',     // 8px
      md: '1rem',       // 16px
      lg: '1.5rem',     // 24px
      xl: '2rem',       // 32px
      '2xl': '3rem',    // 48px
      '3xl': '4rem',    // 64px
    },

    // Padding utilities
    padding: {
      none: '0',
      xs: '0.25rem',    // 4px
      sm: '0.5rem',     // 8px
      md: '1rem',       // 16px
      lg: '1.5rem',     // 24px
      xl: '2rem',       // 32px
      '2xl': '3rem',    // 48px
      '3xl': '4rem',    // 64px
    },

    // Gap utilities
    gap: {
      none: '0',
      xs: '0.25rem',    // 4px
      sm: '0.5rem',     // 8px
      md: '1rem',       // 16px
      lg: '1.5rem',     // 24px
      xl: '2rem',       // 32px
      '2xl': '3rem',    // 48px
      '3xl': '4rem',    // 64px
    },
  },

  // Spacing guidelines
  guidelines: {
    // Component spacing rules
    rules: {
      // Minimum touch target size
      touchTarget: '2.75rem',    // 44px
      
      // Minimum spacing between interactive elements
      interactiveGap: '0.5rem',  // 8px
      
      // Standard content spacing
      contentGap: '1rem',        // 16px
      
      // Section spacing
      sectionGap: '2rem',        // 32px
      
      // Container padding
      containerPadding: '1rem',  // 16px
    },

    // Spacing scale
    scale: {
      // 4px base unit
      unit: '0.25rem',           // 4px
      
      // Scale multipliers
      xs: 1,                     // 4px
      sm: 2,                     // 8px
      md: 4,                     // 16px
      lg: 6,                     // 24px
      xl: 8,                     // 32px
      '2xl': 12,                 // 48px
      '3xl': 16,                 // 64px
    },
  },
};

export default spacing; 