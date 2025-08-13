# InternetFriends Components (Steadiest Addressability)

This package hosts emerging components aligned with the `glass-refinement-v1` epic and the Steadiest Addressability Migration Guide.

## NavigationMolecular

A molecular navigation bar implementing steadiest addressability principles:
- ≤6 props (items, variant, theme, disabled, className, data-testid)
- Productive defaults for variant, theme, branding, search, sticky behavior
- Once-on-mount stable configuration (id, timestamps) using canonical timestamp utilities
- Proper accessibility semantics (nav > ul > li)
- Theme auto-detection (prefers-color-scheme)

```tsx
import { NavigationMolecular } from './molecular/navigation/navigation.molecular';

<NavigationMolecular />
```

## Timestamp Compliance
Uses canonical `getIsoTimestamp()` and `generateStamp()` utilities (no direct `Date.now()` usage in component code).

## Next Steps
- Integrate with header orbital motion hook
- Extract styling tokens to shared design system
- Add unit tests for rendering, active state, and theme detection
