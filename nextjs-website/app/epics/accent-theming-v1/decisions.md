# 🏛️ Architectural Decision Records - Accent Theming v1

## ADR-001: HSL Color Space for Dynamic Accent Generation

**Status:** Accepted
**Date:** 2025-01-17
**Context:** Need to generate consistent color scales from user-selected accent hues.

### Decision
Use HSL (Hue, Saturation, Lightness) color space for runtime accent generation instead of RGB or OKLCH.

### Rationale
- **Intuitive hue manipulation**: Single hue value controls color family
- **Predictable lightness scales**: Easy to generate 50-900 weight variants
- **Browser compatibility**: Excellent support across all target browsers
- **CSS custom property friendly**: `hsl(var(--accent-hue) var(--accent-sat) var(--accent-light))`

### Alternatives Considered
- **RGB**: Complex to manipulate systematically
- **OKLCH**: Better perceptual uniformity but limited browser support
- **HSV**: Similar to HSL but less CSS-native

### Consequences
- Slightly less perceptually uniform than OKLCH
- Requires saturation/lightness adjustment formulas
- Good enough for MVP, can migrate to OKLCH later

---

## ADR-002: CSS Custom Properties Over Sass Variables

**Status:** Accepted
**Date:** 2025-01-17
**Context:** Choose between CSS custom properties and Sass variables for theming.

### Decision
Use CSS custom properties (CSS variables) as the primary theming mechanism.

### Rationale
- **Runtime modification**: Can change values dynamically with JavaScript
- **Cascade inheritance**: Natural CSS scoping and inheritance
- **Theme switching**: Easy light/dark mode implementation
- **SSR compatibility**: Works with server-side rendering

### Implementation
```css
:root {
  --accent-500: 217 89% 60%;
  --text-primary: 220 15% 12%;
}

[data-theme="dark"] {
  --text-primary: 0 0% 100%;
}
```

### Alternatives Considered
- **Sass variables**: Compile-time only, no runtime flexibility
- **CSS-in-JS**: Runtime overhead, SSR complexity

### Consequences
- Requires modern browser support (IE11+ limitation acceptable)
- Slightly more verbose syntax
- Enables future advanced theming features

---

## ADR-003: Tailwind Utility Integration Strategy

**Status:** Accepted
**Date:** 2025-01-17
**Context:** How to integrate CSS variables with existing Tailwind utility classes.

### Decision
Extend Tailwind's color palette to reference CSS custom properties while maintaining utility class syntax.

### Implementation
```typescript
// tailwind.config.ts
colors: {
  accent: {
    50: 'hsl(var(--accent-50))',
    500: 'hsl(var(--accent-500))',
    900: 'hsl(var(--accent-900))',
  },
  text: {
    primary: 'hsl(var(--text-primary))',
  }
}
```

### Rationale
- **Zero learning curve**: Existing `bg-accent-500` syntax continues working
- **Gradual migration**: Can replace utilities progressively
- **Tooling compatibility**: IDE autocomplete, PurgeCSS work normally
- **Design system alignment**: Clear semantic naming

### Alternatives Considered
- **Arbitrary values**: `bg-[hsl(var(--accent-500))]` too verbose
- **Custom utilities**: Additional build complexity
- **Pure CSS**: Lose Tailwind's utility benefits

### Consequences
- Tailwind config grows larger
- Need to maintain color scale consistency
- Better long-term maintainability

---

## ADR-004: Logo Click for Accent Cycling

**Status:** Accepted
**Date:** 2025-01-17
**Context:** How users discover and interact with accent customization.

### Decision
Implement accent cycling via logo click interaction as the primary discovery mechanism.

### Rationale
- **Hidden in plain sight**: Logo is always visible, no additional UI needed
- **Progressive disclosure**: Advanced users discover it naturally
- **Non-intrusive**: Doesn't clutter the interface
- **Brand reinforcement**: Logo interaction strengthens brand memory

### Implementation
- Click cycles through 6-8 curated accent colors
- Visual feedback via subtle animation
- Persistence via localStorage
- Future: Hold-click opens color picker

### Alternatives Considered
- **Settings panel**: Adds UI complexity, low discoverability
- **URL parameters**: Good for sharing, poor for discovery
- **Keyboard shortcuts**: Hidden from most users
- **Header toggle**: Competes with navigation elements

### Consequences
- Logo click behavior must be clearly communicated (eventually)
- Need to handle accidental clicks gracefully
- Requires accessibility considerations for keyboard users

---

## ADR-005: Dark Mode Data Attribute Strategy

**Status:** Accepted
**Date:** 2025-01-17
**Context:** How to implement theme switching and scope dark mode styles.

### Decision
Use `data-theme="dark"` attribute on `<html>` element for theme scoping.

### Implementation
```css
[data-theme="dark"] {
  --surface-primary: 220 18% 10%;
  --text-primary: 0 0% 100%;
}
```

