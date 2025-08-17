/**
 * Gloo UI/UX Alignment System
 * 
 * Provides consistent alignment patterns and positioning rules
 * for Gloo backgrounds across different UI contexts
 */

export interface GlooAlignmentConfig {
  context: 'hero' | 'card' | 'background' | 'accent' | 'logo' | 'error';
  positioning: 'fill' | 'center' | 'top' | 'bottom' | 'left' | 'right';
  overflow: 'hidden' | 'visible' | 'clip';
  blending: 'normal' | 'multiply' | 'screen' | 'overlay';
  zIndex: number;
  contentAlignment: 'center' | 'start' | 'end' | 'stretch';
}

// Core alignment configurations for each context
export const GLOO_ALIGNMENT_CONFIGS: Record<string, GlooAlignmentConfig> = {
  hero: {
    context: 'hero',
    positioning: 'fill',
    overflow: 'hidden',
    blending: 'normal',
    zIndex: 0,
    contentAlignment: 'center'
  },
  
  card: {
    context: 'card',
    positioning: 'fill',
    overflow: 'hidden',
    blending: 'multiply',
    zIndex: 0,
    contentAlignment: 'stretch'
  },
  
  background: {
    context: 'background',
    positioning: 'fill',
    overflow: 'hidden',
    blending: 'normal',
    zIndex: -1,
    contentAlignment: 'stretch'
  },
  
  accent: {
    context: 'accent',
    positioning: 'center',
    overflow: 'visible',
    blending: 'screen',
    zIndex: 1,
    contentAlignment: 'center'
  },
  
  logo: {
    context: 'logo',
    positioning: 'center',
    overflow: 'hidden',
    blending: 'overlay',
    zIndex: 0,
    contentAlignment: 'center'
  },
  
  error: {
    context: 'error',
    positioning: 'fill',
    overflow: 'hidden',
    blending: 'normal',
    zIndex: 0,
    contentAlignment: 'center'
  }
};

// CSS custom properties for consistent spacing and sizing
export const GLOO_CSS_VARIABLES = {
  // Container dimensions
  '--gloo-hero-height': '60vh',
  '--gloo-hero-min-height': '400px',
  '--gloo-card-height': '100%',
  '--gloo-accent-size': '200px',
  '--gloo-logo-size': '120px',
  
  // Positioning offsets
  '--gloo-content-padding': '2rem',
  '--gloo-safe-area-top': 'env(safe-area-inset-top)',
  '--gloo-safe-area-bottom': 'env(safe-area-inset-bottom)',
  
  // Z-index layers
  '--gloo-z-background': '-1',
  '--gloo-z-canvas': '0',
  '--gloo-z-content': '10',
  '--gloo-z-overlay': '20',
  '--gloo-z-controls': '30',
  
  // Blend modes and opacity
  '--gloo-opacity-subtle': '0.6',
  '--gloo-opacity-moderate': '0.8',
  '--gloo-opacity-bold': '1.0',
  
  // Border radius for container clipping
  '--gloo-border-radius': 'var(--radius, 8px)',
  '--gloo-border-radius-lg': 'var(--radius-lg, 12px)',
};

/**
 * Generate alignment styles for a given context
 */
export function generateGlooAlignment(context: string): string {
  const config = GLOO_ALIGNMENT_CONFIGS[context];
  if (!config) return '';
  
  return `
    position: relative;
    overflow: ${config.overflow};
    z-index: ${config.zIndex};
    display: flex;
    align-items: ${config.contentAlignment === 'center' ? 'center' : 
                   config.contentAlignment === 'start' ? 'flex-start' : 
                   config.contentAlignment === 'end' ? 'flex-end' : 'stretch'};
    justify-content: ${config.contentAlignment === 'center' ? 'center' : 
                       config.contentAlignment === 'start' ? 'flex-start' : 
                       config.contentAlignment === 'end' ? 'flex-end' : 'stretch'};
  `;
}

/**
 * Responsive breakpoint configurations
 */
export const GLOO_RESPONSIVE_RULES = {
  mobile: {
    maxWidth: '768px',
    heroHeight: '50vh',
    heroMinHeight: '300px',
    cardPadding: '1rem',
    reducedIntensity: 0.7
  },
  
  tablet: {
    minWidth: '769px',
    maxWidth: '1024px',
    heroHeight: '55vh',
    heroMinHeight: '350px',
    cardPadding: '1.5rem',
    standardIntensity: 1.0
  },
  
  desktop: {
    minWidth: '1025px',
    heroHeight: '60vh',
    heroMinHeight: '400px',
    cardPadding: '2rem',
    enhancedIntensity: 1.2
  }
};

