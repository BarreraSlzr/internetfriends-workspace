# 🎨 Gloo Design Guidelines - Opacity & Visual Effects

## 🚫 BANNED: Low Opacity Effects

**NEVER USE OPACITY BELOW 0.5 (50%)**

These kill visual impact and hide potential:
- ❌ `opacity: 0.04` (4%) - Invisible ghost layers
- ❌ `opacity: 0.07` (7%) - Barely perceptible 
- ❌ `opacity: 0.12` (12%) - Wasted design effort
- ❌ `opacity: 0.18` (18%) - Still too subtle

## ✅ APPROVED: Effective Opacity Ranges

### High Impact (Primary Effects)
- **0.8-1.0** (80-100%) - Primary content, main elements
- **0.6-0.8** (60-80%) - Secondary content, supporting elements

### Medium Impact (Accent Effects)  
- **0.5-0.6** (50-60%) - Background accents, subtle overlays
- **0.4-0.5** (40-50%) - Disabled states, muted content

### Low Impact (Only for specific use cases)
- **0.3-0.4** (30-40%) - Watermarks, ultra-subtle backgrounds
- **0.2-0.3** (20-30%) - Grid patterns, construction guides

## 🎯 Gloo Effect Guidelines

### WebGL/Canvas Effects
```tsx
// ✅ GOOD: Visible and impactful
<GlooEffect opacity={0.6} />

// ❌ BAD: Invisible waste of resources
<GlooEffect opacity={0.04} />
```

### Glass Morphism
```css
/* ✅ GOOD: Clear glass effect */
.glass-panel {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
}

/* ❌ BAD: Invisible glass */
.ghost-panel {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
}
```

### Background Overlays
```tsx
// ✅ GOOD: Purposeful overlay
<div style={{ opacity: 0.5 }}>
  <BackgroundPattern />
</div>

// ❌ BAD: Wasted computation
<div style={{ opacity: 0.07 }}>
  <ExpensiveAnimation />
</div>
```

## 🔧 Implementation Rules

### 1. Blur Before Opacity
Instead of ultra-low opacity, use blur for subtlety:
```css
/* ✅ GOOD */
.subtle-bg {
  filter: blur(8px);
  opacity: 0.6;
}

/* ❌ BAD */
.invisible-bg {
  opacity: 0.12;
}
```

### 2. Color Mixing Over Transparency
Use color mixing for subtle effects:
```css
/* ✅ GOOD */
.accent-overlay {
  background: color-mix(in srgb, var(--primary) 20%, transparent);
}

/* ❌ BAD */
.ghost-overlay {
  background: var(--primary);
  opacity: 0.04;
}
```

### 3. Conditional Rendering
Don't render invisible elements:
```tsx
// ✅ GOOD
{showEffect && <GlooEffect opacity={0.6} />}

// ❌ BAD  
<GlooEffect opacity={0.04} />
```

## 🎨 Visual Hierarchy

### Primary Level (90-100%)
- Main content
- Interactive elements
- Hero sections

### Secondary Level (60-80%)
- Supporting content
- Navigation elements
- Card backgrounds

### Tertiary Level (40-60%)
- Accent patterns
- Decorative elements
- Background textures

### Utility Level (20-40%)
- Grid guides
- Construction helpers
- Debug overlays

## 🚀 Performance Benefits

### Before (Low Opacity Abuse)
- Multiple invisible layers consuming GPU
- Expensive blur effects at 4% opacity
- Complex animations nobody sees

### After (Smart Opacity)
- Visible effects only
- Purposeful visual hierarchy
- Better performance with impact

## 🎯 Use Case Matrix

| Element Type | Recommended Opacity | Use Case |
|--------------|-------------------|----------|
| Hero Backgrounds | 0.7-0.9 | High visual impact |
| Card Overlays | 0.6-0.8 | Clear but layered |
| Accent Patterns | 0.4-0.6 | Subtle enhancement |
| Grid Systems | 0.3-0.4 | Construction guides |
| Disabled States | 0.4-0.5 | Clear indication |
| Loading States | 0.6-0.8 | User feedback |

## 💡 Quick Fixes

### Replace These Patterns:
```tsx
// ❌ REMOVE
style={{ opacity: 0.04 }}
style={{ opacity: 0.07 }}
style={{ opacity: 0.12 }}

// ✅ REPLACE WITH
style={{ opacity: 0.5 }}
className="opacity-50"
// OR remove entirely if not needed
```

---

**Remember: If users can't see it, don't render it. Make every effect count!**