# RentEase Design System

A comprehensive, modern design system for property management applications built with React, TypeScript, and Tailwind CSS.

## Table of Contents

- [Overview](#overview)
- [Design Principles](#design-principles)
- [Typography](#typography)
- [Colors](#colors)
- [Spacing](#spacing)
- [Icons](#icons)
- [Components](#components)
- [Accessibility](#accessibility)
- [Usage Guidelines](#usage-guidelines)
- [Getting Started](#getting-started)

## Overview

The RentEase Design System provides a consistent, accessible, and scalable foundation for building property management applications. It includes:

- **Typography System**: Comprehensive font scales and text styles
- **Color Palette**: Semantic colors with accessibility considerations
- **Spacing Scale**: Consistent spacing system based on 4px grid
- **Icon System**: Organized icon categories with usage guidelines
- **Component Library**: Reusable UI components with variants
- **Accessibility**: WCAG 2.1 AA compliant design tokens

## Design Principles

### 1. Accessibility First
- Ensure WCAG 2.1 AA compliance
- Maintain 4.5:1 contrast ratio for normal text
- Provide keyboard navigation support
- Include proper ARIA labels and roles

### 2. Consistency
- Use design tokens instead of hardcoded values
- Maintain visual and behavioral consistency
- Follow established patterns and conventions

### 3. Scalability
- Design for mobile-first responsive layouts
- Create reusable components that scale
- Support multiple screen sizes and orientations

### 4. Performance
- Optimize for speed and efficiency
- Minimize bundle size
- Use efficient animations and transitions

### 5. Maintainability
- Keep components simple and focused
- Provide clear documentation
- Enable easy customization and extension

## Typography

### Font Families

```typescript
// Primary font for UI elements
fontFamily: {
  sans: ['Inter', 'ui-sans-serif', 'system-ui', ...],
  display: ['Montserrat', 'ui-sans-serif', 'system-ui', ...],
  mono: ['JetBrains Mono', 'ui-monospace', ...],
}
```

### Font Sizes

| Size | Value | Usage |
|------|-------|-------|
| xs | 0.75rem (12px) | Captions, small labels |
| sm | 0.875rem (14px) | Body small, form labels |
| base | 1rem (16px) | Body text, default |
| lg | 1.125rem (18px) | Body large |
| xl | 1.25rem (20px) | Subheadings |
| 2xl | 1.5rem (24px) | H3 headings |
| 3xl | 1.875rem (30px) | H2 headings |
| 4xl | 2.25rem (36px) | H1 headings |
| 5xl | 3rem (48px) | Display text |
| 6xl | 3.75rem (60px) | Large display |

### Font Weights

```typescript
fontWeight: {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
}
```

### Usage Examples

```tsx
// Heading styles
<h1 className="text-4xl font-bold tracking-tight">Main Heading</h1>
<h2 className="text-3xl font-semibold tracking-tight">Section Heading</h2>
<h3 className="text-2xl font-semibold">Subsection</h3>

// Body text
<p className="text-base leading-relaxed">Body text with good readability</p>
<p className="text-sm text-neutral-600">Smaller secondary text</p>

// Display text
<h1 className="text-5xl font-bold tracking-tighter">Hero Title</h1>
```

## Colors

### Brand Colors

```typescript
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
}
```

### Semantic Colors

| Color | Usage | Light Mode | Dark Mode |
|-------|-------|------------|-----------|
| Success | Positive actions, confirmations | `#22C55E` | `#4ADE80` |
| Warning | Caution, pending states | `#F59E0B` | `#FBBF24` |
| Error | Errors, destructive actions | `#EF4444` | `#F87171` |
| Info | Information, neutral states | `#3B82F6` | `#60A5FA` |

### Neutral Colors

```typescript
neutral: {
  50: '#F8FAFC',   // Background
  100: '#F1F5F9',  // Subtle background
  200: '#E2E8F0',  // Borders
  300: '#CBD5E1',  // Dividers
  400: '#94A3B8',  // Placeholder text
  500: '#64748B',  // Secondary text
  600: '#475569',  // Primary text
  700: '#334155',  // Strong text
  800: '#1E293B',  // Dark background
  900: '#0F172A',  // Darker background
}
```

### Usage Examples

```tsx
// Brand colors
<button className="bg-primary-500 hover:bg-primary-600 text-white">
  Primary Action
</button>

// Semantic colors
<div className="text-success-600 bg-success-50">Success message</div>
<div className="text-warning-600 bg-warning-50">Warning message</div>
<div className="text-error-600 bg-error-50">Error message</div>

// Neutral colors
<div className="bg-neutral-50 text-neutral-900">Light background</div>
<div className="bg-neutral-800 text-neutral-100">Dark background</div>
```

## Spacing

### Base Spacing Scale

Based on 4px grid system:

| Token | Value | Pixels |
|-------|-------|--------|
| 0 | 0rem | 0px |
| 1 | 0.25rem | 4px |
| 2 | 0.5rem | 8px |
| 3 | 0.75rem | 12px |
| 4 | 1rem | 16px |
| 5 | 1.25rem | 20px |
| 6 | 1.5rem | 24px |
| 8 | 2rem | 32px |
| 10 | 2.5rem | 40px |
| 12 | 3rem | 48px |
| 16 | 4rem | 64px |
| 20 | 5rem | 80px |
| 24 | 6rem | 96px |

### Component Spacing

```typescript
// Button spacing
button: {
  padding: {
    sm: '0.5rem 1rem',    // 8px 16px
    md: '0.75rem 1.5rem', // 12px 24px
    lg: '1rem 2rem',      // 16px 32px
  }
}

// Form spacing
form: {
  field: {
    padding: '0.75rem 1rem', // 12px 16px
    margin: '0.5rem 0',      // 8px 0
  }
}

// Card spacing
card: {
  padding: {
    sm: '1rem',              // 16px
    md: '1.5rem',            // 24px
    lg: '2rem',              // 32px
  }
}
```

### Usage Examples

```tsx
// Margin and padding
<div className="m-4 p-6">Content with margin and padding</div>

// Spacing between elements
<div className="space-y-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

// Responsive spacing
<div className="p-4 md:p-6 lg:p-8">Responsive padding</div>
```

## Icons

### Icon Categories

```typescript
iconCategories: {
  navigation: { home, menu, close, ... },
  user: { user, userCircle, settings, ... },
  property: { building, location, money, ... },
  actions: { add, edit, delete, view, ... },
  status: { success, error, warning, ... },
  maintenance: { wrench, ... },
  documents: { document, ... },
  analytics: { chart, ... },
  settings: { cog, ... },
  security: { lock, ... },
  notifications: { bell, email, ... },
  time: { calendar, clock, ... },
  finance: { creditCard, ... },
  weather: { sun, moon, ... },
}
```

### Icon Sizes

| Size | Value | Usage |
|------|-------|-------|
| xs | h-3 w-3 (12px) | Small decorative |
| sm | h-4 w-4 (16px) | Buttons, form inputs |
| md | h-5 w-5 (20px) | Navigation, status |
| lg | h-6 w-6 (24px) | Decorative, large buttons |
| xl | h-8 w-8 (32px) | Hero sections |
| 2xl | h-10 w-10 (40px) | Large displays |

### Usage Examples

```tsx
import { HomeIcon, UserIcon, PlusIcon } from '@heroicons/react/24/outline';

// Basic icon usage
<HomeIcon className="h-5 w-5 text-neutral-600" />

// Icon with text
<button className="flex items-center gap-2">
  <PlusIcon className="h-4 w-4" />
  Add Property
</button>

// Icon with different sizes
<UserIcon className="h-6 w-6 md:h-8 md:w-8" />
```

## Components

### Core Components

#### Button
```tsx
<Button variant="primary" size="md">
  Click me
</Button>
```

Variants: `primary`, `secondary`, `outline`, `ghost`, `destructive`
Sizes: `sm`, `md`, `lg`, `xl`

#### Card
```tsx
<Card>
  <CardHeader>
    <CardTitle>Property Details</CardTitle>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>
```

#### Input
```tsx
<Input
  type="text"
  placeholder="Enter property name"
  label="Property Name"
/>
```

#### Table
```tsx
<ResponsiveTable
  data={properties}
  columns={columns}
  onRowClick={handleRowClick}
/>
```

### Layout Components

#### Container
```tsx
<Container maxWidth="lg">
  <div>Content</div>
</Container>
```

#### Grid
```tsx
<ResponsiveGrid
  items={properties}
  renderItem={(property) => <PropertyCard property={property} />}
  breakpoints={{
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4
  }}
/>
```

### Feedback Components

#### Alert
```tsx
<Alert variant="success">
  Property saved successfully!
</Alert>
```

#### LoadingSpinner
```tsx
<LoadingSpinner size="md" />
```

## Accessibility

### Color Contrast
- Normal text: 4.5:1 minimum contrast ratio
- Large text: 3:1 minimum contrast ratio
- All colors tested for accessibility compliance

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Focus indicators are clearly visible
- Tab order follows logical document flow

### Screen Reader Support
- Proper ARIA labels and roles
- Semantic HTML structure
- Descriptive alt text for images

### Touch Targets
- Minimum 44px touch targets for mobile
- Adequate spacing between interactive elements
- Touch-friendly button sizes

## Usage Guidelines

### Do's
- ✅ Use design system tokens consistently
- ✅ Follow established component patterns
- ✅ Test for accessibility compliance
- ✅ Maintain responsive design principles
- ✅ Use semantic HTML elements
- ✅ Provide clear visual feedback

### Don'ts
- ❌ Don't use hardcoded colors or spacing
- ❌ Don't create custom components without checking existing ones
- ❌ Don't ignore accessibility requirements
- ❌ Don't use non-semantic HTML elements
- ❌ Don't skip responsive design considerations

### Best Practices

1. **Consistency**: Always use design system tokens
2. **Accessibility**: Test with screen readers and keyboard navigation
3. **Performance**: Optimize components for speed
4. **Maintainability**: Keep components simple and focused
5. **Documentation**: Document component usage and variants

## Getting Started

### Installation

The design system is already integrated into the project. Import components as needed:

```tsx
import { Button, Card, Input } from '@/components/ui';
import { designSystem } from '@/design-system';
```

### Basic Usage

```tsx
import React from 'react';
import { Button, Card, Input } from '@/components/ui';

function PropertyForm() {
  return (
    <Card>
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Add Property</h2>
        <form className="space-y-4">
          <Input
            label="Property Name"
            placeholder="Enter property name"
            required
          />
          <Button type="submit" variant="primary">
            Save Property
          </Button>
        </form>
      </div>
    </Card>
  );
}
```

### Customization

The design system can be customized by modifying the Tailwind configuration:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          // Custom primary colors
        }
      }
    }
  }
}
```

### Contributing

When adding new components or modifying existing ones:

1. Follow established patterns
2. Include proper TypeScript types
3. Add accessibility features
4. Test across different screen sizes
5. Update documentation
6. Ensure consistent styling

---

For more detailed information, refer to the individual component documentation and the design system source code. 