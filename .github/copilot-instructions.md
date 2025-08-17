# 🎭 Enhanced Copilot Instructions - InternetFriends Portfolio

## 🚀 Epic-Based Development Workflow

### Epic Strategy Integration

This project uses an **Epic-Based Git Strategy** where development is organized into visual epics that appear as merged branches in the git timeline. Each epic represents a complete milestone or feature set.

#### Epic Management Commands

```sh
# Start new epic
./scripts/epic-tools/epic start <epic-name> --timeline="2-3 weeks" --goal="Epic objective"

# Add features to epic
./scripts/epic-tools/epic feature add <epic-name> <feature-name>

# Complete features
./scripts/epic-tools/epic feature done <epic-name> <feature-name> "Description"

# Complete epic
./scripts/epic-tools/epic complete <epic-name> --version="v1.2.0" --impact-performance="+40%"

# Monitor progress
./scripts/epic-tools/epic dashboard
./scripts/epic-tools/epic graph 20
```

#### Epic-Aware Development

When working on features, always consider:

- **Which epic does this belong to?** - Group related features into meaningful epics
- **Epic completion metrics** - Track performance, velocity, and quality improvements
- **Visual git timeline** - Each commit should contribute to the epic story
- **Measurable impact** - Every epic should deliver quantifiable value

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

### Epic-Integrated Bun Commands

#### Epic Status with Module Analysis

```sh
bun -e "
const { execSync } = require('child_process');
const epicStatus = execSync('./scripts/epic-tools/epic dashboard', { encoding: 'utf8' });
console.log('🎭 CURRENT EPIC STATUS:');
console.log(epicStatus);
"
```

#### AI Context Provider Integration

```sh
# Get comprehensive workspace context for AI
bun ./scripts/ai-context/context-provider.ts --json

# Component-specific AI context
bun ./scripts/ai-context/context-provider.ts --component=components/molecular/header.molecular.tsx

# Git documentation with AI enhancement
./scripts/git-docs/orchestrator.sh --ai-enhanced --opencode-integration
```

#### Git-Sourced Documentation Commands

```sh
# Generate documentation with GitHub attribution
./scripts/git-docs/orchestrator.sh --mode=full --github-links

# Breaking change analysis for AI context
./scripts/git-docs/breaking-change-detector.sh --severity=all --format=json

# Visual testing integration with Git attribution
./scripts/git-docs/visual-test-docs.sh --trigger-visual-tests
```

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

## 🏗️ Project Architecture Overview

This is a Next.js 15.2.4 portfolio application with Turbopack, using TypeScript, SCSS, and advanced component architecture. The project follows snake_case.dots naming convention and implements a "coin of value" color system.

### Epic-Driven Development Structure

```
app/
├── epics/                          # Epic-specific documentation and tracking
│   ├── database-manager-v1/        # Database epic components
│   ├── ai-agent-integration/       # AI workflow epic
│   └── performance-optimization/   # Performance epic
├── components/
│   ├── atomic/                     # Atomic design components
│   ├── molecular/                  # Molecular compositions
│   └── organisms/                  # Complex organisms
└── scripts/
    ├── epic-tools/                 # Epic management CLI
    └── microtooling/              # Development utilities
```

## 🎨 InternetFriends Design System & Colors

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

## 📋 Epic Management Integration

### Chat Modes Integration

This project uses a set of predefined chat modes to guide AI interactions. Each mode is designed to provide context and structure for specific tasks or workflows. When interacting with AI, you can reference these modes to ensure the conversation stays focused and relevant.

Reference existing chat modes in `.github/chatmodes/`:

- [internetfriends-dev.md](.github/chatmodes/internetfriends-dev.md) - Development workflow with Bun and shadcn/ui
- [internetfriends-test.md](.github/chatmodes/internetfriends-test.md) - Testing strategies and automation
- [internetfriends-eval.md](.github/chatmodes/internetfriends-eval.md) - Performance evaluation and metrics
- [internetfriends-infra.md](.github/chatmodes/internetfriends-infra.md) - Infrastructure and deployment
- [business-intelligence.md](.github/chatmodes/business-intelligence.md) - Data analysis and reporting
- [execute.md](.github/chatmodes/execute.md) - Code execution and automation
- [ask.md](.github/chatmodes/ask.md) - General inquiries and documentation
</rewrite_this>

### Epic Context for AI Development

When providing assistance:

1. **Check current epic status**: `./scripts/epic-tools/epic dashboard`
2. **Get AI workspace context**: `bun ./scripts/ai-context/context-provider.ts`
3. **Use Git documentation**: `./scripts/git-docs/orchestrator.sh` for comprehensive context
4. **Consider epic scope**: Align suggestions with current epic goals
5. **Check breaking changes**: `./scripts/git-docs/breaking-change-detector.sh` before major changes
6. **Think in milestones**: Each epic should deliver complete value
7. **Measure impact**: Suggest metrics for epic completion
8. **Visual timeline**: Consider how changes appear in git graph
9. **Source attribution**: Use GitHub links for professional documentation
10. **OpenCode integration**: Reference CLAUDE.md for enhanced AI configuration

## 📁 File Naming Conventions

- Use snake_case.dots naming for files: `header.atomic.tsx`, `header.styles.module.scss`
- Component files should follow: `[component].atomic.tsx` for atomic components
- Style files should follow: `[component].styles.module.scss` for CSS Modules
- Type files should be: `types.ts` or `[component].types.ts`
- Epic files should be: `epic/[epic-name]/[component].epic.tsx`

