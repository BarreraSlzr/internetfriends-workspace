/* InternetFriends Theme Initialization System */
/* SSR-safe theme setup with accent persistence and hydration alignment */

import { initAccent, debugAccentSystem, type AccentMetrics } from './accent_engine';
import { bindLogoAccentCycle, getCurrentAccentPreset, debugAccentCycling } from './accent_cycle';

// =================================================================
// THEME INITIALIZATION STATE
// =================================================================

interface ThemeInitState {
  isInitialized: boolean;
  isHydrated: boolean;
  initStartTime: number;
  accentMetrics: AccentMetrics | null;
  errors: string[];
}

let themeState: ThemeInitState = {
  isInitialized: false,
  isHydrated: false,
  initStartTime: 0,
  accentMetrics: null,
  errors: []
};

// =================================================================
// SSR-SAFE INITIALIZATION
// =================================================================

/**
 * Generate inline CSS for initial accent to prevent FOUC
 * This should be called during SSR to inline critical accent styles
 * @param accentHex - Accent color hex (from cookie or default)
 * @returns CSS string for <style> tag injection
 */
export function generateInlineAccentCSS(accentHex: string = '#3b82f6'): string {
  // This is a simplified version that only includes critical accent variables
  // The full accent system will initialize on the client

  const cssVars = `
    :root {
      --accent-color-primary: ${accentHex};
      --accent-data-hint: "${accentHex}";
    }

    /* Critical accent styles to prevent flash */
    [data-accent-loading] {
      opacity: 0.95;
      transition: opacity 0.2s ease;
    }

    [data-accent-ready] {
      opacity: 1;
    }
  `;

  return cssVars.replace(/\s+/g, ' ').trim();
}

/**
 * Early theme initialization (before React hydration)
 * Should be called in a <script> tag in document <head>
 */
export function earlyThemeInit(): void {
  if (typeof window === 'undefined') return;

  try {
    // Set loading state
    document.documentElement.setAttribute('data-accent-loading', 'true');

    // Try to get saved accent from localStorage
    let savedAccent = '#3b82f6'; // default
    try {
      savedAccent = localStorage.getItem('if-accent-color') || '#3b82f6';
    } catch (e) {
      // localStorage access failed, use default
    }

    // Set initial data attribute to prevent mismatch with SSR
    document.documentElement.setAttribute('data-accent', savedAccent);

    // Mark as ready for CSS transitions
    setTimeout(() => {
      document.documentElement.setAttribute('data-accent-ready', 'true');
      document.documentElement.removeAttribute('data-accent-loading');
    }, 50);

  } catch (error) {
    console.warn('Early theme init failed:', error);
  }
}

/**
 * Get script content for inline execution in <head>
 * This returns the JavaScript code as a string to be injected
 */
export function getEarlyInitScript(): string {
  return `
    (function() {
      if (typeof window === 'undefined') return;

      try {
        document.documentElement.setAttribute('data-accent-loading', 'true');

        var savedAccent = '#3b82f6';
        try {
          savedAccent = localStorage.getItem('if-accent-color') || '#3b82f6';
        } catch (e) {}

        document.documentElement.setAttribute('data-accent', savedAccent);

        setTimeout(function() {
          document.documentElement.setAttribute('data-accent-ready', 'true');
          document.documentElement.removeAttribute('data-accent-loading');
        }, 50);

      } catch (error) {
        console.warn('Early theme init failed:', error);
      }
    })();
  `;
}

// =================================================================
// CLIENT-SIDE THEME INITIALIZATION
// =================================================================

/**
 * Full theme initialization (client-side after hydration)
 * This should be called in useEffect or after component mount
 * @param options - Initialization options
 */
export interface ThemeInitOptions {
  enableAccentCycling?: boolean;
  logoSelector?: string;
  debugMode?: boolean;
  onInitComplete?: (metrics: AccentMetrics) => void;
  onError?: (error: string) => void;
}

