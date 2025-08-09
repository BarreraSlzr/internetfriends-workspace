# 🧬 Atomic Layer (InternetFriends Design System)

Epic: `component-architecture-v1`
Current Feature Focus: `atomic-foundation` (Stack / layout primitives integration)

This directory contains the **lowest-level, reusable UI primitives** used to compose molecular and organism components. Atoms here should be:

- Stateless (or minimally stateful for UX affordances like `loading`)
- Accessible by default
- Theming-aware (respect CSS custom properties + data attributes)
- Composable (no external layout assumptions like margin collapse)
- Deterministic (same props => same DOM/class output)

---

## ✅ Current Implemented Atoms

| Atom                | Purpose                                  | Notes                                                                  |
| ------------------- | ---------------------------------------- | ---------------------------------------------------------------------- |
| `ButtonAtomic`      | Interactive action trigger               | Extends shadcn/ui with InternetFriends focus + radius + variant system |
| `GlassCardAtomic`   | Translucent surface container            | Glass morphism palette + hover/elevation variants                      |
| `HeaderAtomic`      | Hero/top-level page shell section        | Scroll state + glass + sticky behavior                                 |
| `StackAtomic`       | Generic flex layout primitive            | Direction, gap, alignment, responsive overrides, optional dividers     |
| `HStack` / `VStack` | Horizontal/Vertical convenience wrappers | Thin wrappers around `StackAtomic`                                     |

---

## 🗂 File Naming Convention

| Type                 | Pattern                             | Example                               |
| -------------------- | ----------------------------------- | ------------------------------------- |
| Component            | `name.atomic.tsx`                   | `button.atomic.tsx`                   |
| Styles (SCSS Module) | `name.styles.module.scss`           | `button.styles.module.scss`           |
| Barrel               | `index.ts`                          | Re-export of public symbols           |
| Types                | `types.ts` or co-located if trivial | `button.atomic.tsx` imports `./types` |
| Tests                | `__tests__/name.atomic.test.tsx`    | `__tests__/stack.atomic.test.tsx`     |
| Docs                 | `README.md`                         | This file                             |

All atoms follow: `kebab-or-snake` directory → `(atom-name).atomic.tsx`.

---

## 🎨 Design & Theming Principles

1. **Token Driven**: Use CSS custom properties (e.g. `--if-primary`, `--color-text-primary`).
2. **Compact Radii**: Respect the compact radius scale (`--radius-xs ... --radius-lg`).
3. **Focus Style**: Dashed 2px outlines referencing `--color-border-focus` / brand blue.
4. **Zero Global Leakage**: Only CSS Modules or utility classes (Tailwind).
5. **Data Attributes**: Expose state for styling and future instrumentation:
   - `data-variant`, `data-size`, `data-loading`, `data-disabled`
   - Layout: `data-direction`, `data-gap`, `data-align`, `data-justify`
6. **Accessibility**: Proper roles, ARIA attributes where applicable (consumer extends).

---

## 🔧 StackAtomic (New Layout Primitive)

Introduced to eliminate ad‑hoc `flex` + `gap` duplication and bring **responsive + divider** semantics into a single tested primitive.

### Key Props

| Prop         | Values                                                  | Description                           |
| ------------ | ------------------------------------------------------- | ------------------------------------- |
| `direction`  | `row` / `column`                                        | Primary axis                          |
| `gap`        | `0`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl`                | Semantic spacing scale (0.25rem base) |
| `align`      | `start`, `center`, `end`, `stretch`, `baseline`         | Cross-axis alignment                  |
| `justify`    | `start`, `center`, `end`, `between`, `around`, `evenly` | Distribution                          |
| `wrap`       | boolean                                                 | Toggle wrapping                       |
| `inline`     | boolean                                                 | Switch to `inline-flex`               |
| `fullWidth`  | boolean                                                 | Adds `w-full`                         |
| `divider`    | `true` / `ReactNode`                                    | Interleaves divider elements          |
| `responsive` | `{ md: { direction, gap, ... }, ... }`                  | Breakpoint overrides                  |
| `as`         | Intrinsic element                                       | Semantic override (e.g. `section`)    |

### Usage Examples

#### Basic Column Stack

```/dev/null/example-basic-stack.tsx#L1-18
<StackAtomic gap="md">
  <ButtonAtomic>Primary</ButtonAtomic>
  <ButtonAtomic variant="secondary">Secondary</ButtonAtomic>
