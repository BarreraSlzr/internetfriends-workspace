# InternetFriends Project Architecture

## Overview
This Next.js 15.2.4 project follows atomic design principles integrated with shadcn/ui components, using the InternetFriends design system with snake_case.dots naming convention.

## Project Structure

```
website/
├── app/                              # Next.js App Router
│   ├── (internetfriends)/           # Route group for main site
│   │   ├── components/              # Legacy components (to be migrated)
│   │   ├── hooks/                   # Route-specific hooks
│   │   ├── lib/                     # Route-specific utilities
│   │   └── page.tsx                 # Landing page
│   ├── layout.tsx                   # Root layout
│   └── globals.css                  # Global styles
│
├── components/                       # Component Library
│   ├── ui/                          # shadcn/ui base components
│   │   ├── button.tsx               # Base button component
│   │   ├── input.tsx                # Base input component
│   │   └── ...                      # Other shadcn components
│   │
│   ├── atomic/                      # Atomic Design Level 1
│   │   ├── button/                  # Custom button variants
│   │   │   ├── button.atomic.tsx
│   │   │   ├── button.styles.module.scss
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── input/                   # Custom input variants
│   │   ├── text/                    # Typography components
│   │   └── icons/                   # Icon components
│   │
│   ├── molecular/                   # Atomic Design Level 2
│   │   ├── navigation/              # Navigation components
│   │   │   ├── navigation.molecular.tsx
│   │   │   ├── navigation.styles.module.scss
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── forms/                   # Form compositions
│   │   ├── cards/                   # Card compositions
│   │   └── search/                  # Search components
│   │
│   ├── organisms/                   # Atomic Design Level 3
│   │   ├── header/                  # Site header
│   │   │   ├── header.organism.tsx
│   │   │   ├── header.styles.module.scss
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── hero.section/            # Hero sections
│   │   ├── features.section/        # Feature sections
│   │   ├── testimonials.section/    # Testimonial sections
│   │   ├── contact.section/         # Contact sections
│   │   └── footer.section/          # Footer sections
│   │
│   └── templates/                   # Atomic Design Level 4
│       ├── landing.page/            # Landing page template
│       ├── contact.page/            # Contact page template
│       └── layout/                  # Layout templates
│
├── hooks/                           # Global Custom Hooks
│   ├── use-theme.ts                # Theme management
│   ├── use-scroll.ts               # Scroll utilities
│   ├── use-intersection.ts         # Intersection observer
│   └── index.ts                    # Hook exports
│
├── lib/                            # Utilities & Logic
│   ├── utils/                      # General utilities
│   │   ├── cn.ts                  # Class name utility (shadcn)
│   │   ├── date.ts                # Date utilities
│   │   └── validation.ts          # Form validation
│   ├── compute/                    # Business logic
│   │   ├── analytics.ts           # Analytics logic
│   │   ├── contact.ts             # Contact form logic
│   │   └── subscription.ts        # Newsletter logic
│   ├── api/                        # API utilities
│   │   ├── client.ts              # API client setup
│   │   └── types.ts               # API types
│   └── constants.ts               # App constants
│
├── styles/                         # Global Styles
│   ├── globals.scss               # Global SCSS
│   ├── variables.scss             # SCSS variables
│   ├── mixins.scss                # SCSS mixins
│   ├── themes/                    # Theme definitions
│   │   ├── light.scss            # Light theme
│   │   ├── dark.scss             # Dark theme
│   │   └── index.scss            # Theme exports
│   └── components/                # Component-specific styles
│       ├── base.scss             # Base component styles
│       └── utilities.scss        # Utility classes
│
├── types/                          # TypeScript Definitions
│   ├── global.ts                  # Global type definitions
│   ├── components.ts              # Component prop types
│   ├── api.ts                     # API response types
│   ├── theme.ts                   # Theme types
│   └── index.ts                   # Type exports
│
├── constants/                      # Application Constants
│   ├── colors.ts                  # Color system constants
│   ├── breakpoints.ts             # Responsive breakpoints
│   ├── animations.ts              # Animation constants
│   ├── routes.ts                  # Route constants
│   └── index.ts                   # Constant exports
│
└── public/                         # Static Assets
    ├── images/                     # Image assets
    ├── icons/                      # Icon assets
    └── fonts/                      # Font files
```

