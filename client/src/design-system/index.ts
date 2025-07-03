// RentEase Design System
// A comprehensive design system for the Rent Management System

// Core Design System Modules
export { default as typography } from './typography';
export { default as colors } from './colors';
export { default as iconCategories } from './icons';
export { default as spacing } from './spacing';

// Re-export specific exports for easier access
export { typography as typographySystem } from './typography';
export { colors as colorSystem } from './colors';
export { iconCategories as iconSystem, iconSizes, iconGuidelines } from './icons';
export { spacing as spacingSystem } from './spacing';

// Import modules for internal use
import typography from './typography';
import colors from './colors';
import spacing from './spacing';

// Design System Configuration
export const designSystem = {
  name: 'RentEase Design System',
  version: '1.0.0',
  description: 'A modern, accessible design system for property management applications',
  
  // Brand Information
  brand: {
    name: 'RentEase',
    tagline: 'Modern Property Management',
    primaryColor: '#2E86DE',
    secondaryColor: '#0EA5E9',
  },

  // Design Principles
  principles: {
    accessibility: 'Design for everyone, ensuring WCAG 2.1 AA compliance',
    consistency: 'Maintain visual and behavioral consistency across all components',
    scalability: 'Build components that scale from mobile to desktop',
    performance: 'Optimize for speed and efficiency',
    maintainability: 'Create reusable, well-documented components',
  },

  // Usage Guidelines
  guidelines: {
    // Typography Guidelines
    typography: {
      headings: 'Use semantic heading hierarchy (h1-h6) for content structure',
      body: 'Use body text for main content with appropriate line height',
      buttons: 'Use button text style for interactive elements',
      labels: 'Use label text for form labels and small UI text',
    },

    // Color Guidelines
    colors: {
      primary: 'Use primary colors for main actions and brand elements',
      semantic: 'Use semantic colors for status and feedback',
      neutral: 'Use neutral colors for text, borders, and backgrounds',
      accessibility: 'Ensure sufficient color contrast (4.5:1 minimum)',
    },

    // Icon Guidelines
    icons: {
      size: 'Choose appropriate icon sizes based on context',
      color: 'Use consistent icon colors that match text colors',
      meaning: 'Use icons that clearly communicate their purpose',
      accessibility: 'Provide alt text for icons when necessary',
    },

    // Spacing Guidelines
    spacing: {
      consistency: 'Use the spacing scale consistently throughout the application',
      hierarchy: 'Use larger spacing for major sections, smaller for details',
      responsive: 'Adjust spacing based on screen size',
      touch: 'Ensure minimum 44px touch targets for mobile',
    },
  },

  // Component Categories
  components: {
    // Layout Components
    layout: [
      'Container',
      'Grid',
      'Flex',
      'Stack',
      'Divider',
    ],

    // Navigation Components
    navigation: [
      'Sidebar',
      'Header',
      'Breadcrumb',
      'Pagination',
      'Tabs',
    ],

    // Form Components
    forms: [
      'Input',
      'Select',
      'Checkbox',
      'Radio',
      'Textarea',
      'Button',
      'Form',
    ],

    // Feedback Components
    feedback: [
      'Alert',
      'Toast',
      'Progress',
      'Skeleton',
      'Spinner',
    ],

    // Data Display Components
    data: [
      'Table',
      'Card',
      'List',
      'Badge',
      'Avatar',
    ],

    // Overlay Components
    overlay: [
      'Modal',
      'Drawer',
      'Tooltip',
      'Popover',
      'Dropdown',
    ],
  },

  // Responsive Breakpoints
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Animation Guidelines
  animations: {
    duration: {
      fast: '100ms',
      normal: '200ms',
      slow: '300ms',
      slower: '500ms',
    },
    easing: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
    properties: {
      color: 'color',
      background: 'background-color',
      transform: 'transform',
      opacity: 'opacity',
      all: 'all',
    },
  },

  // Accessibility Standards
  accessibility: {
    standards: 'WCAG 2.1 AA',
    contrast: {
      normal: '4.5:1',
      large: '3:1',
    },
    touchTarget: '44px minimum',
    focusIndicator: 'Visible focus indicators required',
    keyboardNavigation: 'Full keyboard navigation support',
    screenReader: 'Proper ARIA labels and roles',
  },
};

// Utility Functions
export const designSystemUtils = {
  // Get responsive value
  getResponsiveValue: (values: Record<string, any>, breakpoint: string) => {
    return values[breakpoint] || values.default || values.base;
  },

  // Generate CSS custom properties
  generateCSSVariables: () => {
    const variables: Record<string, string> = {};
    
    // Color variables
    Object.entries(colors.brand.primary).forEach(([key, value]) => {
      variables[`--color-primary-${key}`] = String(value);
    });
    
    // Spacing variables
    Object.entries(spacing.base).forEach(([key, value]) => {
      variables[`--spacing-${key}`] = String(value);
    });
    
    return variables;
  },
};

// Design System Documentation
export const documentation = {
  // Getting Started
  gettingStarted: {
    installation: 'Import the design system modules as needed',
    usage: 'Use the provided components and utilities consistently',
    customization: 'Extend the design system while maintaining consistency',
  },

  // Best Practices
  bestPractices: {
    consistency: 'Always use design system tokens instead of hardcoded values',
    accessibility: 'Test components for accessibility compliance',
    performance: 'Optimize components for performance',
    maintainability: 'Keep components simple and reusable',
  },

  // Migration Guide
  migration: {
    fromLegacy: 'Gradually replace legacy components with design system components',
    testing: 'Test thoroughly when migrating components',
    documentation: 'Update documentation to reflect design system usage',
  },
};

export default designSystem; 