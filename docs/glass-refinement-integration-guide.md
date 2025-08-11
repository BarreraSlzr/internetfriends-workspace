# Glass Refinement System - Integration Guide

**Epic**: `glass-refinement-v1`  
**Version**: 1.0.0  
**Last Updated**: January 2025

## Quick Start

### 1. Import Components

```tsx
// Glass components
import { GlassRefinedAtomic } from '@/components/atomic/glass-refined';
import { BgGooRefined } from '@/components/backgrounds-refined/bg-goo-refined';

// Hooks
import { useHeaderOrbit } from '@/hooks/use-header-orbit';

// CSS utilities (optional)
import '@/styles/utilities/glass-refined.scss';
```

### 2. Basic Glass Card

```tsx
function ProductCard() {
  return (
    <GlassRefinedAtomic
      variant="card"
      mode="ambient"
      padding={true}
      hover={true}
      className="max-w-sm"
    >
      <h3 className="text-xl font-semibold mb-2">Professional Glass</h3>
      <p className="text-muted-foreground">
        Coupled opacity and blur for consistent material appearance
      </p>
    </GlassRefinedAtomic>
  );
}
```

### 3. Header with Orbital Motion

```tsx
function SiteHeader() {
  const { headerRef, orbitStyles } = useHeaderOrbit({
    threshold: 64,
    amplitudeX: 6,
    amplitudeY: 3,
    scaleRange: [1, 0.75],
  });

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 bg-glass-bg-header backdrop-blur-12"
      style={orbitStyles}
    >
      {/* Header content */}
    </header>
  );
}
```

### 4. Background with Semantic Modes

```tsx
function HeroSection() {
  return (
    <section className="relative min-h-screen">
      <BgGooRefined
        mode="focus"
        noise={true}
        parallaxIntensity={0.4}
      />
      
      <div className="relative z-10">
        {/* Hero content */}
      </div>
    </section>
  );
}
```

## Component API Reference

### GlassRefinedAtomic

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `GlassMode` | - | Semantic mode (ambient/focus/narrative/performance/immersive) |
| `strength` | `number` | `0.45` | Manual strength override (0-1) |
| `variant` | `GlassVariant` | `"default"` | Variant preset (default/header/modal/overlay/card) |
| `noise` | `boolean` | `false` | Enable noise texture overlay |
| `hover` | `boolean` | `false` | Enable hover effects |
| `padding` | `boolean` | `true` | Include padding |
| `bordered` | `boolean` | `true` | Show border |
| `size` | `GlassSize` | `"md"` | Size preset (sm/md/lg/xl) |

#### Examples

```tsx
// Semantic mode
<GlassRefinedAtomic mode="focus" noise={true}>
  Content
</GlassRefinedAtomic>

// Manual strength
<GlassRefinedAtomic strength={0.7} hover={true}>
  Strong glass with hover
</GlassRefinedAtomic>

// Modal overlay
<GlassRefinedAtomic variant="modal" size="lg">
  Modal content
</GlassRefinedAtomic>
```

### useHeaderOrbit Hook

#### Configuration

```tsx
interface HeaderOrbitConfig {
  threshold?: number;      // Scroll activation (default: 64px)
  range?: number;          // Progress range (default: 400px)
  amplitudeX?: number;     // Horizontal orbit (default: 6px)
  amplitudeY?: number;     // Vertical orbit (default: 3px)
  scaleRange?: [number, number]; // Scale range (default: [1, 0.75])
  respectReducedMotion?: boolean; // Accessibility (default: true)
  throttle?: number;       // Performance (default: 16ms)
}
```

#### Return Value

```tsx
interface UseHeaderOrbitReturn {
  state: HeaderOrbitState;          // Current orbit state
  headerRef: React.RefObject<HTMLElement>; // Ref to attach
  cssProperties: Record<string, string | number>; // CSS vars
  orbitStyles: React.CSSProperties; // Direct styles
  updateOrbit: () => void;          // Force update
}
```

#### Presets

```tsx
import { HEADER_ORBIT_PRESETS } from '@/hooks/use-header-orbit';

// Subtle motion
const orbit = useHeaderOrbit(HEADER_ORBIT_PRESETS.subtle);

// Dramatic effect
const orbit = useHeaderOrbit(HEADER_ORBIT_PRESETS.dramatic);

// Performance optimized
const orbit = useHeaderOrbit(HEADER_ORBIT_PRESETS.performance);
```

### BgGooRefined Background

#### Mode Configurations

| Mode | Strength | Parallax | Saturation | Speed | Use Case |
|------|----------|----------|------------|-------|----------|
| `ambient` | 0.40 | 0.25 | 0.90 | 0.30 | Default background |
| `focus` | 0.55 | 0.40 | 1.05 | 0.40 | Hero sections |
| `narrative` | 0.50 | 0.35 | 1.00 | 0.50 | Scroll stories |
| `performance` | 0.30 | 0.10 | 0.85 | 0.25 | Mobile/low-power |
| `immersive` | 0.60 | 0.45 | 1.15 | 0.60 | Marketing pages |

#### Props

```tsx
interface BgGooRefinedProps {
  mode?: "ambient" | "focus" | "narrative" | "performance" | "immersive";
  strength?: number;        // Manual override
  parallaxIntensity?: number; // Parallax strength
  speed?: number;          // Animation speed
  noise?: boolean;         // Texture overlay
  colors?: [string, string, string]; // Custom palette
  disabled?: boolean;      // Disable entirely
  respectReducedMotion?: boolean; // Accessibility
}
```

## CSS Utilities

### Glass Strength Classes

```scss
.glass-subtle      // strength: 0.3
.glass-default     // strength: 0.45
.glass-medium      // strength: 0.55  
.glass-strong      // strength: 0.65
```

