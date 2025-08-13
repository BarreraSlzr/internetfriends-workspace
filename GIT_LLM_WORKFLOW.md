# 🎭 LLM-Friendly Git Management Strategy - InternetFriends

## Overview

This document establishes a git workflow optimized for LLM collaboration, epic-driven development, and clear visual progression tracking.

## Core Principles

### 1. Epic-Driven Development
- Each epic represents a complete milestone with measurable impact
- Epics are developed on dedicated branches: `epic/[epic-name]-v1`
- Epic completion creates visual merge points in git timeline
- All commits within an epic contribute to the epic narrative

### 2. LLM-Friendly Git History
- Clear, conventional commit messages with epic context
- Logical commit grouping for easy parsing
- Visual merge patterns that LLMs can easily interpret
- Consistent branching strategy for predictable navigation

### 3. Visual Git Timeline
```
main ──────●──────────●──────────●──────────●
           │          │          │          │
           ├─epic/v1──●          │          │
           │                     │          │
           ├─epic/v2─────────────●          │
           │                                │
           └─epic/v3──────────────────────────●
```

## Git Commands for LLM Context

### Quick Status Commands
```bash
# Current branch and status
git status --short --branch

# Recent commits with epic context
git log --oneline --graph -10

# Epic timeline view
git log --graph --oneline --all -20

# Show epic completion points
git log --oneline --grep="epic:" --all
```

### Epic Branch Management
```bash
# Start new epic
./scripts/epic-tools/epic start <epic-name> --timeline="2-3 weeks"

# Check epic progress
./scripts/epic-tools/epic dashboard

# Current epic status
./scripts/epic-tools/epic status $(git branch --show-current | sed 's/epic\///' | sed 's/-v[0-9]*$//')
```

### LLM Status Queries
```bash
# One-liner epic status for LLM context
git log --oneline -1 && echo "Epic: $(git branch --show-current)" && ./scripts/epic-tools/epic quick

# Full context dump for LLM
echo "=== GIT CONTEXT ===" && \
git status --short --branch && \
echo && echo "=== RECENT COMMITS ===" && \
git log --oneline -5 && \
echo && echo "=== EPIC STATUS ===" && \
./scripts/epic-tools/epic dashboard | head -20
```

## Commit Strategy

### Commit Message Format
```
<type>(scope): <description>

[optional epic context]
[optional body]
```

### Epic-Aware Commit Types
- `feat(epic)`: New epic feature implementation
- `fix(epic)`: Bug fixes within epic scope
- `refactor(epic)`: Code refactoring for epic goals
- `test(epic)`: Tests related to epic functionality
- `docs(epic)`: Epic documentation updates
- `chore(epic)`: Epic maintenance tasks

### Examples
```bash
git commit -m "feat(glass): implement header orbital motion system

- Add use-header-orbit hook for smooth scrolling effects
- Integrate glass morphism with scroll elevation
- Performance optimized with RAF and intersection observer

Epic: glass-refinement-v1 (40% → 60%)"

git commit -m "fix(syntax): complete truncated gloo integration files

- Fix hero-text-simple.tsx shader compilation
- Complete gloo-integration.tsx render mode selection
- Add proper E2E test structure for color validation

Epic: glass-refinement-v1 (technical debt cleanup)"
```

## Branch Integration Strategy

### Epic Completion Workflow
1. **Pre-merge Epic Health Check**
```bash
# Validate epic completion criteria
./scripts/epic-tools/epic validate glass-refinement-v1

# Run comprehensive tests
bun run test:epic

# Type check
bunx tsc --noEmit

# Build verification
bun run build
```

2. **Epic Integration to Main**
```bash
# Ensure main is up to date
git checkout main
git pull private main

# Create integration commit
git checkout epic/glass-refinement-v1
git rebase main

# Final epic completion
./scripts/epic-tools/epic complete glass-refinement-v1 \
  --version="v2.1.0" \
  --impact-performance="+25%" \
  --impact-maintainability="+40%"

# Merge to main with epic context
git checkout main
git merge epic/glass-refinement-v1 --no-ff -m "epic: Complete glass-refinement-v1 🎯

Visual System Refinement Epic
- HeaderOrganism with orbital scroll effects
- Glass morphism system enhancement
- E2E test baseline for WebGL validation
- API scaffolding for Phase 2 preparation

Impact: Performance +25%, Maintainability +40%, Visual Consistency +90%
Timeline: 3 weeks → Completed $(date +%Y-%m-%d)
Next: Phase 2 hybrid cloud services preparation"
```

3. **Post-Integration Cleanup**
```bash
# Tag the epic completion
git tag -a "v2.1.0-glass-refinement-v1" -m "Epic: Glass Refinement v1 Complete"

# Push to remote with tags
git push private main --follow-tags

# Update epic registry
./scripts/epic-tools/epic archive glass-refinement-v1
```

