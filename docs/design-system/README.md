# InternetFriends Design System Documentation

## Overview

The InternetFriends Design System is a comprehensive, modern design language that emphasizes **glass morphism**, **compact spacing**, and **blue-centric aesthetics**. Built for Next.js 15.2.4 with TypeScript and SCSS, it provides a cohesive visual and interactive experience across all components.

## Core Principles

### 1. Glass Morphism First
- Translucent backgrounds with backdrop-filter
- Subtle borders and shadows
- Layered depth through transparency
- Maximum shadow opacity: 0.15

### 2. Compact Design Language
- Border radius never exceeds 12px for backgrounds
- 0.25rem incremental spacing system
- Efficient use of space without feeling cramped
- Mobile-first responsive approach

### 3. Blue-Centric Color Palette
- Primary brand color: `#3b82f6` (Blue 500)
- Color as the primary differentiator between themes
- Consistent color temperature across the spectrum
- High contrast ratios for accessibility

## Design Tokens

### Color System

```scss
// Primary Brand Colors
:root {
  --if-primary: #3b82f6;              // Main brand blue
  --if-primary-hover: #2563eb;        // Hover state (Blue 600)
  --if-primary-light: rgba(59, 130, 246, 0.08);  // Light backgrounds
  --if-primary-active: rgba(59, 130, 246, 0.12); // Active states
}

// Glass Morphism System
:root {
  --glass-bg-header: rgba(255, 255, 255, 0.85);
  --glass-bg-header-scrolled: rgba(255, 255, 255, 0.92);
  --glass-bg-primary: rgba(255, 255, 255, 0.75);
  --glass-border: rgba(255, 255, 255, 0.12);
  --glass-border-enhanced: rgba(255, 255, 255, 0.18);
  --glass-border-outset: rgba(59, 130, 246, 0.15);
}

// Theme-Aware Colors
$colors-light: (
  'text-primary': #111827,        // Gray 900
  'text-secondary': #6b7280,      // Gray 500
  'text-contrast': #000000,       // Maximum contrast
  'bg-primary': #ffffff,          // Pure white
  'border-focus': #60a5fa         // Blue 400
);

$colors-dark: (
  'text-primary': #ffffff,        // Pure white
  'text-secondary': #9ca3af,      // Gray 400
  'text-contrast': #ffffff,       // Maximum contrast
  'bg-primary': #111827,          // Gray 900
  'border-focus': #60a5fa         // Blue 400
);
```

### Spacing System

```scss
// Compact Spacing Scale (0.25rem increments)
:root {
  --space-xs: 0.25rem;    // 4px
  --space-sm: 0.5rem;     // 8px
  --space-md: 0.75rem;    // 12px
  --space-lg: 1rem;       // 16px
  --space-xl: 1.25rem;    // 20px
  --space-2xl: 1.5rem;    // 24px
  --space-3xl: 2rem;      // 32px
}
```

### Border Radius System

```scss
// Compact Radius System
:root {
  --radius-xs: 0.25rem;   // 4px - Ultra compact
  --radius-sm: 0.375rem;  // 6px - Small compact
  --radius-md: 0.5rem;    // 8px - Medium compact
  --radius-lg: 0.75rem;   // 12px - Large (max for backgrounds)
}
```

### Typography Scale

```scss
// Typography System
:root {
  --font-size-xs: 0.75rem;     // 12px
  --font-size-sm: 0.875rem;    // 14px
  --font-size-base: 1rem;      // 16px
  --font-size-lg: 1.125rem;    // 18px
  --font-size-xl: 1.25rem;     // 20px
  --font-size-2xl: 1.5rem;     // 24px
  --font-size-3xl: 1.875rem;   // 30px
  --font-size-4xl: 2.25rem;    // 36px
}

// Font Weights
:root {
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

## Component Architecture

### File Structure

```
components/
├── atomic/              # Atomic components (buttons, inputs, etc.)
│   └── [component]/
│       ├── [component].atomic.tsx
│       ├── [component].styles.module.scss
│       ├── types.ts
│       └── index.ts
├── molecular/           # Molecular components (forms, cards, etc.)
│   └── [component]/
│       ├── [component].molecular.tsx
│       ├── [component].styles.module.scss
│       ├── types.ts
│       └── index.ts
└── organism/           # Organism components (dashboards, tables, etc.)
    └── [component]/
        ├── [component].organism.tsx
        ├── [component].styles.module.scss
        ├── types.ts
        └── index.ts