### Mode Classes

```scss
.glass-mode-ambient      // ambient preset
.glass-mode-focus        // focus preset
.glass-mode-narrative    // narrative preset
.glass-mode-performance  // performance preset
.glass-mode-immersive    // immersive preset
```

### Enhancement Classes

```scss
.glass-noise        // Add noise texture
.glass-hover        // Hover interactions
.glass-focus-dashed // Dashed focus ring
.orbital-header     // Orbital motion support
```

### Usage Examples

```tsx
// With utility classes
<div className="glass-default glass-noise glass-hover radius-glass-md">
  Content with utility classes
</div>

// Orbital header utility
<header className="orbital-header sticky top-0">
  Header content
</header>
```

## Theme Integration

### CSS Custom Properties

The system uses CSS custom properties for theme-aware colors:

```css
/* Light theme (default) */
:root {
  --glass-base-color: 255, 255, 255;
  --glass-strength-default: 0.45;
}

/* Dark theme */
[data-theme="dark"] {
  --glass-base-color: 17, 24, 39;
}
```

### Mature Color Palette

Replace saturated colors with sophisticated alternatives:

```tsx
// Old: Toy-like saturation
className="bg-blue-500 text-white"

// New: Mature neutral system  
className="bg-if-neutral-800 text-if-neutral-100"

// Secondary accent for tertiary elements
className="text-if-accent-secondary bg-if-accent-secondary-light"
```

## Accessibility Guidelines

### Reduced Motion Compliance

All components respect `prefers-reduced-motion: reduce`:

```tsx
// Orbital motion falls back to scale-only
const orbit = useHeaderOrbit({
  respectReducedMotion: true // default
});

// Background animations reduce speed/amplitude
<BgGooRefined 
  mode="performance" 
  respectReducedMotion={true}
/>
```

### Focus Management

Glass components include proper focus indicators:

```tsx
// Dashed focus rings (Mermaid-inspired)
<GlassRefinedAtomic className="focus:outline-dashed">
  Accessible glass component
</GlassRefinedAtomic>
```

### High Contrast Support

Components adapt to high contrast preferences:

```css
@media (prefers-contrast: high) {
  .glass-refined {
    border-width: 2px;
  }
}
```

## Performance Best Practices

### Glass System Optimization

1. **Use semantic modes** instead of manual strength values
2. **Limit blur radius** to 12px maximum (enforced automatically)
3. **Enable noise sparingly** on performance-critical pages
4. **Prefer CSS utilities** for simple glass effects

```tsx
// Good: Semantic mode
<GlassRefinedAtomic mode="ambient" />

// Better: CSS utility for simple cases
<div className="glass-default" />
```

### Orbital Motion Optimization

1. **Use provided presets** for common patterns
2. **Enable throttling** for smooth 60fps performance
3. **Respect reduced motion** for accessibility

```tsx
// Optimized orbital configuration
const orbit = useHeaderOrbit({
  throttle: 16,  // 60fps
  respectReducedMotion: true
});
```

### Background Performance

1. **Choose appropriate modes** based on context
2. **Use performance mode** on mobile/low-power devices
3. **Disable backgrounds** when not needed

```tsx
// Performance-optimized background
<BgGooRefined 
  mode="performance"
  disabled={isMobile}
  respectReducedMotion={true}
/>
```

## Common Patterns

### Hero Section with Glass Card

```tsx
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center">
      <BgGooRefined mode="focus" noise={true} />
      
      <div className="container mx-auto px-4 relative z-10">
        <GlassRefinedAtomic
          mode="focus"
          size="lg"
          hover={true}
          className="max-w-2xl mx-auto text-center"
        >
          <h1 className="text-4xl font-bold mb-6">
            Professional Glass Design
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Strength-based coupling ensures consistent material appearance
          </p>
          <button className="glass-default glass-hover px-8 py-3 rounded-lg">
            Get Started
          </button>
        </GlassRefinedAtomic>
      </div>
    </section>
  );
}
```

### Navigation with Orbital Motion

```tsx
function Navigation() {
  const { headerRef, orbitStyles, state } = useHeaderOrbit();

  return (
    <nav
      ref={headerRef}
      className="sticky top-0 z-50"
      style={orbitStyles}
    >
      <GlassRefinedAtomic
        variant="header"
        bordered={false}
        className="px-6 py-4"
      >
        <div className="flex items-center justify-between">
          <Logo />
          <NavLinks />
          <ThemeToggle />
        </div>
      </GlassRefinedAtomic>
      
      {/* Orbital state indicator */}
      {state.progress > 0 && (
        <div className="glass-subtle px-2 py-1 text-xs">
          Orbit: {(state.progress * 100).toFixed(0)}%
        </div>
      )}
    </nav>
  );
}
```

### Modal with Strong Glass

```tsx
function Modal({ isOpen, onClose, children }) {
  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      {/* Backdrop */}
      <div 
        className="glass-medium absolute inset-0" 
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <GlassRefinedAtomic
          variant="modal"
          noise={true}
          className="max-w-md w-full"
        >
          {children}
        </GlassRefinedAtomic>
      </div>
    </div>
  );
}
```

## Migration from Legacy System

### Step 1: Replace Glass Cards

```tsx
// Before
<div className="glass-card backdrop-blur-glass bg-glass border-glass">
  Content
</div>

// After
<GlassRefinedAtomic variant="card">
  Content
</GlassRefinedAtomic>
```

### Step 2: Update Headers

```tsx
// Before (manual scroll effects)
const [scrollY, setScrollY] = useState(0);
useEffect(() => {
  const handleScroll = () => setScrollY(window.scrollY);
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

// After (declarative hook)
const { headerRef, orbitStyles } = useHeaderOrbit();