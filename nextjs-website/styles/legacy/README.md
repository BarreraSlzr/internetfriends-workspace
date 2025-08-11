# Legacy SCSS Files - Deprecated

⚠️ **DEPRECATED**: These files are scheduled for removal and are no longer used in the build process.

## Migration Status

These legacy SCSS files have been **completely replaced** by the modern modular design system:

- `variables.scss` → Replaced by individual token modules in `../tokens/`
- `mixins.scss` → Replaced by individual mixin modules in `../mixins/`

## Modern Equivalent

Instead of importing legacy files, use the modern aggregated system:

```scss
// ❌ OLD (Deprecated)
@use "../styles/variables.scss" as vars;
@use "../styles/mixins.scss" as mixins;

// ✅ NEW (Current)
@use "../styles/index.scss" as design;
// OR specific modules:
@use "../styles/tokens/colors.scss" as colors;
@use "../styles/mixins/focus.scss" as focus;
```

## What Changed

### variables.scss → Token Modules
- **Before**: `$if-primary`, `$spacing`, `$font-size` in single file
- **After**: Organized by domain in `../tokens/`:
  - `colors.scss` - Brand colors, themes, glass morphism
  - `spacing.scss` - Layout, radius, breakpoints, z-index
  - `typography.scss` - Font sizes, shadows, animations
  - `fonts.scss` - Font families, semantic tokens
  - `accent.scss` - Dynamic accent system

### mixins.scss → Mixin Modules
- **Before**: 606 lines of mixed concerns in single file
- **After**: Organized by function in `../mixins/`:
  - `focus.scss` - Focus states (dashed borders, Mermaid-inspired)
  - `media.scss` - Responsive breakpoints, feature queries
  - `components.scss` - Button, card, input, glass morphism patterns

## Performance Impact

**Removed from build pipeline:**
- 131 lines (`variables.scss`) + 606 lines (`mixins.scss`) = 737 lines
- ~15.9 KB raw SCSS source eliminated
- Zero build-time compilation overhead
- No risk of accidental legacy imports

## Deletion Timeline

- **Phase 3.1** (Current): Quarantined in `/legacy/` directory
- **Phase 3.2** (Next sprint): Hard deletion after validation
- **Phase 3.3** (CI Guard): Prevent reintroduction via linting rules

## Emergency Recovery

If you need to reference legacy patterns temporarily:

1. **Don't re-import these files** - they contain deprecated `map-get()` syntax
2. **Use the modern equivalent** from `../index.scss` or specific token modules
3. **Check git history** if you need to see the original implementation

## Modern Design System Benefits

✅ **Modular imports** - Import only what you need
✅ **@use syntax** - Modern SCSS with proper scoping
✅ **map.get()** - Current SCSS function syntax
✅ **Performance** - Tree-shakeable, optimized builds
✅ **Maintainability** - Clear separation of concerns

---

*This directory will be removed in the next phase of the performance optimization epic.*