</StackAtomic>
```

#### Horizontal Distribution

```/dev/null/example-row.tsx#L1-16
<HStack gap="sm" justify="between" align="center" fullWidth>
  <Logo />
  <NavigationActions />
</HStack>
```

#### Responsive Reflow With Divider

```/dev/null/example-responsive.tsx#L1-18
<StackAtomic
  direction="row"
  gap="sm"
  divider
  responsive={{
    md: { direction: "column", gap: "md" },
    lg: { direction: "row", gap: "lg" }
  }}
>
  <MetricCard />
  <MetricCard />
  <MetricCard />
</StackAtomic>
```

#### Custom Divider Element

```/dev/null/example-custom-divider.tsx#L1-22
<StackAtomic
  direction="row"
  gap="lg"
  divider={<span className="text-xs text-muted-foreground px-1">•</span>}
>
  <span>Alpha</span>
  <span>Beta</span>
  <span>Gamma</span>
</StackAtomic>
```

---

## 🧪 Testing Guidelines

Each atom should have:

1. **Render + Attribute Assertions**
2. **Variant / Size Path Coverage**
3. **Accessibility Snapshot** (optional)
4. **Determinism / Idempotence** (same props => same class list)

Example (see `__tests__/stack.atomic.test.tsx`):

- Verifies direction, gap classes, divider count, responsive class emission.

Prefer:

- `@testing-library/react`
- Minimal reliance on implementation details (avoid deep class snapshots unless necessary)

---

## 🏗 Adding a New Atom (Checklist)

1. Create directory: `components/atomic/<atom-name>/`
2. Implement component: `<atom-name>.atomic.tsx`
3. (Optional) Add SCSS module if utility classes insufficient
4. Export via `index.ts`
5. Add tests in `components/atomic/__tests__/`
6. Document variations in this README (append section)
7. Commit with conventional + epic context:
   - `feat(atomic-foundation): add <AtomName>Atomic`
8. Avoid premature generalization—add only when 2+ consumers emerge.

---

## 🧩 When NOT to Create an Atom

Skip atomization if:

- It’s purely one-off layout in a single organism.
- Styling is trivial and unlikely to repeat.
- It introduces a conceptual burden with no reuse.

Refactor into an atom once duplication or variant pressure appears.

---

## 🔄 Migration Strategy (Existing Components)

| Target                 | Improvement Path                                                               |
| ---------------------- | ------------------------------------------------------------------------------ |
| `NavigationMolecular`  | Adopt `HStack` / `VStack` (DONE)                                               |
| `DashboardOrganism`    | Replace ad-hoc flex groups with StackAtomic clusters                           |
| Mixed spacing sections | Transition from raw `gap-x` utilities to semantic `gap` tokens via StackAtomic |
| Future grid patterns   | Introduce `GridAtomic` only if repeated 2+ grids with same semantics           |

---

## 📐 Layout Philosophy

Atomic layout primitives should:

- Abstract _repetition_, not _flexibility_.
- Produce self-describing DOM via `data-*` attributes.
- Enable future telemetry (e.g. measuring layout complexity).

---

## 🚦 Commit Message Examples

| Action         | Message                                                                     |
| -------------- | --------------------------------------------------------------------------- |
| Add new atom   | `feat(atomic-foundation): add StackAtomic primitive`                        |
| Refactor usage | `refactor(atomic-foundation): integrate StackAtomic in NavigationMolecular` |
| Add tests      | `test(atomic-foundation): add StackAtomic coverage (dividers, responsive)`  |
| Docs update    | `docs(atomic-foundation): expand atomic layer README`                       |

---

## 🧭 Decision Log (Lightweight)

| Decision                                                         | Rationale                                                        | Status                        |
| ---------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------- |
| Introduce `StackAtomic` before `GridAtomic`                      | Flex-based composition covers 80% immediate needs                | Accepted                      |
| Omit default export in barrels                                   | Encourage explicit named imports / tree-shaking clarity          | Enforced                      |
| Allow `divider` inside Stack instead of separate `DividerAtomic` | Reduces cognitive overhead & wrapper churn                       | Revisit if shared styles grow |
| Use semantic gap tokens                                          | Centralized control of spacing scale & density theming potential | Active                        |

---

## 🐛 Known Opportunities

| Item                                  | Notes                                                                                |
| ------------------------------------- | ------------------------------------------------------------------------------------ |
| HeaderAtomic scroll logic duplication | Could unify with a generic `useScrollPosition` hook                                  |
| ButtonAtomic variant tokens           | Consider moving color logic to SCSS module for theming extensibility                 |
| GlassCardAtomic animation variant     | Move `animate-glass-float` into a design token switch / prefers-reduced-motion guard |
| Divider extraction                    | Evaluate after 3+ distinct divider styles appear                                     |

---

## 📌 Roadmap (Within Epic)

1. (Done) Establish StackAtomic
2. Integrate into ≥2 existing components
3. Standardize test harness template
4. Introduce `TextAtomic` (heading scale + semantic fallback) IF needed
5. Audit existing atoms for cohesive token usage
6. Document consumable patterns for molecular authors

---

## 🧪 Quick Sanity Example

```/dev/null/example-sanity.tsx#L1-26
export function ExampleCluster() {
  return (
    <VStack gap="lg" data-testid="cluster">
      <HStack gap="sm" justify="between" align="center">
        <span className="font-semibold">Section Title</span>
        <HStack gap="xs">
          <ButtonAtomic size="sm" variant="ghost">
            Cancel
          </ButtonAtomic>
          <ButtonAtomic size="sm">Save</ButtonAtomic>
        </HStack>
      </HStack>
      <StackAtomic
        direction="row"
        gap="md"
        wrap
        responsive={{ md: { direction: "column", gap: "lg" } }}
        divider
      >
        <GlassCardAtomic size="md">Card A</GlassCardAtomic>
        <GlassCardAtomic size="md">Card B</GlassCardAtomic>
        <GlassCardAtomic size="md">Card C</GlassCardAtomic>
      </StackAtomic>
    </VStack>
  );
}
```

---

## 🛡 Accessibility Notes

- Atoms should not strip native semantics (e.g., keep `<button>` for `ButtonAtomic`).
- Provide `aria-*` passthrough props where appropriate.
- Use focus-visible patterns; never remove outline without a strong accessible alternative.
- Dividers inside `StackAtomic` are `aria-hidden` to avoid noise in screen readers.

---

## 🧪 Testing Pattern Template

```/dev/null/atom-test-template.tsx#L1-34
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ButtonAtomic } from "@/components/atomic/button";

