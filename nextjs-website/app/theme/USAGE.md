# InternetFriends Accent Theming System - Usage Guide

## 🎨 Overview

The InternetFriends Accent Theming System provides dynamic, user-customizable color themes while maintaining accessibility and visual consistency. Built on HSL color generation and CSS custom properties, it enables runtime theme switching with zero performance impact.

## 🚀 Quick Start

### 1. Basic Setup

```tsx
import { ThemeProvider } from '@/app/theme/theme-provider';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 2. Enable Logo Accent Cycling

```tsx
<ThemeProvider
  enableAccentCycling={true}
  logoSelector="[data-logo], .logo, [href='/']"
>
  {/* Your app content */}
</ThemeProvider>
```

### 3. Use Theme-Aware Components

```tsx
function MyComponent() {
  const { currentAccent, isDarkMode } = useTheme();

  return (
    <div className="bg-theme-accent-100 border-theme-accent-300">
      <h1 className="text-theme-accent-900">
        Current accent: {currentAccent?.name}
      </h1>
    </div>
  );
}
```

## 🎯 Core Concepts

### Color Token Hierarchy

```css
/* Dynamic Accent Scale (user-customizable) */
--accent-50: 217 91% 97%;   /* Lightest */
--accent-500: 217 89% 60%;  /* Base color */
--accent-900: 217 70% 32%;  /* Darkest */

/* Semantic Tokens (stable API) */
--color-primary: var(--accent-500);
--surface-accent-subtle: var(--accent-50);
--border-accent-strong: var(--accent-600);
```

### Tailwind Integration

```tsx
// ✅ Dynamic accent utilities
<button className="bg-theme-accent-500 hover:bg-theme-accent-600">
  Primary Button
</button>

// ✅ Semantic tokens (recommended)
<div className="bg-surface text-primary border-border-subtle">
  Content
</div>

// ❌ Avoid hard-coded colors
<div className="bg-blue-500 text-blue-900">
  Static colors
</div>
```

## 📚 Available Utilities

### Tailwind Classes

| Class Pattern | Description | Example |
|---------------|-------------|---------|
| `theme-accent-{weight}` | Dynamic accent colors | `bg-theme-accent-500` |
| `surface-{variant}` | Semantic surfaces | `bg-surface-elevated` |
| `border-accent-{strength}` | Accent borders | `border-accent-medium` |
| `bg-gradient-accent-{style}` | Accent gradients | `bg-gradient-accent-bold` |

### CSS Custom Properties

```css
:root {
  /* Accent Scale */
  --accent-50: /* ... */;
  --accent-500: /* ... */;
  --accent-900: /* ... */;

  /* Semantic Tokens */
  --color-primary: var(--accent-500);
  --surface-accent-subtle: var(--accent-50);
  --border-focus-ring: var(--accent-400);

  /* Gradients */
  --gradient-card-primary: linear-gradient(...);
  --gradient-accent-bold: linear-gradient(...);
}
```

## 🪝 React Hooks

### useTheme()

Complete theme system access:

```tsx
function ThemeAwareComponent() {
  const {
    isInitialized,
    currentAccent,
    accentMetrics,
    isDarkMode,
    toggleDarkMode,
    errors
  } = useTheme();

  if (!isInitialized) {
    return <div>Loading theme...</div>;
  }

  return (
    <div>
      <h1>Current: {currentAccent?.name}</h1>
      <button onClick={toggleDarkMode}>
        {isDarkMode ? 'Light' : 'Dark'} Mode
      </button>
    </div>
  );
}
```

### useAccent()

Accent-specific functionality:

```tsx
function AccentDisplay() {
  const { currentAccent, accentMetrics, isInitialized } = useAccent();

  return (
    <div className="bg-theme-accent-100 p-4">
      <div className="text-theme-accent-800">
        {currentAccent?.name} ({accentMetrics?.accessibility})
      </div>
    </div>
  );
}
```

### useDarkMode()

Dark mode controls only:

```tsx
function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 bg-surface-elevated hover:bg-theme-accent-100"
    >
      {isDarkMode ? '☀️' : '🌙'}
    </button>
  );
}
```

## 🎨 Accent Presets

### Built-in Presets

| Name | Hex | Category | Use Case |
|------|-----|----------|----------|
| InternetFriends Blue | `#3b82f6` | Brand | Default, trustworthy |
| Royal Purple | `#6366f1` | Professional | Creative, innovative |
| Elegant Violet | `#8b5cf6` | Professional | Artistic, sophisticated |
| Forest Green | `#10b981` | Nature | Growth, sustainability |
| Ocean Teal | `#0ea5e9` | Nature | Calm, reliable |
| Sunset Orange | `#f97316` | Vibrant | Energetic, creative |
| Magenta Pink | `#ec4899` | Vibrant | Bold, expressive |
| Slate Blue | `#475569` | Professional | Subtle, focused |

