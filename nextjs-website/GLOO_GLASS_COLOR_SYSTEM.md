# InternetFriends - Glass Morphism + Gloo Color System

## Core Brand Blues (from your existing system)
```css
--if-primary: #3b82f6          /* Core brand blue */
--if-primary-hover: #2563eb    /* Darker on hover */
--if-primary-light: #60a5fa    /* Light variant */
--if-primary-dark: #1d4ed8     /* Dark variant */
```

## Enhanced Glass Border System
```css
/* LIGHT MODE - Blue-tinted borders for visibility */
--glass-border-visible: rgba(59, 130, 246, 0.25)      /* Strong blue borders */
--glass-border-medium: rgba(59, 130, 246, 0.15)       /* Medium blue borders */
--glass-border-subtle: rgba(59, 130, 246, 0.08)       /* Subtle blue borders */
--glass-border-accent: rgba(59, 130, 246, 0.35)       /* Accent/hover borders */

/* DARK MODE - Lighter blue for contrast */
--glass-border-dark-visible: rgba(96, 165, 250, 0.3)  /* Strong light blue */
--glass-border-dark-medium: rgba(96, 165, 250, 0.18)  /* Medium light blue */
--glass-border-dark-subtle: rgba(96, 165, 250, 0.1)   /* Subtle light blue */
--glass-border-dark-accent: rgba(96, 165, 250, 0.4)   /* Accent/hover */
```

## Container Backgrounds (Gloo-Compatible)
```css
/* Containers without Gloo - Light blue tints */
--container-glass-light: rgba(59, 130, 246, 0.03)     /* Barely visible */
--container-glass-medium: rgba(59, 130, 246, 0.05)    /* Light tint */
--container-glass-strong: rgba(59, 130, 246, 0.08)    /* Noticeable tint */

/* Containers with Gloo - Complementary backgrounds */
--container-gloo-overlay: rgba(255, 255, 255, 0.05)   /* White overlay on Gloo */
--container-gloo-blue: rgba(59, 130, 246, 0.12)       /* Blue overlay on Gloo */
--container-gloo-accent: rgba(59, 130, 246, 0.18)     /* Strong blue on Gloo */

/* Dark mode variants */
--container-dark-glass: rgba(96, 165, 250, 0.04)      /* Dark mode container */
--container-dark-gloo: rgba(255, 255, 255, 0.03)      /* Dark mode on Gloo */
```

## Blur + Backdrop Filter Combinations
```css
/* Standard glass blur levels */
--blur-light: blur(12px) saturate(110%)               /* Light glass */
--blur-medium: blur(18px) saturate(120%)              /* Medium glass */
--blur-heavy: blur(24px) saturate(130%)               /* Heavy glass */

/* Gloo-specific blur (less saturation to not compete) */
--blur-gloo-light: blur(8px) saturate(105%)           /* Over Gloo */
--blur-gloo-medium: blur(14px) saturate(110%)         /* Over Gloo */
--blur-gloo-heavy: blur(20px) saturate(115%)          /* Over Gloo */
```

## Shadow System (Blue-tinted for brand cohesion)
```css
/* Light mode shadows */
--shadow-glass-1: 0 2px 12px rgba(59, 130, 246, 0.08)
--shadow-glass-2: 0 4px 20px rgba(59, 130, 246, 0.12) 
--shadow-glass-3: 0 8px 32px rgba(59, 130, 246, 0.16)
--shadow-glass-glow: 0 0 24px rgba(59, 130, 246, 0.2)

/* Dark mode shadows (brighter blue) */
--shadow-dark-1: 0 2px 12px rgba(96, 165, 250, 0.15)
--shadow-dark-2: 0 4px 20px rgba(96, 165, 250, 0.2)
--shadow-dark-3: 0 8px 32px rgba(96, 165, 250, 0.25)
--shadow-dark-glow: 0 0 32px rgba(96, 165, 250, 0.3)
```

## Component-Specific Applications

### Headers (Sticky with scroll effects)
```css
.header-default {
  background: var(--container-glass-light);
  border: 1px solid var(--glass-border-subtle);
  backdrop-filter: var(--blur-light);
}

.header-scrolled {
  background: var(--container-glass-medium);
  border: 1px solid var(--glass-border-medium);
  backdrop-filter: var(--blur-medium);
  box-shadow: var(--shadow-glass-2);
}
```

### Cards (With and without Gloo)
```css
.card-no-gloo {
  background: var(--container-glass-medium);
  border: 1px solid var(--glass-border-visible);
  backdrop-filter: var(--blur-medium);
  box-shadow: var(--shadow-glass-1);
}

.card-with-gloo {
  background: var(--container-gloo-overlay);
  border: 1px solid var(--glass-border-accent);
  backdrop-filter: var(--blur-gloo-medium);
  box-shadow: var(--shadow-glass-2);
}
```

### Navigation Elements
```css
.nav-glass {
  background: var(--container-glass-light);
  border: 1px solid var(--glass-border-medium);
  backdrop-filter: var(--blur-light);
}

.nav-glass:hover {
  background: var(--container-glass-strong);
  border-color: var(--glass-border-accent);
  box-shadow: var(--shadow-glass-glow);
}
```

## Gloo Opacity Guidelines
```css
/* Gloo background opacity levels */
--gloo-subtle: 0.3        /* Background accent */
--gloo-medium: 0.5        /* Noticeable effect */
--gloo-strong: 0.7        /* Prominent effect */
--gloo-hero: 0.8          /* Hero sections */

/* Text contrast on Gloo */
--text-on-gloo-light: rgba(255, 255, 255, 0.95)
--text-on-gloo-medium: rgba(255, 255, 255, 0.85)
--text-shadow-gloo: 0 2px 4px rgba(0, 0, 0, 0.3)
```

## Usage Patterns

### 1. Clean Glass (No Gloo)
- Use blue-tinted borders and backgrounds
- Higher saturation in backdrop-filter
- Blue-tinted shadows for brand cohesion

### 2. Glass + Gloo Combination
- Reduce backdrop-filter saturation
- Use white/transparent overlays on Gloo
- Stronger borders for definition
- Higher text contrast

### 3. Dark Mode Adaptations
- Switch to lighter blue variants
- Increase shadow opacity
- Maintain brand blue but with higher luminance