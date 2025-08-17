# 🤖 Enhanced OpenCode Configuration - InternetFriends Workspace

## 🎨 **HEADER DESIGN SYSTEM - UNIFIED OCTOPUS-GLASS MORPHISM**

### **✅ Header Implementation Complete (2025-08-17)**
**Status**: Production-ready with enhanced blue-toned backgrounds and thick borders

**🎯 Key Achievements:**
- **Blue-toned backgrounds**: Replaced generic grays with InternetFriends blue-centric palette
- **Thick borders (2px)**: Octopus.do-inspired substantial borders for better definition  
- **Correct border-radius**: Top corners only in default, all corners when scrolled
- **Responsive spacing**: `1rem → 0.75rem → 0.5rem` for desktop → tablet → mobile
- **Unified system**: HeaderSimple + HeaderOrganism use same design tokens

**🎨 Color Palette Applied:**
```css
/* Light Mode Headers */
--glass-bg-header: rgba(249, 250, 251, 0.92); /* Subtle blue-gray tint */
--glass-bg-header-scrolled: rgba(248, 250, 252, 0.96); /* More blue-white */

/* Dark Mode Headers */  
--glass-bg-header: rgba(15, 23, 42, 0.78); /* Dark blue-slate instead of gray */
--glass-bg-header-scrolled: rgba(15, 23, 42, 0.88); /* More opaque blue-slate */
```

**🔧 Border System:**
```scss
// Default state - Octopus.do thick borders
border: 2px solid var(--glass-border-medium);
border-radius: var(--radius-md) var(--radius-md) 0 0; // Top corners only

// Scrolled state - Enhanced definition  
border: 2px solid var(--glass-border-enhanced);
border-radius: var(--radius-md); // All corners rounded
```

**📱 Responsive Implementation:**
- **Desktop**: `margin: 1rem` (scrolled state)
- **Tablet**: `margin: 0.75rem` (scrolled state) 
- **Mobile**: `margin: 0.5rem` (scrolled state)
- **Default**: `margin: 0.5rem 1rem 0 1rem` (all viewports)

### **🏗️ Octopus.do + InternetFriends Design Principles**
1. **Flat Design with Strategic Depth** - Clean borders with subtle shadows
2. **Blue-Centric Glass Morphism** - Brand-consistent transparency effects  
3. **Thick Border Hierarchy** - 2px borders for substantial definition
4. **1rem Spacing System** - Consistent, predictable layouts
5. **Compact Border Radius** - Max 12px aligned with design system
6. **Light/Dark Mode Harmony** - Blue-toned backgrounds in both themes

### **🎯 UNIFIED 2PX BORDER STANDARD - COMPLETE**
**All core containers now use 2px thick borders for better definition:**

```css
/* Core Container Components */
.glass-card { border: 2px solid var(--glass-border); }
.glass-layer-1 { border: 2px solid var(--glass-border-visible); }
.glass-layer-2 { border: 2px solid var(--glass-border-medium); }
.glass-layer-3 { border: 2px solid var(--glass-border-subtle); }
.surface-glass { border: 2px solid var(--surface-border); }

/* Design System Nodes */
.component-node { border: 2px solid var(--color-border-glass); }
.hook-node { border: 2px solid var(--color-border-glass); }
```

### **🌊 BLUE-TONED BACKGROUND SYSTEM - COMPLETE**
**Unified blue-centric backgrounds for complete visual harmony:**

```css
/* Light Mode - Subtle Blue-White Tones */
--background: 209 40% 98%; /* HSL blue-white */
--app-bg-light: #f0f4f8; /* Subtle blue-gray */

/* Dark Mode - Dark Blue-Slate Tones */  
--background: 215 25% 7%; /* HSL dark blue-slate */
--app-bg-dark: #0f1419; /* Deep blue-slate */
```

### **⚡ INTERACTIVE DASHED BORDER SYSTEM - MERMAID INSPIRED**
**Enhanced feedback for active/gesture states:**

