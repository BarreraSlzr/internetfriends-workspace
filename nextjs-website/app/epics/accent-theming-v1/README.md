# 🎨 Epic: Accent Theming v1

## 📋 Epic Overview

**Epic Name:** `accent-theming-v1`
**Timeline:** 2-3 weeks
**Branch:** `epic/accent-theming-v1`
**Goal:** Introduce a dynamic, user-customizable accent system, refactor hard-coded brand utilities into semantic tokens, establish dark mode foundations, and ensure accessibility compliance.

## 🎯 Success Metrics

### Quantitative Targets
- **80-90% reduction** in hard-coded color hex/classes for brand blue variants
- **100% of primary UI components** referencing semantic or accent tokens
- **0 contrast violations** (WCAG AA compliance for all text)
- **<16ms accent swap time** (no layout shift, verified performance)
- **Dark mode scaffold** in place for future expansion

### Before/After Comparison
- **Before:** `border-brand-blue-800`, `from-brand-blue-300`, `text-brand-blue-900`
- **After:** `border-border-strong`, `from-accent-300`, `text-text-primary`

## 🏗️ Architecture Goals

### Token System
- CSS custom properties for all color values
- HSL-based accent generation with algorithmic scales
- Semantic token abstraction (surface, border, text roles)
- Runtime accent switching with persistence

### Theme Structure
```css
:root {
  /* Semantic surfaces */
  --surface-primary: 0 0% 100%;
  --text-primary: 220 15% 12%;

  /* Dynamic accent scale */
  --accent-500: 217 89% 60%; /* Base hue */
  --accent-300: 217 90% 78%; /* Lighter variant */
  --accent-700: 217 80% 46%; /* Darker variant */
}

[data-theme="dark"] {
  --surface-primary: 220 18% 10%;
  --text-primary: 0 0% 100%;
}
```

### User Experience
- Logo click cycles through curated accent colors
- Persistent selection via localStorage + SSR-safe hydration
- Future: Color picker panel for full customization

## 🎭 Feature Breakdown

### Phase 1: Foundation
- [ ] **accent-token-foundation** - Base CSS variable layers
- [ ] **tailwind-variable-integration** - Map Tailwind colors to CSS vars
- [ ] **runtime-accent-switch** - User-triggered accent system

### Phase 2: Core Implementation
- [ ] **dark-mode-scaffold** - data-theme handling + overrides
- [ ] **gradient-refactor-phase1** - Convert hero/card gradients
- [ ] **contrast-audit-ci** - Automated accessibility checking

### Phase 3: Polish & Future-Ready
- [ ] **glass-morph-prep** - Tokens + pilot implementation
- [ ] **accessibility-performance-review** - Verification & optimization
- [ ] **epic-documentation-close** - Complete documentation

## 🔧 Technical Implementation

### File Structure
```
app/
  epics/accent-theming-v1/
    README.md                 # This file
    decisions.md              # Architectural decisions
  theme/
    tokens/
      accent.css              # CSS custom properties
    runtime/
      accent_engine.ts        # HSL generation & application
      accent_cycle.ts         # Logo click cycling
      theme_init.ts           # SSR-safe initialization
  scripts/
    contrast/
      audit.ts                # WCAG compliance checking
```

### Key APIs
```typescript
// Apply accent color
applyAccent('#6366f1') // Violet
applyAccent('#10b981') // Green

// Initialize with saved preference
initAccent() // Loads from localStorage or uses default

// Theme switching
setTheme('dark') // Future implementation
```

## 🎨 Current Color Analysis

### Existing Usage (InternetFriends.xyz)
- `border-brand-blue-800` - Structural separators
- `from-brand-blue-300 via-brand-blue-300 to-brand-blue-500` - Hero gradients
- `text-brand-blue-900` - High contrast text on light backgrounds
- `text-brand-blue-100` - Light text on dark/saturated backgrounds

### Migration Strategy
1. **Replace border utilities** → `border-border-strong`
2. **Convert gradients** → `bg-gradient-to-tr from-accent-300 to-accent-500`
3. **Semantic text colors** → `text-primary`, `text-inverted`
4. **Focus states** → `ring-accent-400`

## 🔬 Quality Assurance

### Accessibility Standards
- WCAG AA compliance (4.5:1 contrast ratio minimum)
- High contrast mode support via `data-theme="high-contrast"`
- `prefers-reduced-motion` and `prefers-reduced-transparency` support

### Performance Criteria
- No FOUC (Flash of Unstyled Content) during accent changes
- Minimal runtime CSS property updates
- Efficient HSL calculation and caching

### Browser Support
- Modern browsers with CSS custom properties
- Graceful fallback to default blue accent
- SSR hydration alignment

## 📊 Progress Tracking

### Completion Status
- [ ] Phase 1: Foundation (0/3)
- [ ] Phase 2: Core Implementation (0/3)
- [ ] Phase 3: Polish & Future-Ready (0/3)

### Metrics Dashboard
```json
{
  "tokens_migrated": 0,
  "hard_coded_colors_removed": 0,
  "contrast_pass_rate": "0%",
  "accent_swap_avg_ms": null,
  "dark_mode_coverage": "0%"
}
```

## 🚀 Impact Vision

### Immediate Benefits
- Consistent brand experience across all components
- User personalization capability
- Accessibility compliance guarantee
- Maintainable color system

### Future Enablement
- Glass morphism effects with proper contrast
- Advanced theming (seasonal, accessibility modes)
- Micro-frontend color token sharing
- Design system scalability

## 📚 Related Documentation

- [InternetFriends Design System](.github/copilot-instructions.md)
- [Epic Git Strategy](../../GIT_EPIC_STRATEGY.md)
- [Tailwind Configuration](./tailwind.config.ts)

---

**Epic Status:** 🚧 In Progress
**Last Updated:** $(date)
**Next Milestone:** Token Foundation Implementation
