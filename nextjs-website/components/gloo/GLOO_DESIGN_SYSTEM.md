# Gloo Design System Rules & Guidelines

## 🎯 Core Philosophy

**Gloo** creates immersive, dynamic backgrounds that enhance UI elements without overwhelming content. The system prioritizes visual harmony, performance, and contextual appropriateness across all usage scenarios.

## 📐 Fundamental Rules

### **1. Visual Hierarchy & Layer Management**
```typescript
// Z-index hierarchy (absolute values)
const GLOO_Z_INDEX = {
  background: 0,    // Gloo canvas layer
  content: 10,      // Text, buttons, forms
  overlay: 20,      // Modals, dropdowns
  controls: 30      // Gloo controls, debug tools
}
```

### **2. Context-Based Configuration**
```typescript
type GlooContext = 'hero' | 'card' | 'background' | 'accent' | 'error'

const CONTEXT_RULES = {
  hero: {
    intensity: 'moderate',
    interactivity: true,
    controls: true,
    colorRotation: 'normal',
    maxSpeed: 0.5
  },
  card: {
    intensity: 'subtle',
    interactivity: false, 
    controls: false,
    colorRotation: 'subtle',
    maxSpeed: 0.3
  },
  background: {
    intensity: 'subtle',
    interactivity: false,
    controls: false,
    colorRotation: 'realtime',
    maxSpeed: 0.2
  },
  accent: {
    intensity: 'bold',
    interactivity: true,
    controls: true,
    colorRotation: 'dynamic',
    maxSpeed: 0.7
  },
  error: {
    intensity: 'dramatic',
    interactivity: false,
    controls: false,
    colorRotation: 'static',
    maxSpeed: 0.1
  }
}
```

### **3. Responsive Behavior**
```scss
// Gloo container responsive rules
.gloo-container {
  /* Mobile: Reduced intensity */
  @media (max-width: 768px) {
    --gloo-speed: calc(var(--gloo-speed-base) * 0.7);
    --gloo-depth: min(var(--gloo-depth-base), 2);
  }
  
  /* Tablet: Standard intensity */
  @media (min-width: 769px) and (max-width: 1024px) {
    --gloo-speed: var(--gloo-speed-base);
    --gloo-depth: var(--gloo-depth-base);
  }
  
  /* Desktop: Full intensity */
  @media (min-width: 1025px) {
    --gloo-speed: calc(var(--gloo-speed-base) * 1.2);
    --gloo-depth: var(--gloo-depth-base);
  }
}
```

## 🎨 Color & Visual Integration

### **1. Color Harmony Rules**
```typescript
const COLOR_INTEGRATION_RULES = {
  // Brand alignment
  brandAlignment: {
    primary: 'Use brand blue (#3b82f6) as dominant color in rotation',
    secondary: 'Complement with purple/cyan gradients',
    accent: 'Allow warm colors (amber, orange) sparingly'
  },
  
  // Contrast requirements
  contrast: {
    textOverlay: 'Minimum 4.5:1 contrast ratio',
    buttonOverlay: 'Minimum 3:1 contrast ratio',
    glassElements: 'Minimum 2:1 contrast ratio for glass morphism'
  },
  
  // Color rotation behavior
  rotation: {
    hero: 'Full spectrum rotation with brand bias',
    cards: 'Limited palette rotation (3-4 related hues)',
    background: 'Subtle temperature shifts only',
    error: 'Red-based palette with minimal rotation'
  }
}
```

### **2. Dark Mode Compatibility**
```typescript
const DARK_MODE_RULES = {
  colorIntensity: {
    light: 'Standard RGB values (0.0-1.0)',
    dark: 'Reduced intensity by 30% for comfort'
  },
  
  backgroundBlending: {
    light: 'Normal blending with white/light backgrounds',
    dark: 'Enhanced contrast with dark backgrounds'
  },
  
  textCompatibility: {
    requirement: 'Ensure text remains readable across all rotation phases',
    solution: 'Use adaptive text shadows and background overlays'
  }
}
```

## 🏗️ Component Integration Patterns

### **1. Hero Section Implementation**
```typescript
// Standard hero with Gloo
<HeroText 
  useGloo={true}
  backgroundStrategy="gloo"
  colorRotation="normal"
  speed={0.3}
  showControls={true}
  context="hero"
/>
```

### **2. Card Component Integration**
```typescript
// Standard card with Gloo accent
<CustomCard
  useGloo={Math.random() > 0.5} // Random enablement
  glooIntensity={0.15}          // Subtle intensity
  gridSize={0.2}               // Small pattern scale
  colorRotation="subtle"       // Gentle color evolution
  context="card"
/>
```

### **3. Background Layer Implementation**
```typescript
// Page-wide background
<div className="min-h-screen relative">
  <BgGooRotating
    context="background"
    colorRotation="realtime"
    speed={0.1}
    showControls={false}
    className="absolute inset-0 z-0"
  />
  <div className="relative z-10">
    {/* Page content */}
  </div>
</div>
```

## 📱 Platform-Specific Rules

### **1. Performance Optimization**
```typescript
const PERFORMANCE_RULES = {
  mobile: {
    maxFPS: 30,
    reducedMotion: 'Honor prefers-reduced-motion',
    batteryOptimization: 'Pause when page not visible'
  },
  
  desktop: {
    maxFPS: 60,
    fullFeatures: 'Enable all effects and controls',
    multipleInstances: 'Allow multiple Gloo components'
  },
  
  tablet: {
    maxFPS: 45,
    adaptiveQuality: 'Adjust based on device capabilities',
    touchOptimization: 'Optimize for touch interactions'
  }
}
```