const DEFAULT_INIT_OPTIONS: Required<ThemeInitOptions> = {
  enableAccentCycling: true,
  logoSelector: '[href="/"], .logo, [data-logo]',
  debugMode: process.env.NODE_ENV === 'development',
  onInitComplete: () => {},
  onError: () => {}
};

/**
 * Initialize the complete theme system
 * @param options - Configuration options
 * @returns Promise that resolves when initialization is complete
 */
export async function initThemeSystem(options: Partial<ThemeInitOptions> = {}): Promise<AccentMetrics> {
  const config = { ...DEFAULT_INIT_OPTIONS, ...options };

  if (themeState.isInitialized) {
    config.onInitComplete(themeState.accentMetrics!);
    return themeState.accentMetrics!;
  }

  themeState.initStartTime = performance.now();
  themeState.errors = [];

  try {
    // Step 1: Initialize accent system
    if (config.debugMode) {
      console.log('🎨 Initializing InternetFriends theme system...');
    }

    const accentMetrics = initAccent();
    themeState.accentMetrics = accentMetrics;

    // Step 2: Set up accent cycling if enabled
    if (config.enableAccentCycling) {
      bindLogoAccentCycle({
        selector: config.logoSelector,
        enableKeyboard: true,
        enableTooltip: !config.debugMode, // No tooltip in debug mode to avoid console noise
        debugMode: config.debugMode
      });
    }

    // Step 3: Set up theme change listeners
    setupThemeChangeListeners(config);

    // Step 4: Mark as initialized
    themeState.isInitialized = true;
    themeState.isHydrated = true;

    // Step 5: Clean up loading states
    document.documentElement.removeAttribute('data-accent-loading');
    document.documentElement.setAttribute('data-theme-ready', 'true');

    const initTime = performance.now() - themeState.initStartTime;

    if (config.debugMode) {
      console.log(`✅ Theme system initialized in ${Math.round(initTime)}ms`);
      debugAccentSystem();
      debugAccentCycling();
    }

    // Notify completion
    config.onInitComplete(accentMetrics);

    return accentMetrics;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    themeState.errors.push(errorMessage);

    console.error('❌ Theme system initialization failed:', error);
    config.onError(errorMessage);

    // Return fallback metrics
    const fallbackMetrics: AccentMetrics = {
      baseHue: 217,
      baseSaturation: 89,
      baseLightness: 60,
      contrastRatio: 0,
      accessibility: 'FAIL',
      generationTime: performance.now() - themeState.initStartTime
    };

    themeState.accentMetrics = fallbackMetrics;
    return fallbackMetrics;
  }
}

/**
 * Set up theme change event listeners
 * @param config - Configuration options
 */
function setupThemeChangeListeners(config: Required<ThemeInitOptions>): void {
  // Listen for accent changes
  window.addEventListener('accentChange', (event) => {
    const detail = (event as CustomEvent).detail;

    if (config.debugMode) {
      console.log('🎨 Accent change detected:', detail);
    }

    // Update metrics
    themeState.accentMetrics = detail.metrics;

    // Dispatch to other parts of the app
    window.dispatchEvent(new CustomEvent('themeUpdate', {
      detail: {
        type: 'accent',
        accent: detail.preset,
        metrics: detail.metrics
      }
    }));
  });

  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', (e) => {
    if (config.debugMode) {
      console.log('🌙 System theme changed to:', e.matches ? 'dark' : 'light');
    }

    // Future: Handle automatic dark mode switching
    window.dispatchEvent(new CustomEvent('themeUpdate', {
      detail: {
        type: 'system',
        darkMode: e.matches
      }
    }));
  });
}

// =================================================================
// THEME STATE MANAGEMENT
// =================================================================

/**
 * Check if theme system is initialized
 * @returns Initialization status
 */
export function isThemeInitialized(): boolean {
  return themeState.isInitialized;
}

/**
 * Check if theme system is hydrated (client-side ready)
 * @returns Hydration status
 */