```css
/* Focus States */
.focus-dashed:focus { border: 2px dashed var(--color-border-focus); }

/* Container Interaction States */
.container-interactive { border: 2px solid var(--glass-border-medium); }
.container-interactive:hover { border-color: var(--glass-border-enhanced); }
.container-interactive.active { border: 2px dashed var(--glass-border-enhanced); }

/* Gesture Activation (Touch/Drag) */
.container-gesture-active { border: 2px dashed var(--if-primary) !important; }
```

---

## 🚀 Integration with Git Documentation System

### Git-Sourced Intelligence Commands
```bash
# Generate comprehensive documentation with source attribution
./scripts/git-docs/orchestrator.sh --mode=full --github-links

# Breaking change analysis for AI context
./scripts/git-docs/breaking-change-detector.sh --severity=all --format=json

# Visual testing integration with Git attribution
./scripts/git-docs/visual-test-docs.sh --trigger-visual-tests

# Source attribution for specific files/components
./scripts/git-docs/source-attribution.sh <file-path> --github-blame
```

### Epic-Aware AI Commands
```bash
# Current epic status with performance metrics
./scripts/epic-tools/epic dashboard --performance-metrics

# AI-optimized epic analysis
bun -e "
const epic = require('./scripts/epic-tools/epic');
console.log(JSON.stringify({
  current_epic: epic.getCurrentEpic(),
  completion_percentage: epic.getCompletionPercentage(),
  next_milestones: epic.getNextMilestones()
}, null, 2));
"

# Generate OpenCode tasks from current epic
./components/scripts/opencode-delegate.ts --json --epic-context
```

## 🔧 OpenCode-Optimized Build Commands

### Development Workflow
```bash
# Start with AI monitoring
bun run dev & ./scripts/monitor-opencode.ts --session-tracking

# Build with comprehensive validation
bun run build && bun run lint && bun run typecheck && bun run test

# Visual regression testing with Git integration
bun run test:visual --git-attribution --opencode-report
```

### Git-Integrated Testing
```bash
# Test with breaking change detection
bun test && ./scripts/git-docs/breaking-change-detector.sh --post-test-analysis

# Performance testing with epic tracking
bun run perf:test --epic-context --opencode-metrics
```

## 🎯 AI Context Enhancement Patterns

### Component Analysis with Git Context
```bash
# Analyze component with full Git attribution
bun -e "
import { analyzeComponent } from './scripts/ai-analysis/component-analyzer';
import { getGitAttribution } from './scripts/git-docs/source-attribution';

const component = 'components/molecular/header/header.molecular.tsx';
const analysis = await analyzeComponent(component);
const gitContext = await getGitAttribution(component);

console.log(JSON.stringify({
  component_analysis: analysis,
  git_context: gitContext,
  opencode_suggestions: analysis.suggestions
}, null, 2));
"
```

### Epic-Driven Code Generation Context
```bash
# Generate AI context for current epic
bun -e "
const fs = require('fs');
const epicConfig = JSON.parse(fs.readFileSync('./epic-config.json', 'utf8'));
const currentEpic = epicConfig.current_epic;

console.log(JSON.stringify({
  epic: currentEpic,
  context: 'Component development within ' + currentEpic.name,
  patterns: currentEpic.patterns,
  constraints: currentEpic.constraints,
  completion_criteria: currentEpic.completion_criteria
}, null, 2));
"
```

## 🏗️ Architecture Context for AI

### Current Project State
- **Runtime**: Bun (>=1.2.0) for all operations
- **Framework**: Next.js 15.2.4 with Turbopack
- **Component System**: Atomic design with snake_case.dots naming
- **Styling**: SCSS Modules with CSS custom properties
- **Git Strategy**: Epic-based development with visual timeline
- **Documentation**: Git-sourced with GitHub attribution
- **Testing**: Visual regression + unit tests + E2E with Playwright

### AI-Aware File Patterns
```json
{
  "component_files": "**/*.{atomic,molecular,organism}.tsx",
  "style_files": "**/*.styles.module.scss",
  "type_files": "**/types.ts",
  "epic_files": "epics/**/*.md",
  "git_docs": "docs/git-generated/**/*.md",
  "scripts": "scripts/**/*.{ts,sh}",
  "configs": "{epic-config.json,.zed/settings.json,CLAUDE.md}"
}
```