```

### Naming Conventions

- **Files**: snake_case.dots naming
  - Components: `button.atomic.tsx`, `data-table.organism.tsx`
  - Styles: `button.styles.module.scss`
  - Types: `types.ts`

- **Components**: PascalCase with level suffix
  - Atomic: `ButtonAtomic`, `InputAtomic`
  - Molecular: `FormMolecular`, `CardMolecular`
  - Organism: `DashboardOrganism`, `DataTableOrganism`

- **CSS Classes**: kebab-case with BEM methodology
  - Block: `.button`, `.data-table`
  - Element: `.button__icon`, `.data-table__header`
  - Modifier: `.button--primary`, `.data-table--compact`

## CSS Methodology

### CSS Modules + SCSS

All styling uses CSS Modules for scoping with SCSS for preprocessing:

```scss
// Component styles structure
.component {
  // Base component styles
  display: flex;
  background: var(--glass-bg-primary);
  border-radius: var(--radius-md);

  // Element styles
  &__header {
    padding: var(--space-md);
    border-bottom: 1px solid var(--glass-border);
  }

  &__content {
    padding: var(--space-lg);
  }

  // Modifier styles
  &--compact {
    padding: var(--space-sm);
  }

  // State styles
  &:hover {
    background: var(--glass-bg-header);
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px dashed var(--if-primary);
    outline-offset: 2px;
  }
}
```

### Glass Morphism Implementation

```scss
// Standard glass effect
.glass-container {
  background: var(--glass-bg-primary);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
}

// Enhanced glass effect (for headers/important elements)
.glass-enhanced {
  background: var(--glass-bg-header-scrolled);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border-enhanced);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
```

## Interaction Patterns

### Focus States

All interactive elements use dashed borders inspired by Mermaid viewer:

```scss
.interactive-element {
  &:focus-visible {
    outline: 2px dashed var(--if-primary);
    outline-offset: 2px;
    border-radius: var(--radius-xs);
  }
}
```

### Hover States

Subtle elevation and color changes:

```scss
.hoverable {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    background: var(--if-primary-light);
  }
}
```

### Active States

Kbd-style transitions with primary color:

```scss
.pressable {
  &:active {
    transform: translateY(0) scale(0.98);
    background: var(--if-primary-active);
    transition-duration: 0.1s;
  }
}
```

## Responsive Design

### Breakpoints

```scss
// Mobile-first breakpoints
$breakpoints: (
  'sm': 640px,   // Small devices
  'md': 768px,   // Medium devices
  'lg': 1024px,  // Large devices
  'xl': 1280px,  // Extra large devices
  '2xl': 1536px  // 2x extra large devices
);

// Usage
@media (min-width: map.get($breakpoints, 'md')) {
  .component {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

### Container Queries (where supported)

```scss
.adaptive-component {
  container-type: inline-size;

  @container (min-width: 400px) {
    .component__content {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
  }
}
```

## Animation Guidelines

### Transitions

Use consistent easing curves and durations:

```scss
// Standard transitions
.animated-element {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

// Slower for complex animations
.complex-animation {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Keyframe Animations

```scss
// Loading spinner
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// Pulse effect
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

// Slide in from bottom
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Reduced Motion Support

```scss
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Accessibility

### Color Contrast

All text meets WCAG 2.1 AA standards:
- Normal text: 4.5:1 contrast ratio minimum
- Large text: 3:1 contrast ratio minimum
- Interactive elements: 3:1 contrast ratio minimum

### Focus Management

```typescript
// Focus trap for modals
const focusTrap = (element: HTMLElement) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  firstElement?.focus();

  element.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    }
  });
};
```

### ARIA Patterns

```tsx
// Example: Accessible button with loading state
const AccessibleButton: React.FC<{
  loading?: boolean;
  children: React.ReactNode;
}> = ({ loading, children, ...props }) => (
  <button
    {...props}
    aria-busy={loading}
    aria-disabled={loading}
    className={styles.button}
  >
    {loading && <span aria-hidden="true" className={styles.spinner} />}
    <span className={loading ? styles.srOnly : ''}>
      {children}
    </span>
  </button>
);
```

## Dark Mode Support

### CSS Custom Properties Approach

```scss
[data-theme="light"] {
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  --glass-bg-primary: rgba(255, 255, 255, 0.75);
}