### **2. Accessibility Compliance**
```typescript
const ACCESSIBILITY_RULES = {
  reducedMotion: {
    detection: 'Check prefers-reduced-motion media query',
    behavior: 'Show static version or very gentle motion',
    override: 'Allow manual override for user preference'
  },
  
  screenReaders: {
    content: 'Mark Gloo as decorative (aria-hidden="true")',
    semantics: 'Never convey information through Gloo alone'
  },
  
  keyboardNavigation: {
    skipToContent: 'Provide skip links over Gloo backgrounds',
    focusManagement: 'Ensure focus indicators are visible'
  }
}
```

## 🎭 Usage Context Guidelines

### **1. When to Use Gloo**
✅ **DO USE for:**
- Hero sections (primary landing areas)
- Feature cards and highlights
- Interactive elements requiring visual flair
- Brand showcases and portfolio pieces
- Empty states and error pages (subtle)

❌ **DON'T USE for:**
- Text-heavy content areas
- Form inputs and data entry
- Navigation menus (except accents)
- High-frequency interaction areas
- Critical information displays

### **2. Intensity Guidelines**
```typescript
const INTENSITY_GUIDE = {
  subtle: {
    when: 'Background elements, secondary content',
    specs: 'Speed: 0.1-0.2, Depth: 1-2, Colors: muted'
  },
  
  moderate: {
    when: 'Hero sections, feature highlights',
    specs: 'Speed: 0.2-0.4, Depth: 2-3, Colors: brand-aligned'
  },
  
  bold: {
    when: 'Call-to-action areas, interactive elements',
    specs: 'Speed: 0.4-0.6, Depth: 3-4, Colors: vibrant'
  },
  
  dramatic: {
    when: 'Special states, error conditions, showcases',
    specs: 'Speed: 0.6+, Depth: 4+, Colors: high-contrast'
  }
}
```

## 🔧 Technical Implementation Rules

### **1. Component Structure**
```typescript
// Standard Gloo component wrapper
interface GlooWrapperProps {
  context: GlooContext;
  children: React.ReactNode;
  intensity?: 'subtle' | 'moderate' | 'bold' | 'dramatic';
  colorRotation?: ColorRotationPreset;
  enableRandom?: boolean;
}

const GlooWrapper: React.FC<GlooWrapperProps> = ({
  context,
  children,
  intensity = 'moderate',
  colorRotation = 'normal',
  enableRandom = false
}) => {
  // Implementation with context-aware defaults
};
```

### **2. Performance Standards**
```typescript
const PERFORMANCE_STANDARDS = {
  initializationTime: '< 100ms',
  frameDrops: '< 5% at target FPS',
  memoryUsage: '< 50MB per instance',
  cpuUsage: '< 10% on modern devices',
  
  monitoring: {
    fps: 'Monitor and adjust quality dynamically',
    memory: 'Clean up WebGL resources properly',
    battery: 'Reduce intensity on low battery'
  }
}
```

### **3. Error Handling**
```typescript
const ERROR_HANDLING = {
  webglUnavailable: 'Graceful fallback to CSS animations',
  shaderCompilation: 'Display static gradient alternative',
  performanceIssues: 'Automatic quality reduction',
  
  fallbackStrategies: [
    'CSS gradient animations',
    'Static background images',
    'Simplified particle effects',
    'Solid color backgrounds'
  ]
}
```

## 📋 Quality Checklist

### **Pre-Implementation**
- [ ] Context appropriateness verified
- [ ] Performance impact assessed
- [ ] Accessibility requirements met
- [ ] Dark mode compatibility confirmed
- [ ] Mobile responsiveness tested

### **Post-Implementation**
- [ ] Visual hierarchy maintained
- [ ] Brand consistency preserved
- [ ] Loading performance optimized
- [ ] Cross-browser compatibility verified
- [ ] User preference respects (reduced motion)

### **Production Readiness**
- [ ] Error boundaries implemented
- [ ] Fallback strategies tested
- [ ] Performance monitoring active
- [ ] User feedback mechanism available
- [ ] Analytics integration complete

## 🚀 Future Extensions

### **Planned Features**
- **Seasonal Themes**: Automatic color palettes based on time/date
- **User Customization**: Save and share favorite Gloo configurations
- **AI-Driven Moods**: Automatic intensity based on content sentiment
- **Interactive Particles**: Mouse/touch interaction enhancements
- **Audio Visualization**: Sync with ambient audio when available

### **Studio Integration**
- **Design Token Export**: JSON/CSS custom property generation
- **Template Library**: Pre-configured Gloo patterns for common use cases
- **A/B Testing**: Built-in variation testing for optimization
- **Brand Guidelines**: Automatic brand compliance checking
- **Performance Budgets**: Configurable performance limits and warnings

---

## 📖 Implementation Examples

See the following files for practical implementations:
- `components/gloo/enhanced-gloo.tsx` - Full-featured component
- `components/gloo/rotating-gloo.tsx` - Color rotation system
- `app/(internetfriends)/components/hero-text.tsx` - Hero integration
- `app/(internetfriends)/components/custom-card.tsx` - Card integration
- `app/(internetfriends)/page.tsx` - Random system implementation

This design system ensures consistent, performant, and accessible Gloo implementations across all InternetFriends projects while maintaining visual excellence and brand consistency.