### Rationale
- **CSS cascade friendly**: Natural specificity for overrides
- **JavaScript controllable**: Easy to toggle via setAttribute
- **SSR compatible**: Can be set during server rendering
- **Explicit naming**: Clear intent, not just class names

### Alternatives Considered
- **Class-based**: `.dark` class (Tailwind's default) less semantic
- **Media query only**: `prefers-color-scheme` doesn't allow manual override
- **CSS custom property toggle**: More complex, less clear intent

### Consequences
- Need to coordinate with Tailwind's dark mode configuration
- Requires careful cascade order management
- More explicit than class-based approach

---

## ADR-006: Semantic Token Abstraction Layer

**Status:** Accepted
**Date:** 2025-01-17
**Context:** How to structure tokens for component consumption vs. accent system.

### Decision
Create semantic token layer that maps to accent system, not direct accent consumption.

### Token Hierarchy
```css
/* Accent System (Dynamic) */
--accent-500: 217 89% 60%;

/* Semantic Layer (Stable API) */
--color-primary: var(--accent-500);
--surface-elevated: var(--accent-50);
--border-strong: var(--neutral-600);
```

### Rationale
- **Component isolation**: Components use semantic names, not accent numbers
- **Design flexibility**: Can remap semantic meanings without component changes
- **Accessibility control**: Semantic layer enforces contrast requirements
- **Future-proofing**: Easier to add new accent modes (high-contrast, etc.)

### Alternatives Considered
- **Direct accent consumption**: `bg-accent-300` in components
- **Single layer**: Combines semantic and accent concerns
- **Multiple inheritance**: More complex token relationships

### Consequences
- Additional token layer to maintain
- More CSS custom properties
- Better long-term component API

---

## ADR-007: Glass Morphism Preparation Strategy

**Status:** Accepted
**Date:** 2025-01-17
**Context:** How to prepare for future glass morphism effects without premature implementation.

### Decision
Define glass tokens and basic structure but implement behind feature flags.

### Implementation
```css
:root {
  --glass-surface: var(--surface-primary) / 0.65;
  --glass-border: var(--accent-400) / 0.15;
  --glass-blur: 12px;
}

/* Usage (future) */
.header[data-glass="true"] {
  background: hsl(var(--glass-surface));
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid hsl(var(--glass-border));
}
```

### Rationale
- **Token readiness**: Glass effects need accent-aware transparency
- **Performance consideration**: Backdrop-filter is expensive, needs selective use
- **Design evolution**: May not be appropriate for all surfaces
- **Progressive enhancement**: Can be enabled per-component

### Alternatives Considered
- **Immediate implementation**: Risk of overuse and performance issues
- **No preparation**: Harder to retrofit consistently
- **Separate system**: Disconnected from accent theming

### Consequences
- Additional tokens that may not be used immediately
- Need to resist over-applying glass effects
- Good foundation for future design evolution

---

## ADR-008: Contrast Compliance Automation

**Status:** Accepted
**Date:** 2025-01-17
**Context:** How to ensure accessibility compliance across dynamic accent variations.

### Decision
Implement automated contrast checking via Bun script integrated into CI/CD.

### Implementation
- Script calculates contrast ratios for all semantic pairings
- Fails CI if any pairing drops below WCAG AA (4.5:1)
- Reports specific violations with suggested fixes
- Runs on every commit involving color changes

### Testing Strategy
```typescript
// Pseudo-code
const pairings = [
  ['--text-primary', '--surface-primary'],
  ['--accent-fg', '--accent-500'],
  ['--text-secondary', '--surface-elevated']
];

pairings.forEach(([fg, bg]) => {
  const ratio = calculateContrast(getComputedValue(fg), getComputedValue(bg));
  assert(ratio >= 4.5, `${fg} on ${bg} fails WCAG AA: ${ratio}`);
});
```

### Rationale
- **Prevent regressions**: Automated checking catches accessibility issues
- **Dynamic validation**: Works with user-selected accent colors
- **Developer feedback**: Clear failure messages guide fixes
- **Compliance confidence**: Systematic verification

### Alternatives Considered
- **Manual testing**: Time-intensive, error-prone
- **Design tool validation**: Not connected to actual implementation
- **Browser extension**: Developer-dependent, not CI-integrated

### Consequences
- Additional CI overhead (acceptable for accessibility)
- Need to maintain test pairings as system evolves
- Strong confidence in accessibility compliance

---

## Implementation Priority

1. **ADR-002**: CSS Custom Properties foundation
2. **ADR-003**: Tailwind integration
3. **ADR-001**: HSL accent generation
4. **ADR-006**: Semantic token layer
5. **ADR-004**: Logo click interaction
6. **ADR-005**: Dark mode data attributes
7. **ADR-008**: Contrast automation
8. **ADR-007**: Glass morphism prep

---

**Document Status:** Living Document
**Last Updated:** 2025-01-17
**Review Cycle:** End of epic for lessons learned updates