## 🏛️ Architecture Principles

- **Epic-Driven Development**: Group related features into meaningful epics
- **Atomic Design**: Break components into atomic, molecular, and organism levels
- **Data Attributes**: Use data attributes for state management: `data-theme`, `data-scrolled`, `data-active`
- **CSS Modules**: All styles must be CSS Modules compatible (no :global() selectors)
- **"Coin of Value" Color System**: Color is the primary differentiator between light/dark modes
- **Visual Git Timeline**: Each commit contributes to epic story progression

## 🎨 Styling Guidelines

- Use SCSS with CSS Modules
- Implement theme-aware CSS custom properties: `var(--color-text-primary)`
- Use `map.get()` instead of deprecated `map-get()` for SCSS maps
- Focus states should use 2px dashed borders inspired by Mermaid viewer
- Responsive design with mobile-first approach
- Use backdrop-filter for glass effects

## 🎯 Color System

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

## 📘 TypeScript Standards

- Use strict TypeScript with proper typing
- Interface definitions in dedicated `types.ts` files
- React component props should be explicitly typed
- Use `React.FC` or explicit return types for components
- Epic-aware type definitions for component contexts

## 🧱 Component Structure

```tsx
// Epic-aware atomic component example
import React from "react";
import styles from "./component.styles.module.scss";
import { ComponentProps } from "./types";

interface EpicContext {
  epicName?: string;
  epicPhase?: "development" | "review" | "complete";
}

export const ComponentAtomic: React.FC<ComponentProps & EpicContext> = ({
  children,
  className,
  epicName,
  epicPhase,
  ...props
}) => {
  return (
    <div
      className={`${styles.component} ${className || ""}`}
      data-epic={epicName}
      data-epic-phase={epicPhase}
      {...props}
    >
      {children}
    </div>
  );
};
```

## 🎯 Focus and Interaction States

- Use dashed borders (2px) for focus states like Mermaid viewer
- Active states should use primary color with kbd-style transitions
- Hover states should be subtle with color transitions
- Support both mouse and keyboard navigation

## 🧪 Testing Approach

- Prefer `bun -e` for quick testing over file creation
- Use Bun as the primary runtime for development and testing
- Jest for comprehensive test suites
- API testing with custom test runners
- Epic-specific test suites for complete feature validation

## 📱 Responsive Design

- Mobile-first approach with progressive enhancement
- Use CSS Grid and Flexbox for layouts
- Prevent layout shifts with min-height and proper flex properties
- Ensure single-row layouts don't break into multiple rows on desktop

## 🌐 Browser Compatibility

- Support modern browsers with CSS custom properties
- Use feature detection for advanced CSS features
- Graceful fallbacks for backdrop-filter and other modern CSS

## ⚡ Performance Guidelines

- Use CSS-only solutions where possible
- Minimize JavaScript for animations
- Leverage CSS transitions over JavaScript animations
- Use `will-change` for elements that will be animated
- Track performance metrics per epic completion

## 🛠️ Development Tools

- VS Code with TypeScript, SCSS IntelliSense
- Zed for fast editing and AI integration
- Turbopack for fast builds
- ESLint and Prettier for code formatting
- Bun for package management and runtime
- Epic CLI tools for workflow management

## 📂 File Organization

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
└── epics/
    ├── database-manager-v1/
    ├── ai-integration/
    └── performance-optimization/
```

## ✨ Code Quality

- Keep components focused and single-responsibility
- Use descriptive variable and function names
- Comment complex logic and architectural decisions
- Maintain clean, readable code structure
- Follow DRY principles while avoiding premature abstraction
- Document epic-specific architectural decisions

## 🔄 Git and Version Control

- Use epic-based branching strategy
- Conventional commit messages with epic context
- Feature branch workflow within epics
- Meaningful branch names: `epic/database-manager-v1`, `feat/connection-pool`
- Regular commits that contribute to epic story
- Use epic completion for release planning

## 🎭 Epic Development Philosophy

When generating code, always consider:

1. **Epic Context**: Which epic does this work belong to?
2. **Milestone Thinking**: How does this contribute to epic completion?
3. **Visual Timeline**: How will this appear in the git graph?
4. **Measurable Impact**: What metrics will improve?
5. **Story Progression**: How does this advance the epic narrative?

**Remember**: Every epic tells a story. Every merge tells a chapter. Every release tells the complete book of your project's journey.

## 🚀 AI-Enhanced Development Commands

```sh
# Check epic status before starting work
./scripts/epic-tools/epic dashboard

# Get AI-optimized workspace context
bun ./scripts/ai-context/context-provider.ts --json

# Generate Git documentation with source attribution
./scripts/git-docs/orchestrator.sh --ai-enhanced

# OpenCode task delegation with epic context
./components/scripts/opencode-delegate.ts --epic-context --json

# Breaking change analysis
./scripts/git-docs/breaking-change-detector.sh --ai-format

# Start epic-aware development session
bun -e "
console.log('🎭 EPIC DEVELOPMENT SESSION');
console.log('Current Epic Status:');
require('child_process').execSync('./scripts/epic-tools/epic quick', { stdio: 'inherit' });
console.log('AI Context:');
require('child_process').execSync('bun ./scripts/ai-context/context-provider.ts', { stdio: 'inherit' });
"

# Generate epic progress report
./scripts/epic-tools/epic graph 20
```

When generating code, prioritize maintainability, accessibility, performance, and epic alignment. Always consider the responsive behavior, epic context, and ensure the code follows the established patterns in the project while contributing meaningfully to the current epic's objectives.