### Programmatic Accent Control

```tsx
import { jumpToAccent, jumpToAccentByName, cycleAccent } from '@/app/theme/runtime/accent_cycle';

// Jump to specific preset
jumpToAccent(2); // Jump to index 2

// Jump by name
jumpToAccentByName('Forest Green');

// Cycle forward/backward
cycleAccent('forward');
cycleAccent('backward');
```

## 🌓 Dark Mode Integration

### Automatic System Detection

```tsx
<ThemeProvider enableDarkMode={true}>
  {/* Automatically detects system preference */}
</ThemeProvider>
```

### Manual Control

```tsx
function MyComponent() {
  const { isDarkMode, setDarkMode, systemPrefersDark } = useDarkMode();

  return (
    <div>
      <p>System prefers: {systemPrefersDark ? 'Dark' : 'Light'}</p>
      <button onClick={() => setDarkMode(!isDarkMode)}>
        Toggle Dark Mode
      </button>
    </div>
  );
}
```

### CSS Scoping

```css
/* Light mode (default) */
:root {
  --surface-primary: 0 0% 100%;
  --text-primary: 220 15% 12%;
}

/* Dark mode overrides */
[data-theme="dark"] {
  --surface-primary: 220 18% 10%;
  --text-primary: 0 0% 100%;
}
```

## ♿ Accessibility Features

### Automatic Contrast Calculation

The system automatically calculates appropriate text colors for each accent background:

```tsx
// Automatic contrast colors
<div className="bg-theme-accent-300">
  <p className="text-theme-accent-contrast">
    Text color automatically chosen for optimal contrast
  </p>
</div>
```

### WCAG Compliance

```tsx
function AccessibilityInfo() {
  const { accentMetrics } = useAccent();

  return (
    <div>
      <p>Contrast Ratio: {accentMetrics?.contrastRatio.toFixed(2)}:1</p>
      <p>WCAG Level: {accentMetrics?.accessibility}</p>
    </div>
  );
}
```

### High Contrast Mode

```css
[data-theme="high-contrast"] {
  --color-primary: var(--accent-700);
  --border-accent-subtle: var(--accent-600);
  /* Stronger, more accessible colors */
}
```

## 🔧 Advanced Configuration

### Theme Provider Options

```tsx
<ThemeProvider
  enableAccentCycling={true}
  enableDarkMode={true}
  logoSelector="[data-logo], .logo"
  debugMode={process.env.NODE_ENV === 'development'}
  onThemeInitialized={(metrics) => {
    console.log('Theme ready:', metrics);
  }}
  onAccentChange={(preset, metrics) => {
    // Analytics tracking
    analytics.track('accent_changed', {
      accent: preset.name,
      contrast: metrics.accessibility
    });
  }}
  onThemeError={(error) => {
    // Error reporting
    console.error('Theme error:', error);
  }}
>
  {children}
</ThemeProvider>
```

### Custom Accent Generation