## 🎨 Design System Context

### Color System (AI Reference)
```scss
// Primary InternetFriends palette
--if-primary: #3b82f6;           // Main brand blue
--if-primary-hover: #2563eb;     // Hover states
--if-primary-light: rgba(59, 130, 246, 0.08); // Backgrounds
--glass-bg-header: rgba(255, 255, 255, 0.85); // Glass morphism
--radius-lg: 0.75rem;            // Max border radius (12px)
```

### Component Patterns (AI Reference)
```tsx
// Epic-aware component template
export const ComponentAtomic: React.FC<Props & EpicContext> = ({
  children,
  epicName,
  epicPhase,
  ...props
}) => {
  return (
    <div
      className={styles.component}
      data-epic={epicName}
      data-epic-phase={epicPhase}
      {...props}
    >
      {children}
    </div>
  );
};
```

## 🚀 OpenCode Session Enhancement

### Session Initialization
```bash
# Initialize OpenCode session with full context
bun -e "
console.log('🤖 OpenCode Session Initialized');
console.log('================================');
console.log('Git Documentation: Available');
console.log('Epic Context: Loaded');
console.log('Visual Testing: Ready');
console.log('Performance Monitoring: Active');
console.log('Source Attribution: GitHub-linked');
"
```

### Context-Aware Commands
```bash
# Get current development context
bun -e "
import { getCurrentContext } from './scripts/ai-context/context-provider';
console.log(JSON.stringify(await getCurrentContext(), null, 2));
"

# Generate OpenCode task delegation
./components/scripts/opencode-delegate.ts --mode=ai-optimized --include-git-context
```

## 🔍 AI Analysis Utilities

### Code Quality Analysis
```bash
# Comprehensive code analysis with AI context
bun -e "
const analysis = {
  epic_alignment: await checkEpicAlignment(),
  pattern_compliance: await checkPatternCompliance(),
  performance_impact: await analyzePerformanceImpact(),
  git_attribution: await getSourceAttribution(),
  opencode_suggestions: await generateSuggestions()
};
console.log(JSON.stringify(analysis, null, 2));
"
```

### Documentation Intelligence
```bash
# AI-enhanced documentation generation
./scripts/git-docs/orchestrator.sh --ai-enhanced --opencode-integration
```

## 🎯 AI Collaboration Patterns

### Epic-Driven Development
1. **Check Epic Context**: `./scripts/epic-tools/epic dashboard`
2. **Generate AI Tasks**: `./components/scripts/opencode-delegate.ts`
3. **Implement with Git Attribution**: Use source attribution for context
4. **Validate with Visual Testing**: Auto-trigger visual regression tests
5. **Document with GitHub Links**: Professional source attribution

### Git-Integrated Analysis
1. **Breaking Change Detection**: Pre-commit analysis
2. **Performance Impact**: Track metrics across Git history
3. **Component Evolution**: Analyze component changes over time
4. **Cross-Epic Learning**: Learn patterns from completed epics

## 📋 Quick Reference Commands

```bash
# Epic status
./scripts/epic-tools/epic dashboard

# Git documentation
./scripts/git-docs/orchestrator.sh

# OpenCode delegation
./components/scripts/opencode-delegate.ts --json

# Visual testing
bun run test:visual --git-context

# Performance analysis
bun run perf:analyze --epic-tracking

# Breaking change detection
./scripts/git-docs/breaking-change-detector.sh

# Source attribution
./scripts/git-docs/source-attribution.sh <file>
```

## 🔄 Continuous Enhancement

This configuration evolves with the workspace. The Git documentation system provides real-time context about code changes, epic progress tracking gives AI understanding of development goals, and visual testing integration ensures quality maintenance.

**Key Principle**: Every AI interaction should be informed by Git context, epic alignment, and performance implications to maintain the professional development standards of the InternetFriends workspace.