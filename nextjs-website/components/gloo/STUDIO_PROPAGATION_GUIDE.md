# Studio Propagation Guide: Gloo Design System

## 🎯 Quick Start for Studios & Agencies

This guide enables design studios and agencies to implement the Gloo WebGL background system consistently across multiple projects with minimal technical overhead.

## 📋 Implementation Checklist

### **Phase 1: Setup (5 minutes)**
- [ ] Copy `/components/gloo/` folder to your project
- [ ] Install dependencies: `bun add framer-motion react-intersection-observer`
- [ ] Add CSS variables to your `globals.css` (see Variables section)
- [ ] Test basic implementation with `<BgGooRotating />`

### **Phase 2: Integration (15 minutes)**
- [ ] Choose contexts: Hero, Cards, Backgrounds, Accents, Errors
- [ ] Set randomization strategy (static vs dynamic)
- [ ] Configure color rotation presets
- [ ] Test responsive behavior on mobile/tablet/desktop

### **Phase 3: Customization (10 minutes)**
- [ ] Define brand-specific color palettes
- [ ] Set performance budgets for target devices
- [ ] Customize animation timing for brand personality
- [ ] Configure accessibility settings

## 🎨 Brand Integration Templates

### **Corporate/Professional**
```typescript
const corporateConfig = {
  contexts: ['hero', 'background'],
  intensity: 'subtle',
  colorRotation: 'static',
  brandColors: [
    [0.23, 0.51, 0.96], // Brand blue
    [0.15, 0.35, 0.75], // Dark blue
    [0.90, 0.90, 0.95]  // Light accent
  ],
  speed: 0.1,
  showControls: false
}
```

### **Creative/Artistic**
```typescript
const creativeConfig = {
  contexts: ['hero', 'card', 'accent'],
  intensity: 'bold',
  colorRotation: 'dynamic',
  brandColors: 'random', // Use getRandomColors()
  speed: 0.4,
  showControls: true
}
```

### **Tech Startup**
```typescript
const startupConfig = {
  contexts: ['hero', 'card'],
  intensity: 'moderate',
  colorRotation: 'normal',
  brandColors: [
    [0.0, 0.8, 1.0],   // Cyan
    [0.6, 0.0, 1.0],   // Purple
    [1.0, 0.3, 0.0]    // Orange
  ],
  speed: 0.3,
  randomization: true
}
```

## 🔧 Copy-Paste Components

### **Hero Section with Gloo**
```tsx
import { BgGooRotating } from '@/components/gloo/rotating-gloo'

export function HeroWithGloo({ 
  title, 
  subtitle, 
  colorRotation = 'normal' 
}) {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <BgGooRotating
          speed={0.3}
          colorRotation={colorRotation}
          context="hero"
          showControls={false}
        />
      </div>
      
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <h1 className="text-6xl font-bold text-white mb-6">{title}</h1>
        <p className="text-xl text-white/80">{subtitle}</p>
      </div>
    </section>
  )
}
```

### **Card with Subtle Gloo**
```tsx
import { CustomCard } from '@/components/custom-card'

export function GlooCard({ 
  title, 
  description, 
  useGloo = true 
}) {
  return (
    <CustomCard
      title={title}
      description={description}
      useGloo={useGloo}
      colorRotation="subtle"
      glooIntensity={0.08}
      className="bg-white/10 backdrop-blur-sm"
    />
  )
}
```

### **Error Page with Dramatic Gloo**
```tsx
import { BgGooRotating } from '@/components/gloo/rotating-gloo'

export function ErrorPage({ errorCode = "404" }) {
  const errorColors = [
    [0.9, 0.3, 0.3], // Red
    [0.7, 0.2, 0.2], // Dark red
    [0.95, 0.4, 0.2] // Orange
  ]

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <div className="absolute inset-0 z-0">
        <BgGooRotating
          speed={0.1}
          color1={errorColors[0]}
          color2={errorColors[1]}
          color3={errorColors[2]}
          colorRotation="static"
          context="error"
        />
      </div>
      
      <div className="relative z-10 text-center">
        <h1 className="text-9xl font-bold text-white/20">{errorCode}</h1>
        <h2 className="text-3xl font-bold text-white mt-4">Something went wrong</h2>
      </div>
    </div>
  )
}
```

## 🎛️ Configuration Presets

### **Performance Levels**
```typescript
export const PERFORMANCE_PRESETS = {
  // High-end devices, desktop
  premium: {
    maxFPS: 60,
    resolution: 2.5,
    depth: 4,
    enableMultiple: true
  },
  
  // Standard devices, tablets
  standard: {
    maxFPS: 45,
    resolution: 2.0,
    depth: 3,
    enableMultiple: true
  },
  
  // Budget devices, mobile
  optimized: {
    maxFPS: 30,
    resolution: 1.5,
    depth: 2,
    enableMultiple: false
  }
}
```

### **Brand Personality Presets**
```typescript
export const PERSONALITY_PRESETS = {
  elegant: {
    speed: 0.1,
    colorRotation: 'static',
    intensity: 'subtle',
    colors: 'monochrome'
  },
  
  energetic: {
    speed: 0.5,
    colorRotation: 'dynamic',
    intensity: 'bold',
    colors: 'vibrant'
  },
  
  professional: {
    speed: 0.2,
    colorRotation: 'subtle',
    intensity: 'moderate',
    colors: 'brand-aligned'
  },
  
  playful: {
    speed: 0.4,
    colorRotation: 'normal',
    intensity: 'bold',
    colors: 'random'
  }
}
```

