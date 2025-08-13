
# Steadiest Addressability + AI Orchestration Guide

Supplement to `DEVELOPMENT_WORKFLOW.md` – defines how OpenCode, Copilot, and coding standards interact to preserve steadiest addressability.

## Core Principles
1. ≤8 public props (target 4–6)
2. Productive defaults > optional prop sprawl
3. Once-on-mount stable config (no post-mount churn loops)
4. Canonical timestamps only (`getIsoTimestamp()`, `generateStamp()`) – never raw Date APIs
5. Param object pattern for multi-arg funcs/hooks
6. Accessibility-first semantics (landmarks, roles, labels)
7. Audit metadata: `data-stamp`, `data-addressability`, `data-origin`
8. Progressive disclosure: no strategy/micro-config props

## OpenCode Workflow
```
opencode     # start session
/models      # list models
/agents      # list agent personas
/share       # share link for collaboration
/editor      # lightweight edit surface
```
Sequence:
1. Start OpenCode in background terminal.
2. Add a short TODO header comment in file (max 5 bullet tasks).
3. Apply migration steps in order: props → defaults → timestamp → boundary → a11y → metadata.
4. Typecheck + run validators (future scripts) before committing.
5. Conventional commit referencing epic.

## Copilot Guardrails
Accept completion only if it:
- Does NOT introduce raw `new Date()`, `Date.now()`, `.toISOString()`
- Maintains or reduces prop surface
- Improves readability or accessibility
- Avoids introducing micro-config (color1, speed2, etc.)

## Timestamp Pattern
```ts
import { getIsoTimestamp, generateStamp } from '@/utils/stamp';
const createdAt = getIsoTimestamp();
const stamp = generateStamp();
<div data-stamp={stamp} data-created-at={createdAt} />
```

## Stable Config Hook Pattern
```ts
interface UseStableThingParams { mode?: 'a'|'b'; theme?: 'light'|'dark'|'auto'; }
function useStableThing(params: UseStableThingParams) {
  const { mode = 'a', theme = 'auto' } = params;
  return React.useMemo(() => ({ id: generateStamp(), createdAt: getIsoTimestamp(), mode, theme }), [mode, theme]);
}
```

## Migration Micro-Template
```tsx
interface ComponentProps { disabled?: boolean; className?: string; variant?: 'primary'|'secondary'; 'data-testid'?: string }
const DEFAULTS = { variant: 'primary' } as const;
export function Component({ disabled, className = '', variant = DEFAULTS.variant, 'data-testid': testId = 'component' }: ComponentProps) {
  if (disabled) return null;
  const stamp = generateStamp();
  return <section data-testid={testId} data-stamp={stamp} className={`component component-${variant} ${className}`}/>;
}
```

## PR Checklist
- [ ] Props ≤8
- [ ] No raw Date usage
- [ ] A11y roles / aria-labels correct
- [ ] Stable initialization only (no repeated randomization)
- [ ] Stamp metadata present if component
- [ ] Docs / README updated or not needed

## Future Automation (Planned Scripts)
| Script | Purpose | Status |
|--------|---------|--------|
| validate:steadiest | Score addressability | Planned |
| scan:timestamps    | Detect raw Date usage | Active via lint baseline |
| scan:props         | Flag >8 prop surfaces | Planned |
| scan:a11y          | Landmark/role validation | Planned |

## Zed → VS Code Migration Notes
- Zed AI replaced with OpenCode + Copilot synergy.
- Use `/share` for multi-party debugging.
- Persist architectural decisions in `docs/` (future fossilization pipeline integration).

---
This guide evolves; propose improvements via `chore(addressability): refine orchestration guide` commits.