/**
 * Content overlay patterns for different contexts
 */
export const GLOO_OVERLAY_PATTERNS = {
  hero: {
    gradient: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.1) 100%)',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
    backdropFilter: 'none'
  },
  
  card: {
    gradient: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
    backdropFilter: 'blur(1px)'
  },
  
  logo: {
    gradient: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
    textShadow: '0 0 8px rgba(0,0,0,0.4)',
    backdropFilter: 'blur(2px)'
  },
  
  error: {
    gradient: 'linear-gradient(45deg, rgba(239,68,68,0.1) 0%, transparent 100%)',
    textShadow: '0 2px 4px rgba(0,0,0,0.4)',
    backdropFilter: 'blur(1px)'
  }
};

/**
 * Animation timing and easing patterns
 */
export const GLOO_ANIMATION_PATTERNS = {
  entrance: {
    duration: '1s',
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    delay: '0.2s'
  },
  
  interaction: {
    duration: '0.3s',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    delay: '0s'
  },
  
  colorRotation: {
    duration: 'var(--gloo-rotation-duration, 60s)',
    easing: 'linear',
    iterationCount: 'infinite'
  },
  
  reducedMotion: {
    duration: '0.01s',
    easing: 'linear',
    delay: '0s'
  }
};

/**
 * Generate complete CSS class for Gloo container
 */
export function generateGlooContainerClass(
  context: string,
  responsive: boolean = true,
  customProps: Record<string, string> = {}
): string {
  const config = GLOO_ALIGNMENT_CONFIGS[context];
  const overlayPattern = GLOO_OVERLAY_PATTERNS[context];
  
  const baseStyles = `
    .gloo-container-${context} {
      ${generateGlooAlignment(context)}
      
      /* Canvas positioning */
      .gloo-canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: ${config?.zIndex || 0};
        mix-blend-mode: ${config?.blending || 'normal'};
      }
      
      /* Content overlay */
      .gloo-content {
        position: relative;
        z-index: 10;
        width: 100%;
        height: 100%;
        padding: var(--gloo-content-padding);
        ${overlayPattern ? `background: ${overlayPattern.gradient};` : ''}
        ${overlayPattern ? `text-shadow: ${overlayPattern.textShadow};` : ''}
        ${overlayPattern ? `backdrop-filter: ${overlayPattern.backdropFilter};` : ''}
      }
      
      /* Custom properties */
      ${Object.entries(customProps).map(([key, value]) => `${key}: ${value};`).join('\n      ')}
    }
  `;
  
  const responsiveStyles = responsive ? `
    /* Mobile optimization */
    @media (max-width: ${GLOO_RESPONSIVE_RULES.mobile.maxWidth}) {
      .gloo-container-${context} {
        --gloo-content-padding: ${GLOO_RESPONSIVE_RULES.mobile.cardPadding};
        
        .gloo-canvas {
          transform: scale(${GLOO_RESPONSIVE_RULES.mobile.reducedIntensity});
          transform-origin: center;
        }
      }
    }
    
    /* Desktop enhancement */
    @media (min-width: ${GLOO_RESPONSIVE_RULES.desktop.minWidth}) {
      .gloo-container-${context} {
        --gloo-content-padding: ${GLOO_RESPONSIVE_RULES.desktop.cardPadding};
        
        .gloo-canvas {
          transform: scale(${GLOO_RESPONSIVE_RULES.desktop.enhancedIntensity});
          transform-origin: center;
        }
      }
    }
  ` : '';
  
  return baseStyles + responsiveStyles;
}

/**
 * Accessibility and reduced motion handling
 */
export const GLOO_A11Y_PATTERNS = {
  reducedMotion: `
    @media (prefers-reduced-motion: reduce) {
      .gloo-container * {
        animation-duration: 0.01s !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01s !important;
      }
      
      .gloo-canvas {
        opacity: 0.3;
        filter: blur(2px);
      }
    }
  `,
  
  highContrast: `
    @media (prefers-contrast: high) {
      .gloo-container .gloo-content {
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(4px);
      }
    }
  `,
  
  screenReader: `
    .gloo-canvas {
      aria-hidden: true;
    }
    
    .gloo-container::before {
      content: "";
      position: absolute;
      left: -9999px;
      speak: none;
    }
  `
};

export default {
  GLOO_ALIGNMENT_CONFIGS,
  GLOO_CSS_VARIABLES,
  GLOO_RESPONSIVE_RULES,
  GLOO_OVERLAY_PATTERNS,
  GLOO_ANIMATION_PATTERNS,
  GLOO_A11Y_PATTERNS,
  generateGlooAlignment,
  generateGlooContainerClass
};