## LLM Query Patterns

### For Development Context
```bash
# What epic am I working on?
echo "Current Epic: $(git branch --show-current)"

# What's the epic progress?
./scripts/epic-tools/epic quick

# What changed recently?
git log --oneline --since="1 day ago"

# What's pending in this epic?
git status --short
```

### For Epic Planning
```bash
# What epics are complete?
./scripts/epic-tools/epic list --status=complete

# What's next in the pipeline?
./scripts/epic-tools/epic list --status=planned

# Epic dependency graph
./scripts/epic-tools/epic graph
```

### For Code Review Context
```bash
# Show epic context for PR
git log --oneline main..HEAD

# Epic-specific changes
git diff main..HEAD --name-status

# Impact summary
./scripts/epic-tools/epic impact $(git branch --show-current)
```

## Visual Timeline Management

### Reading the Git Graph
- **Straight line commits**: Sequential epic development
- **Merge commits**: Epic completion points
- **Branch divergence**: Parallel epic development
- **Tags**: Epic milestones and releases

### LLM Git Graph Interpretation
```bash
# Generate LLM-friendly timeline
git log --graph --pretty=format:"%h %s (%an, %ar)" --abbrev-commit -15

# Epic milestone markers
git tag -l "*-epic-*" | sort -V

# Visual epic progression
./scripts/epic-tools/epic timeline
```

## Automation Scripts

### Daily Development Commands
```bash
# Morning context setup
alias git-context="echo '=== CURRENT CONTEXT ===' && git status --short --branch && echo && git log --oneline -3 && echo && ./scripts/epic-tools/epic quick"

# Pre-commit epic validation
alias pre-commit="bunx tsc --noEmit && bun run lint && git status --short"

# Epic progress update
alias epic-update="./scripts/epic-tools/epic feature done $(git branch --show-current) 'Progress update: $(git log --oneline -1)'"
```

### LLM Integration Helpers
```bash
# Generate context for LLM handoff
function llm-context() {
  echo "=== DEVELOPMENT CONTEXT FOR LLM ==="
  echo "Current Branch: $(git branch --show-current)"
  echo "Last Commit: $(git log --oneline -1)"
  echo "Epic Status:"
  ./scripts/epic-tools/epic quick
  echo -e "\nRecent Changes:"
  git status --short
  echo -e "\nNext Actions:"
  echo "- Continue epic development"
  echo "- Run \`git-context\` for updates"
  echo "- Use \`./scripts/epic-tools/epic dashboard\` for progress"
}

# Quick epic health check
function epic-health() {
  echo "=== EPIC HEALTH CHECK ==="
  bunx tsc --noEmit --skipLibCheck > /dev/null 2>&1 && echo "✅ TypeScript" || echo "❌ TypeScript errors"
  git status --porcelain | wc -l | xargs -I {} echo "{} uncommitted changes"
  ./scripts/epic-tools/epic progress $(git branch --show-current)
}
```

## Integration with Epic Tools

### Epic State Tracking
- Epic progress automatically updates on commits
- Feature completion tracked through commit analysis  
- Impact metrics calculated during epic completion
- Visual timeline maintained through merge strategy

### LLM Epic Queries
```bash
# Epic dashboard for LLM context
./scripts/epic-tools/epic dashboard --format=json | jq '.current_epic'

# Simplified status for quick LLM updates
./scripts/epic-tools/epic status --brief

# Epic-specific git log
git log --oneline --grep="$(git branch --show-current | cut -d'/' -f2)"
```

## Best Practices for LLM Collaboration

### 1. Always Provide Context
- Include epic name in commit messages
- Reference epic progress in PR descriptions
- Maintain clear git timeline for easy parsing

### 2. Conventional Structure
- Use consistent branch naming
- Follow standard commit message format
- Maintain logical commit grouping

### 3. Epic Narrative
- Each commit should advance the epic story
- Group related changes in logical commits
- Document impact and progress at epic level

### 4. Visual Clarity
- Use merge commits for epic completion
- Tag important milestones
- Maintain clean, readable git graph

## Troubleshooting

### Common LLM Query Issues
```bash
# Fix detached HEAD during LLM development
git checkout -b epic/llm-fixes-$(date +%s)

# Restore epic context after rebasing
./scripts/epic-tools/epic sync

# Generate clean diff for LLM analysis
git diff --name-status main..HEAD > epic-changes.txt
```

### Epic Recovery
```bash
# Recover interrupted epic work
git reflog | grep "epic/" | head -5

# Restore epic state from backup
./scripts/epic-tools/epic restore <epic-name>

# Sync epic tracking after git operations
./scripts/epic-tools/epic sync $(git branch --show-current)
```

---

**Next Steps**: Implement this workflow for current `glass-refinement-v1` epic completion and integration to main.