## 📱 Responsive Implementation

### **CSS Variables for Consistency**
```css
/* Add to your globals.css */
:root {
  /* Gloo spacing and sizing */
  --gloo-hero-height: 60vh;
  --gloo-hero-min-height: 400px;
  --gloo-card-opacity: 0.08;
  --gloo-content-padding: 2rem;
  
  /* Color rotation timing */
  --gloo-rotation-subtle: 120min;
  --gloo-rotation-normal: 60min;
  --gloo-rotation-dynamic: 30min;
  
  /* Performance controls */
  --gloo-fps-target: 60;
  --gloo-quality-modifier: 1.0;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  :root {
    --gloo-hero-height: 50vh;
    --gloo-hero-min-height: 300px;
    --gloo-card-opacity: 0.05;
    --gloo-fps-target: 30;
    --gloo-quality-modifier: 0.7;
  }
}
```

### **Responsive Gloo Hook**
```typescript
import { useState, useEffect } from 'react'

export function useResponsiveGloo() {
  const [config, setConfig] = useState({
    enabled: true,
    intensity: 1.0,
    maxFPS: 60
  })

  useEffect(() => {
    const updateConfig = () => {
      const width = window.innerWidth
      
      if (width < 768) {
        setConfig({
          enabled: true,
          intensity: 0.7,
          maxFPS: 30
        })
      } else if (width < 1024) {
        setConfig({
          enabled: true,
          intensity: 0.9,
          maxFPS: 45
        })
      } else {
        setConfig({
          enabled: true,
          intensity: 1.0,
          maxFPS: 60
        })
      }
    }

    updateConfig()
    window.addEventListener('resize', updateConfig)
    return () => window.removeEventListener('resize', updateConfig)
  }, [])

  return config
}
```

## 🎨 Color Palette Generator

### **Brand Color Extractor**
```typescript
export function generateBrandPalette(
  brandHex: string, 
  count: number = 3
): number[][] {
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? [
      parseInt(result[1], 16) / 255,
      parseInt(result[2], 16) / 255,
      parseInt(result[3], 16) / 255
    ] : [0.5, 0.5, 0.5]
  }

  const baseColor = hexToRgb(brandHex)
  const palette: number[][] = [baseColor]

  // Generate harmonious variations
  for (let i = 1; i < count; i++) {
    const hueShift = (i * 30) % 360 // 30-degree shifts
    const rotatedColor = rotateHue(baseColor, hueShift)
    palette.push(rotatedColor)
  }

  return palette
}
```

## 🚀 Deployment Checklist

### **Pre-Launch**
- [ ] Test on target devices (mobile, tablet, desktop)
- [ ] Verify accessibility (reduced motion, high contrast)
- [ ] Check performance metrics (FPS, memory usage)
- [ ] Validate color contrast ratios
- [ ] Test error states and fallbacks

### **Performance Monitoring**
```typescript
// Add to your analytics
export function trackGlooPerformance() {
  if (typeof window !== 'undefined') {
    // Monitor FPS
    let lastTime = performance.now()
    let frames = 0
    
    function measureFPS() {
      frames++
      const now = performance.now()
      
      if (now - lastTime >= 1000) {
        const fps = Math.round((frames * 1000) / (now - lastTime))
        
        // Send to analytics
        analytics.track('gloo_performance', {
          fps,
          device: navigator.userAgent,
          resolution: `${window.innerWidth}x${window.innerHeight}`
        })
        
        frames = 0
        lastTime = now
      }
      
      requestAnimationFrame(measureFPS)
    }
    
    measureFPS()
  }
}
```

## 🎯 Studio Success Metrics

### **Visual Quality KPIs**
- **Brand Consistency**: 95%+ brand color accuracy
- **Visual Impact**: User engagement increase of 20%+
- **Accessibility**: 100% WCAG compliance
- **Performance**: 60 FPS on target devices

### **Client Satisfaction**
- **Setup Time**: < 30 minutes for full implementation
- **Customization Ease**: Non-technical team members can adjust
- **Maintenance**: Zero ongoing maintenance required
- **Scalability**: Works across multiple projects

### **Technical Reliability**
- **Error Rate**: < 0.1% WebGL initialization failures
- **Cross-Browser**: 99%+ compatibility (Chrome, Firefox, Safari, Edge)
- **Mobile Performance**: 30+ FPS on mid-range devices
- **Load Time**: < 100ms initialization time

---

## 💡 Pro Tips for Studios

1. **Start Simple**: Begin with hero sections only, expand gradually
2. **Brand First**: Always align color palettes with brand guidelines
3. **Performance Budget**: Set clear FPS targets before implementation
4. **Client Education**: Show clients the controls for buy-in
5. **Fallback Strategy**: Always have CSS alternatives ready
6. **A/B Testing**: Test with/without Gloo for impact measurement

This system is designed to be **studio-friendly**, requiring minimal technical expertise while delivering maximum visual impact. The randomization features ensure each project feels unique while maintaining brand consistency.

**Need Help?** Check `GLOO_DESIGN_SYSTEM.md` for detailed technical documentation or `COLOR_ROTATION_GUIDE.md` for color system specifics.