export function isThemeHydrated(): boolean {
  return themeState.isHydrated;
}

/**
 * Get current theme state
 * @returns Complete theme state object
 */
export function getThemeState(): Readonly<ThemeInitState> {
  return { ...themeState };
}

/**
 * Reset theme system (useful for testing or re-initialization)
 */
export function resetThemeSystem(): void {
  themeState = {
    isInitialized: false,
    isHydrated: false,
    initStartTime: 0,
    accentMetrics: null,
    errors: []
  };

  // Clean up DOM attributes
  if (typeof document !== 'undefined') {
    document.documentElement.removeAttribute('data-theme-ready');
    document.documentElement.removeAttribute('data-accent-ready');
    document.documentElement.removeAttribute('data-accent-loading');
  }
}

// =================================================================
// REACT HOOKS INTEGRATION
// =================================================================

/**
 * React hook for theme initialization
 * This should be used in the root layout or app component
 * @param options - Initialization options
 * @returns Theme state and utilities
 */
export function useThemeInit(options: Partial<ThemeInitOptions> = {}) {
  // This is the hook interface - implementation would be in a separate React file
  // Returning the interface that components can expect
  return {
    isInitialized: themeState.isInitialized,
    isHydrated: themeState.isHydrated,
    accentMetrics: themeState.accentMetrics,
    errors: themeState.errors,
    currentPreset: getCurrentAccentPreset(),

    // Methods
    reinitialize: () => initThemeSystem(options),
    reset: resetThemeSystem
  };
}

// =================================================================
// UTILITY FUNCTIONS
// =================================================================

/**
 * Wait for theme system to be ready
 * @param timeout - Maximum time to wait in milliseconds
 * @returns Promise that resolves when theme is ready
 */
export function waitForThemeReady(timeout: number = 5000): Promise<AccentMetrics> {
  return new Promise((resolve, reject) => {
    if (themeState.isInitialized && themeState.accentMetrics) {
      resolve(themeState.accentMetrics);
      return;
    }

    const startTime = Date.now();
    const checkReady = () => {
      if (themeState.isInitialized && themeState.accentMetrics) {
        resolve(themeState.accentMetrics);
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Theme system initialization timeout'));
      } else {
        setTimeout(checkReady, 50);
      }
    };

    checkReady();
  });
}

/**
 * Get theme performance metrics
 * @returns Performance data
 */
export function getThemePerformanceMetrics() {
  return {
    initializationTime: themeState.initStartTime > 0 ?
      (performance.now() - themeState.initStartTime) : null,
    accentGenerationTime: themeState.accentMetrics?.generationTime || null,
    isInitialized: themeState.isInitialized,
    isHydrated: themeState.isHydrated,
    errorCount: themeState.errors.length
  };
}

// =================================================================
// DEVELOPMENT & DEBUGGING
// =================================================================

/**
 * Development-only theme debugging utilities
 */
export const ThemeDebug = {
  /**
   * Log complete theme system state
   */
  logState(): void {
    console.group('🎨 Theme System State');
    console.log('Initialization:', themeState);
    console.log('Performance:', getThemePerformanceMetrics());
    console.log('DOM State:', {
      accentReady: document.documentElement.hasAttribute('data-accent-ready'),
      themeReady: document.documentElement.hasAttribute('data-theme-ready'),
      currentAccent: document.documentElement.getAttribute('data-accent')
    });
    console.groupEnd();
  },

  /**
   * Force re-initialization (development only)
   */
  async forceReinit(options?: Partial<ThemeInitOptions>): Promise<AccentMetrics> {
    console.warn('🔄 Force re-initializing theme system...');
    resetThemeSystem();
    return await initThemeSystem(options);
  },

  /**
   * Test accent cycling
   */
  testCycling(): void {
    console.log('🔄 Testing accent cycling...');
    debugAccentCycling();
  }
};

// Make debug utilities available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).ThemeDebug = ThemeDebug;
}