describe("ButtonAtomic", () => {
  it("renders with default variant", () => {
    render(<ButtonAtomic data-testid="btn">Click</ButtonAtomic>);
    const btn = screen.getByTestId("btn");
    expect(btn).toHaveAttribute("data-variant", "primary");
  });

  it("shows loading state", () => {
    render(
      <ButtonAtomic data-testid="btn" loading>
        Load
      </ButtonAtomic>,
    );
    expect(screen.getByTestId("btn-loading")).toBeInTheDocument();
    expect(screen.getByTestId("btn")).toHaveAttribute("data-loading", "true");
  });
});
```

---

## ♻ Refactor Guidance

When refactoring existing components:

1. Replace adjacent `flex gap-X items-center` chains with `HStack/VStack`.
2. Only introduce `StackAtomic` if:
   - 2+ sibling flex groups exist
   - Responsive direction changes are present
   - Divider semantics are needed
3. Keep commit surfaces small & revert-friendly.

---

## 📣 Contributing Rules (Atomic Layer)

- Avoid business logic.
- No direct API calls.
- No implicit margins (let parent decide spacing).
- Prefer composability over inheritance.
- Each new atom must include at least one test & README mention.

---

If you need a new atom, open a feature proposal under the current epic with:

- Name
- Purpose
- Reuse evidence
- Minimal prop sketch

Let’s keep the layer lean, intentional, and powerfully composable. 🎯

---

## ✍️ Typography System (TextAtomic)

The typography foundation introduces `TextAtomic` as the single primitive for all textual hierarchy and tone. This consolidates scattered `<h*>`, `<p>`, `<span>` + utility class combinations into a semantic + themed + testable layer.

### Hierarchy Variants

(display, h1–h6, subtitle, lead, body, body-sm, label, label-sm, micro, code)

Examples:

```/dev/null/text-examples.tsx#L1-26
<TextAtomic variant="h2" tone="contrast">Section Title</TextAtomic>
<TextAtomic variant="body-sm" tone="muted">
  Supporting description that is less emphasized.
