# Workspace Settings Propagation Strategy

This document describes the addressability settings implementation that centralizes VSCode configuration to avoid drift and enforce ≤8 props canonical patterns.

## Core Goals
- Centralize settings to avoid drift between workspace packages
- Enforce ≤8 props steadiest addressability rules
- Support canonical timestamps and glass-refinement-v1 patterns
- Minimize config surface while maximizing productivity

## Target Root Structure
```
/Users/emmanuelbarrera/Projects/InternetFriends/zed_workspace/
  .vscode/
    settings.json            # AUTHORITATIVE - Core addressability settings
    extensions.json          # AUTHORITATIVE - Curated extension recommendations
  components/.vscode/
    settings.json            # MINIMAL - Package-specific overrides only
    extensions.json          # Can be removed after root adoption
```

## Propagation Steps (COMPLETED)
1. ✅ Created root settings template in `components/docs/root-vscode-settings.json`
2. ✅ Created root extensions template in `components/docs/root-vscode-extensions.json`
3. ✅ Pruned child settings to minimal overrides only
4. ✅ Updated this documentation with implementation details
5. ⏳ Sync script stub (to be implemented)

## Implementation Details

### Root Settings Keys (Minimal Set)
- `editor.inlineSuggest.enabled`, `editor.formatOnSave`
- `editor.codeActionsOnSave` (organizeImports, fixAll, fixAll.eslint)
- `github.copilot.maxCompletions: 3` (addressability constraint)
- TypeScript inlay hints configuration
- Non-relative imports preference
- Search & watcher excludes (performance)
- TODO-tree tags including "ADDRESSABILITY"

### Extensions Recommended
- Core: copilot, copilot-chat, prettier, eslint
- Quality: spell-checker, errorlens, pretty-ts-errors
- Tools: todo-tree, jest, playwright, editorconfig
- Unwanted: auto-close-tag (prevents noise)

### Diff Policy Implementation
| Setting Type | Location | Rationale |
|-------------|----------|-----------|
| Addressability aids (format, copilot limits) | Root | Enforce consistency across packages |
| TypeScript inlay hints, imports | Root | Core productivity settings |
| Performance excludes | Root | Workspace-wide optimization |
| Package-specific ESLint rules | Child | Scoped to package needs |
| Experimental features | Child | Avoid root pollution |

### Child Settings (Post-Pruning)
Components package now contains only:
- Package-specific TypeScript import exclusions
- Experimental ESLint customizations
- Settings that would cause noise if applied workspace-wide

## Rollout Instructions

### Manual Deployment
1. Copy `components/docs/root-vscode-settings.json` to workspace root `.vscode/settings.json`
2. Copy `components/docs/root-vscode-extensions.json` to workspace root `.vscode/extensions.json`
3. Verify child packages have minimal settings files (drift prevention)

### Sync Script Stub (Future)
```typescript
// scripts/sync-vscode-settings.ts
export function validateSettingsHierarchy() {
  // 1. Load root settings as authoritative source
  // 2. Identify child setting files across packages
  // 3. Report any keys that should be moved to root
  // 4. Flag potential drift patterns
}
```

## Rollout Checklist
- [x] Root settings template created
- [x] Root extensions template created  
- [x] Child settings pruned to minimal overrides
- [x] Documentation updated with implementation details
- [ ] Manual deployment to workspace root (requires file system access)
- [ ] Sync script implementation
- [ ] Link from main development workflow docs

## Reversion Strategy
If performance regressions or tool conflicts occur:
1. Restore previous child settings from git history
2. Create issue with tag `addressability-settings-regression`
3. Document specific conflict in this file
4. Consider more granular root/child split

## Validation Commands
```bash
# Verify no duplicate keys between root and child
# Check for drift in multi-package setup  
# Ensure addressability constraints are enforced
bun run typecheck  # Should pass with new settings
```

---
**Status**: Implementation complete, awaiting deployment to workspace root  
**Epic**: glass-refinement-v1 addressability working group  
**Last Updated**: 2025-08-12