```tsx
import { applyAccent, previewAccentScale } from '@/app/theme/runtime/accent_engine';

// Apply custom hex color
applyAccent('#ff6b35');

// Preview without applying
const preview = previewAccentScale('#ff6b35');
console.log(preview.scale);
console.log(preview.contrast);
```

## 📦 Migration Guide

### From Brand Blue Classes

```tsx
// ❌ Before (static brand colors)
<div className="bg-brand-blue-300 border-brand-blue-800">
  <h1 className="text-brand-blue-900">Title</h1>
  <button className="bg-brand-blue-500 hover:bg-brand-blue-600">
    Action
  </button>
</div>

// ✅ After (dynamic accent system)
<div className="bg-theme-accent-300 border-theme-accent-800">
  <h1 className="text-theme-accent-900">Title</h1>
  <button className="bg-theme-accent-500 hover:bg-theme-accent-600">
    Action
  </button>
</div>

// 🎯 Best (semantic tokens)
<div className="bg-surface-accent-medium border-border-accent-strong">
  <h1 className="text-primary">Title</h1>
  <button className="bg-theme-accent-500 hover:bg-theme-accent-600">
    Action
  </button>
</div>
```

### Gradual Migration Strategy

1. **Phase 1**: Add ThemeProvider to root layout
2. **Phase 2**: Replace critical UI elements (buttons, links, focus states)
3. **Phase 3**: Convert background colors and cards
4. **Phase 4**: Update utility components and forms
5. **Phase 5**: Remove legacy brand-blue classes

## 🐛 Debugging

### Development Tools

```tsx
import { useThemeDebug } from '@/app/theme/theme-provider';

function DebugPanel() {
  const { debug, errors, isInitialized } = useThemeDebug();

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 bg-surface-elevated p-4 rounded-lg border">
      <button onClick={debug.logThemeState}>Log Theme State</button>
      <button onClick={debug.forceReinitialize}>Force Reinit</button>
      {errors.length > 0 && (
        <div className="text-red-600">
          Errors: {errors.join(', ')}
        </div>
      )}
    </div>
  );
}
```

### Browser Console Commands

In development mode, these utilities are available globally:

```js
// Log complete theme state
ThemeDebug.logState();

// Force theme re-initialization
await ThemeDebug.forceReinit();

// Test accent cycling
ThemeDebug.testCycling();
```

## 📊 Performance Considerations

### SSR-Safe Initialization

```tsx
// Prevents FOUC with inline styles
export function generateInlineAccentCSS(accentHex = '#3b82f6') {
  return `
    :root {
      --accent-color-primary: ${accentHex};
    }
    [data-accent-loading] { opacity: 0.95; }
    [data-accent-ready] { opacity: 1; }
  `;
}
```

### Optimized Re-renders

The theme system uses React.useMemo and careful dependency management to minimize re-renders:

```tsx
// Only re-renders when accent actually changes
const contextValue = React.useMemo(() => ({
  currentAccent,
  accentMetrics,
  // ... other values
}), [currentAccent, accentMetrics]);
```

## 🔮 Future Enhancements

### Planned Features

- [ ] Color picker component for custom accents
- [ ] Seasonal theme presets
- [ ] Advanced accessibility modes
- [ ] Component-level theme overrides
- [ ] Animation system integration
- [ ] Design token export/import

### Extensibility

The system is designed to be extended with additional features:

```tsx
// Custom accent presets
const CUSTOM_PRESETS = [
  {
    name: 'Company Brand',
    hex: '#your-brand-color',
    description: 'Official company branding',
    category: 'custom'
  }
];
```

## 📞 Support

For questions, issues, or contributions:

1. Check the existing issues in the repository
2. Review the architectural decisions in `/app/epics/accent-theming-v1/decisions.md`
3. Run the contrast audit: `bun scripts/contrast/audit.ts`
4. Enable debug mode for detailed logging

---

**Built with ❤️ by the InternetFriends team**
*Making theming accessible, beautiful, and developer-friendly.*