</TextAtomic>
<TextAtomic variant="micro" uppercase subtle>
  META LABEL
</TextAtomic>
<TextAtomic variant="code">npm run build</TextAtomic>
```

### Tone Scale

- default: Base readable foreground
- subtle: Lowered emphasis (≈70% opacity)
- muted: Further de‑emphasized (≈55% opacity)
- inverted: For text over brand / dark blocks
- positive / warning / danger: Semantic status color hooks
- contrast: Maximum emphasis (pure/near-pure fg)

Opacity is preferred over hard-coded alternate hex values so dark/light theming can shift underlying roots without refactoring individual usages.

### Emphasis & Weight Heuristics

If `emphasis` is provided without an explicit `weight`, the component gently elevates weight (e.g. body -> medium, headings remain semibold unless emphasis pushes to bold). Override with `weight="bold"` when necessary.

### Truncation & Clamping

- `truncate` enforces single-line ellipsis.
- `clamp={n}` applies multi-line truncation (adds `line-clamp-n` plus inline style fallback if the utility is unavailable).

### Inline vs Block

Most hierarchy variants default to block (`p`, `h*`). Add `inline` to participate within flowing text without introducing a new block context.

### Data Attributes (for styling / telemetry)

- `data-variant`
- `data-tone`
- `data-weight` (only when explicitly set)
- `data-emphasis`
- `data-inline`

These enable future automated audits (e.g., verifying heading order or measuring contrast coverage).

### Migration Guidance

| Legacy Pattern                                   | Replace With                                  |
| ------------------------------------------------ | --------------------------------------------- |
| `<h2 class="text-3xl font-semibold">`            | `<TextAtomic variant="h2">`                   |
| `<p class="text-sm text-gray-500">`              | `<TextAtomic variant="body-sm" tone="muted">` |
| `<span class="uppercase tracking-wide text-xs">` | `<TextAtomic variant="micro" uppercase>`      |
| Inline code snippet                              | `<TextAtomic variant="code">`                 |

### When NOT to Use TextAtomic

- Inside third-party chart libraries that already control text rendering.
- Extremely temporary debug scaffolding (convert before commit if kept).

### Testing Pattern

Assert semantic tag + attributes (avoid hard-coding the entire utility class string):

```/dev/null/text-atomic.test-snippet.tsx#L1-18
render(<TextAtomic variant="h4" tone="contrast" data-testid="t" />);
const el = screen.getByTestId("t");
expect(el.tagName.toLowerCase()).toBe("h4");
expect(el).toHaveAttribute("data-tone", "contrast");
```

### Common Compositions

```/dev/null/typography-cluster.tsx#L1-34
<VStack gap="sm">
  <TextAtomic variant="h3" tone="contrast" emphasis>
    Performance Overview
  </TextAtomic>
  <TextAtomic variant="body" tone="muted" clamp={2}>
    A quick summary of current system health, adoption metrics, and anomaly highlights.
  </TextAtomic>
  <HStack gap="xs">
    <TextAtomic variant="micro" tone="subtle" uppercase>
      Updated
    </TextAtomic>
    <TextAtomic variant="micro" tone="contrast">
      2 min ago
    </TextAtomic>
  </HStack>
</VStack>
```

### Roadmap Hooks

- Potential density prop (e.g., `density="compact"` adjusting line-height + gap synergy).
- Auto-level enforcement (detect heading sequence misuse).
- Contrast ratio reporter per tone bucket.

---

Maintainer: Component Architecture Working Thread
Questions? Reference the epic dashboard: `./scripts/epic-tools/epic dashboard`
