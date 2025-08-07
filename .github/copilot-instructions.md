### Bun CLI Output Patterns & Metadata Extraction

#### Function/Type Detection

```sh
bun -e "..." | grep -E 'export (function|const|class|type|interface)|^function |^class |^type |^interface '
```

#### Metadata Extraction (Preview Exports)

```sh
bun -e "import * as mod from './path/to/module'; console.log(Object.keys(mod));"
```

Grep for specific keys:

```sh
bun -e "import * as mod from './xyz_drive'; console.log(Object.keys(mod));" | grep 'useComputeEngine'
```

#### Output Previews (UX)

```sh
bun -e "import { useComputeEngine } from './xyz_drive'; console.log(JSON.stringify({ type: typeof useComputeEngine }, null, 2));" | jq .
```

**Best Practices:**

- Structure output as JSON for easy parsing
- Use Object.keys() or summary objects for module previews
- Combine Bun with grep, jq, or custom scripts for filtering/formatting

### Event-Driven Microtooling System

#### Project Structure Analysis

```sh
bun scripts/micro-ux-explorer.ts --output tree --depth 2
bun scripts/micro-ux-explorer.ts --output json | jq .transportable_ui_data
```

#### Real-time Project Sweeping

```sh
bun -e "
const sweepEvent = {
  type: 'PROJECT_SWEEP',
  timestamp: new Date().toISOString(),
  data: { action: 'analyze_structure' }
};
console.log(JSON.stringify(sweepEvent, null, 2));
"
```

#### Port Management & Process Control

```sh
lsof -ti:3000,3001 | xargs kill -9 2>/dev/null || true
bun -e "console.log('Port 3000 is now available')"
```

#### Environment Configuration Analysis

```sh
bun -e "
const fs = require('fs');
const envExists = fs.existsSync('./.env.local');
const exampleExists = fs.existsSync('./.env.example');
console.log(JSON.stringify({ env_local: envExists, env_example: exampleExists }, null, 2));
"
```

### Example Bun CLI Commands

#### List all exported functions/types from a module

```sh
bun -e "import * as mod from './src/public/projects/core/event/compute/xyz_drive'; console.log(Object.keys(mod));"
```

#### Preview type of a specific export

```sh
bun -e "import { useComputeEngine } from './src/public/projects/core/event/compute/xyz_drive'; console.log(typeof useComputeEngine);"
```

#### Pretty-print metadata for UX

```sh
bun -e "import { useComputeEngine } from './src/public/projects/core/event/compute/xyz_drive'; console.log(JSON.stringify({ type: typeof useComputeEngine }, null, 2));" | jq .
```

# VS Code Copilot Custom Instructions - InternetFriends Portfolio

## Project Overview

This is a Next.js 15.2.4 portfolio application with Turbopack, using TypeScript, SCSS, and advanced component architecture. The project follows snake_case.dots naming convention and implements a "coin of value" color system.

## InternetFriends Design System & Colors

### Brand Color Palette

```scss
// InternetFriends Design Tokens
:root {
  // Primary brand colors
  --if-primary: #3b82f6; // Main brand blue
  --if-primary-hover: #2563eb; // Hover state
  --if-primary-light: rgba(59, 130, 246, 0.08); // Light backgrounds
  --if-primary-active: rgba(59, 130, 246, 0.12); // Active states

  // Glass morphism system
  --glass-bg-header: rgba(255, 255, 255, 0.85);
  --glass-bg-header-scrolled: rgba(255, 255, 255, 0.92);
  --glass-border: rgba(255, 255, 255, 0.12);
  --glass-border-enhanced: rgba(255, 255, 255, 0.18);
  --glass-border-outset: rgba(59, 130, 246, 0.15);

  // Compact border radius system (InternetFriends)
  --radius-xs: 0.25rem; // 4px - Ultra compact
  --radius-sm: 0.375rem; // 6px - Small compact
  --radius-md: 0.5rem; // 8px - Medium compact
  --radius-lg: 0.75rem; // 12px - Large (max for backgrounds)
}
```

### Color System Principles

- **Glass morphism**: Translucent backgrounds with backdrop-filter
- **Compact radius**: Never exceed 12px border radius for backgrounds
- **Blue-centric palette**: #3b82f6 as primary brand color
- **Subtle shadows**: Maximum 0.15 opacity for shadow effects
- **Consistent spacing**: 0.25rem increments for all measurements

## Chat Modes Integration

Reference existing chat modes in `.github/chatmodes/`:

