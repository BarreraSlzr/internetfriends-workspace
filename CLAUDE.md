# 🤖 Enhanced OpenCode Configuration - InternetFriends Workspace

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