[data-theme="dark"] {
  --color-text-primary: #ffffff;
  --color-text-secondary: #9ca3af;
  --glass-bg-primary: rgba(17, 24, 39, 0.75);
}
```

### System Preference Detection

```typescript
// Theme detection and management
const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateTheme = () => {
      if (theme === 'system') {
        document.documentElement.setAttribute(
          'data-theme',
          mediaQuery.matches ? 'dark' : 'light'
        );
      }
    };

    updateTheme();
    mediaQuery.addEventListener('change', updateTheme);

    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, [theme]);

  return { theme, setTheme };
};
```

## Performance Considerations

### CSS Optimization

- Use `transform` and `opacity` for animations
- Avoid layout-triggering properties during animations
- Use `will-change` sparingly and remove after animation
- Leverage CSS containment where appropriate

### Bundle Size

- CSS Modules for automatic tree-shaking
- SCSS partial imports to avoid unused styles
- Critical CSS inlining for above-the-fold content

### Runtime Performance

```scss
// Efficient animation using transforms
.optimized-animation {
  will-change: transform, opacity;

  &:hover {
    transform: translateY(-2px);
    // Avoid: top, left, width, height changes
  }
}
```

## Component Examples

### Atomic Component Example

```tsx
// button.atomic.tsx
import React from 'react';
import styles from './button.styles.module.scss';
import { ButtonProps } from './types';

export const ButtonAtomic: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  children,
  className,
  ...props
}) => {
  return (
    <button
      className={`
        ${styles.button}
        ${styles[`variant-${variant}`]}
        ${styles[`size-${size}`]}
        ${loading ? styles.loading : ''}
        ${disabled ? styles.disabled : ''}
        ${className || ''}
      `}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      <span className={loading ? styles.content : ''}>{children}</span>
    </button>
  );
};
```

### Organism Component Example

```tsx
// dashboard.organism.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UIEvents } from '../../../lib/events/event.system';
import styles from './dashboard.styles.module.scss';
import { DashboardProps } from './types';

export const DashboardOrganism: React.FC<DashboardProps> = ({
  userId,
  sessionId,
  className,
  ...props
}) => {
  // Component implementation with event integration
  useEffect(() => {
    UIEvents.pageLoad('dashboard', performance.now(), userId);
  }, [userId]);

  return (
    <motion.div
      className={`${styles.dashboard} ${className || ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      {...props}
    >
      {/* Dashboard content */}
    </motion.div>
  );
};
```

## Testing

### Visual Regression Testing

Use tools like Chromatic or Percy for visual regression testing across:
- Different screen sizes
- Light/dark themes
- Browser variations
- Component states

### Accessibility Testing

```bash
# Run accessibility tests
bun run test:a11y

# Lighthouse CI for performance
bun run lighthouse
```

## Tools and Resources

### Development Tools

- **VS Code Extensions**:
  - SCSS IntelliSense
  - CSS Modules
  - ESLint
  - Prettier

- **Browser Extensions**:
  - React Developer Tools
  - axe DevTools (accessibility)
  - Lighthouse

### Design Resources

- **Figma Community**: InternetFriends Design System
- **Color Palette**: Accessible color contrast checker
- **Typography**: System font stack with web font fallbacks

## Migration Guide

### From Legacy Components

1. **Identify component type** (atomic, molecular, organism)
2. **Update file structure** to match naming conventions
3. **Migrate styles** to CSS Modules + SCSS
4. **Add TypeScript types** following interface patterns
5. **Integrate event system** for user interaction tracking
6. **Test accessibility** and responsive behavior

### Breaking Changes

When updating the design system:
- Document all breaking changes
- Provide migration scripts where possible
- Maintain backward compatibility for one major version
- Use semantic versioning for design token updates

## Contributing

### Adding New Components

1. Follow the file structure guidelines
2. Use the component templates
3. Include comprehensive TypeScript types
4. Write accessibility-first markup
5. Test across all supported browsers
6. Document usage examples

### Modifying Design Tokens

1. Propose changes through RFC process
2. Consider impact on existing components
3. Update documentation and examples
4. Run full regression test suite
5. Get design team approval

---

For more detailed examples and interactive documentation, visit the [InternetFriends Component Library](http://localhost:3000/design-system).