## Design System Integration

### Component Hierarchy
1. **shadcn/ui Base** (`/components/ui/`)
   - Unstyled, accessible base components
   - Radix UI primitives with Tailwind styling
   - Foundation for custom variants

2. **Atomic Level** (`/components/atomic/`)
   - Extends shadcn/ui components
   - InternetFriends brand styling
   - Single responsibility principle

3. **Molecular Level** (`/components/molecular/`)
   - Combinations of atomic components
   - Form groups, navigation items, card compositions
   - Reusable UI patterns

4. **Organism Level** (`/components/organisms/`)
   - Complex UI sections
   - Header, footer, hero sections
   - Feature sections, testimonials

5. **Template Level** (`/components/templates/`)
   - Page-level layouts
   - Composition of organisms
   - Routing and data integration

### File Naming Conventions
- Components: `[name].[level].tsx` (e.g., `button.atomic.tsx`)
- Styles: `[name].styles.module.scss`
- Types: `types.ts` or `[name].types.ts`
- Index: `index.ts` (for exports)

### Import Patterns
```tsx
// shadcn/ui base components
import { Button } from '@/components/ui/button';

// Atomic components
import { ButtonAtomic } from '@/components/atomic/button';

// Molecular components
import { NavigationMolecular } from '@/components/molecular/navigation';

// Organisms
import { HeaderOrganism } from '@/components/organisms/header';

// Hooks
import { useTheme } from '@/hooks/use-theme';

// Utilities
import { cn } from '@/lib/utils/cn';
```

## Color System Architecture

### CSS Custom Properties Structure
```scss
// Base system variables
:root {
  // InternetFriends Brand Colors
  --if-primary: #3b82f6;
  --if-primary-hover: #2563eb;
  --if-primary-light: rgba(59, 130, 246, 0.08);

  // Glass morphism system
  --glass-bg-header: rgba(255, 255, 255, 0.85);
  --glass-border: rgba(255, 255, 255, 0.12);

  // Compact radius system
  --radius-xs: 0.25rem;
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
}

// Theme-aware color system
[data-theme="light"] {
  --color-text-primary: #111827;
  --color-bg-primary: #ffffff;
  --color-border-focus: #60a5fa;
}

[data-theme="dark"] {
  --color-text-primary: #ffffff;
  --color-bg-primary: #111827;
  --color-border-focus: #60a5fa;
}
```

## Development Workflow

### Component Creation Process
1. Start with shadcn/ui base component
2. Create atomic variant with InternetFriends styling
3. Compose into molecular components as needed
4. Build organisms from molecular components
5. Create templates using organisms

### Testing Strategy
- Unit tests for atomic components
- Integration tests for molecular/organism components
- E2E tests for complete user flows
- Visual regression testing for design system consistency

### Build Process
- Next.js with Turbopack for fast development
- CSS Modules for scoped styling
- TypeScript for type safety
- Bun for package management and testing

## Integration Guidelines

### shadcn/ui Integration
- Keep base shadcn components unchanged
- Extend functionality in atomic layer
- Use composition over modification
- Maintain accessibility standards

### State Management
- React hooks for local state
- Context for theme management
- Server state via Next.js data fetching
- Form state with controlled components

### Styling Strategy
- CSS Modules for component styles
- Global SCSS for theme variables
- Tailwind utilities for rapid prototyping
- Custom properties for theme switching

### Performance Considerations
- Component lazy loading
- CSS code splitting
- Image optimization
- Bundle size monitoring

This architecture promotes maintainability, scalability, and consistent developer experience while integrating seamlessly with shadcn/ui components.