- `internetfriends-dev.md` - Development workflow with Bun and shadcn/ui
- `internetfriends-test.md` - Testing strategies and automation
- `internetfriends-eval.md` - Performance evaluation and metrics
- `internetfriends-infra.md` - Infrastructure and deployment
- `business-intelligence.md` - Data analysis and reporting
- `execute.md` - Code execution and automation
- `ask.md` - General inquiries and documentation

## File Naming Conventions

- Use snake_case.dots naming for files: `header.atomic.tsx`, `header.styles.module.scss`
- Component files should follow: `[component].atomic.tsx` for atomic components
- Style files should follow: `[component].styles.module.scss` for CSS Modules
- Type files should be: `types.ts` or `[component].types.ts`

## Architecture Principles

- **Atomic Design**: Break components into atomic, molecular, and organism levels
- **Data Attributes**: Use data attributes for state management: `data-theme`, `data-scrolled`, `data-active`
- **CSS Modules**: All styles must be CSS Modules compatible (no :global() selectors)
- **"Coin of Value" Color System**: Color is the primary differentiator between light/dark modes

## Styling Guidelines

- Use SCSS with CSS Modules
- Implement theme-aware CSS custom properties: `var(--color-text-primary)`
- Use `map.get()` instead of deprecated `map-get()` for SCSS maps
- Focus states should use 2px dashed borders inspired by Mermaid viewer
- Responsive design with mobile-first approach
- Use backdrop-filter for glass effects

## Color System

```scss
// Light mode
$colors-light: (
  "text-primary": #111827,
  // Dark text on light
  "text-contrast": #000000,
  // Maximum contrast
  "bg-primary": #ffffff,
  // Pure white
  "bg-glass": rgba(255, 255, 255, 0.95),
  "border-focus": #60a5fa, // Blue focus
);

// Dark mode
$colors-dark: (
  "text-primary": #ffffff,
  // White text on dark
  "text-contrast": #ffffff,
  // Maximum contrast
  "bg-primary": #111827,
  // Dark background
  "bg-glass": rgba(17, 24, 39, 0.95),
  "border-focus": #60a5fa, // Blue focus
);
```

## TypeScript Standards

- Use strict TypeScript with proper typing
- Interface definitions in dedicated `types.ts` files
- React component props should be explicitly typed
- Use `React.FC` or explicit return types for components

## Component Structure

```tsx
// Atomic component example
import React from "react";
import styles from "./component.styles.module.scss";
import { ComponentProps } from "./types";

export const ComponentAtomic: React.FC<ComponentProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={`${styles.component} ${className || ""}`} {...props}>
      {children}
    </div>
  );
};
```

## Focus and Interaction States

- Use dashed borders (2px) for focus states like Mermaid viewer
- Active states should use primary color with kbd-style transitions
- Hover states should be subtle with color transitions
- Support both mouse and keyboard navigation

## Testing Approach

- Prefer `bun -e` for quick testing over file creation
- Use Bun as the primary runtime for development and testing
- Jest for comprehensive test suites
- API testing with custom test runners

## Responsive Design

- Mobile-first approach with progressive enhancement
- Use CSS Grid and Flexbox for layouts
- Prevent layout shifts with min-height and proper flex properties
- Ensure single-row layouts don't break into multiple rows on desktop

## Browser Compatibility

- Support modern browsers with CSS custom properties
- Use feature detection for advanced CSS features
- Graceful fallbacks for backdrop-filter and other modern CSS

## Performance Guidelines

- Use CSS-only solutions where possible
- Minimize JavaScript for animations
- Leverage CSS transitions over JavaScript animations
- Use `will-change` for elements that will be animated

## Development Tools

- VS Code with TypeScript, SCSS IntelliSense
- Turbopack for fast builds
- ESLint and Prettier for code formatting
- Bun for package management and runtime

## File Organization

```
app/
├── database-manager/
│   └── components/
│           └── header/
│               ├── header.atomic.tsx
│               ├── components.atomic.tsx
│               ├── header.styles.module.scss
│               ├── types.ts
│               └── index.ts
```

## Code Quality

- Keep components focused and single-responsibility
- Use descriptive variable and function names
- Comment complex logic and architectural decisions
- Maintain clean, readable code structure
- Follow DRY principles while avoiding premature abstraction

## Git and Version Control

- Use conventional commit messages
- Feature branch workflow
- Meaningful branch names: `feature/header`
- Regular commits with focused changes

When generating code, prioritize maintainability, accessibility, and performance. Always consider the responsive behavior and ensure the code follows the established patterns in the project.
