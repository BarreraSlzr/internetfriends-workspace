/* InternetFriends Accent Cycling System */
/* Logo click interaction for dynamic accent switching */

import { changeAccent, previewAccentScale, type AccentMetrics } from './accent_engine';

// =================================================================
// CURATED ACCENT PALETTE
// =================================================================

export interface AccentPreset {
  name: string;
  hex: string;
  description: string;
  category: 'brand' | 'nature' | 'vibrant' | 'professional';
}

export const ACCENT_PRESETS: AccentPreset[] = [
  // Brand & Professional
  {
    name: 'InternetFriends Blue',
    hex: '#3b82f6',
    description: 'Original brand blue - trustworthy and modern',
    category: 'brand'
  },
  {
    name: 'Royal Purple',
    hex: '#6366f1',
    description: 'Creative and innovative - perfect for design work',
    category: 'professional'
  },
  {
    name: 'Elegant Violet',
    hex: '#8b5cf6',
    description: 'Sophisticated and artistic',
    category: 'professional'
  },

  // Nature Inspired
  {
    name: 'Forest Green',
    hex: '#10b981',
    description: 'Fresh and natural - growth and sustainability',
    category: 'nature'
  },
  {
    name: 'Ocean Teal',
    hex: '#0ea5e9',
    description: 'Calm and reliable - like ocean depths',
    category: 'nature'
  },

  // Vibrant & Energetic
  {
    name: 'Sunset Orange',
    hex: '#f97316',
    description: 'Energetic and warm - perfect for creativity',
    category: 'vibrant'
  },
  {
    name: 'Magenta Pink',
    hex: '#ec4899',
    description: 'Bold and expressive - stands out beautifully',
    category: 'vibrant'
  },

  // Professional Alternatives
  {
    name: 'Slate Blue',
    hex: '#475569',
    description: 'Professional and subtle - great for focus',
    category: 'professional'
  }
];

// =================================================================
// CYCLING STATE MANAGEMENT
// =================================================================

interface CyclingState {
  currentIndex: number;
  isAnimating: boolean;
  lastChangeTime: number;
  cycleDirection: 'forward' | 'backward';
}

const cyclingState: CyclingState = {
  currentIndex: 0,
  isAnimating: false,
  lastChangeTime: 0,
  cycleDirection: 'forward'
};

// =================================================================
// CYCLING LOGIC
// =================================================================

/**
 * Get current accent preset index
 * @returns Current index in the ACCENT_PRESETS array
 */
export function getCurrentAccentIndex(): number {
  if (typeof window === 'undefined') return 0;

  const currentAccent = document.documentElement.getAttribute('data-accent');
  if (!currentAccent) return 0;

  const index = ACCENT_PRESETS.findIndex(preset =>
    preset.hex.toLowerCase() === currentAccent.toLowerCase()
  );

  return index >= 0 ? index : 0;
}

/**
 * Cycle to next accent color
 * @param direction - Direction to cycle ('forward' or 'backward')
 * @returns New accent metrics and preset info
 */
export function cycleAccent(direction: 'forward' | 'backward' = 'forward'): {
  preset: AccentPreset;
  metrics: AccentMetrics;
  index: number;
} {
  // Prevent rapid cycling (debounce)
  const now = Date.now();
  if (now - cyclingState.lastChangeTime < 300) {
    const currentIndex = getCurrentAccentIndex();
    return {
      preset: ACCENT_PRESETS[currentIndex],
      metrics: {} as AccentMetrics,
      index: currentIndex
    };
  }

  cyclingState.lastChangeTime = now;
  cyclingState.cycleDirection = direction;

  // Calculate next index
  const currentIndex = getCurrentAccentIndex();
  let nextIndex: number;

  if (direction === 'forward') {
    nextIndex = (currentIndex + 1) % ACCENT_PRESETS.length;
  } else {
    nextIndex = currentIndex === 0 ? ACCENT_PRESETS.length - 1 : currentIndex - 1;
  }

  // Apply the new accent
  const nextPreset = ACCENT_PRESETS[nextIndex];
  const metrics = changeAccent(nextPreset.hex);

  cyclingState.currentIndex = nextIndex;

  return {
    preset: nextPreset,
    metrics,
    index: nextIndex
  };
}

/**
 * Jump to specific accent by index
 * @param index - Index in ACCENT_PRESETS array
 * @returns Accent info or null if invalid index
 */
export function jumpToAccent(index: number): {
  preset: AccentPreset;
  metrics: AccentMetrics;
  index: number;
} | null {
  if (index < 0 || index >= ACCENT_PRESETS.length) {
    console.warn(`Invalid accent index: ${index}`);
    return null;
  }

  const preset = ACCENT_PRESETS[index];
  const metrics = changeAccent(preset.hex);

  cyclingState.currentIndex = index;
  cyclingState.lastChangeTime = Date.now();

  return { preset, metrics, index };
}

/**
 * Jump to specific accent by name
 * @param name - Preset name to find
 * @returns Accent info or null if not found
 */
export function jumpToAccentByName(name: string): {
  preset: AccentPreset;
  metrics: AccentMetrics;
  index: number;
} | null {
  const index = ACCENT_PRESETS.findIndex(preset =>
    preset.name.toLowerCase() === name.toLowerCase()
  );

  return index >= 0 ? jumpToAccent(index) : null;
}

// =================================================================
// LOGO INTERACTION BINDING
// =================================================================

export interface LogoInteractionOptions {
  selector: string;
  enableKeyboard?: boolean;
  enableTooltip?: boolean;
  animationDuration?: number;
  debugMode?: boolean;
}

const DEFAULT_OPTIONS: Required<LogoInteractionOptions> = {
  selector: '[href="/"], .logo, [data-logo]',
  enableKeyboard: true,
  enableTooltip: true,
  animationDuration: 200,
  debugMode: false
};

let boundElements: Element[] = [];
let tooltipElement: HTMLElement | null = null;

/**
 * Create and show accent preview tooltip
 * @param element - Element to attach tooltip to
 * @param preset - Accent preset to preview
 */
function showAccentTooltip(element: Element, preset: AccentPreset): void {
  // Remove existing tooltip
  hideAccentTooltip();

  // Create tooltip
  tooltipElement = document.createElement('div');
  tooltipElement.className = 'accent-tooltip';
  tooltipElement.innerHTML = `
    <div class="accent-tooltip-content">
      <div class="accent-tooltip-color" style="background: ${preset.hex}"></div>
      <div class="accent-tooltip-text">
        <div class="accent-tooltip-name">${preset.name}</div>
        <div class="accent-tooltip-description">${preset.description}</div>
      </div>
    </div>
  `;

  // Add tooltip styles
  Object.assign(tooltipElement.style, {
    position: 'absolute',
    zIndex: '9999',
    pointerEvents: 'none',
    opacity: '0',
    transform: 'translateY(10px)',
    transition: 'opacity 0.2s ease, transform 0.2s ease',
    background: 'hsl(var(--surface-primary))',
    border: '1px solid hsl(var(--border-accent-subtle))',
    borderRadius: 'var(--radius-md)',
    padding: '0.75rem',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    maxWidth: '240px',
    fontSize: '0.875rem'
  });

  // Position tooltip
  const rect = element.getBoundingClientRect();
  tooltipElement.style.left = `${rect.left}px`;
  tooltipElement.style.top = `${rect.bottom + 8}px`;

  document.body.appendChild(tooltipElement);

  // Animate in
  requestAnimationFrame(() => {
    if (tooltipElement) {
      tooltipElement.style.opacity = '1';
      tooltipElement.style.transform = 'translateY(0)';
    }
  });
}

/**
 * Hide accent preview tooltip
 */
function hideAccentTooltip(): void {
  if (tooltipElement) {
    tooltipElement.style.opacity = '0';
    tooltipElement.style.transform = 'translateY(10px)';

    setTimeout(() => {
      if (tooltipElement) {
        document.body.removeChild(tooltipElement);
        tooltipElement = null;
      }
    }, 200);
  }
}

/**
 * Handle logo click with accent cycling
 * @param event - Click event
 * @param options - Configuration options
 */
function handleLogoClick(event: Event, options: Required<LogoInteractionOptions>): void {
  event.preventDefault();

  if (cyclingState.isAnimating) return;
  cyclingState.isAnimating = true;

  // Determine cycle direction (shift+click for backward)
  const direction = (event as MouseEvent).shiftKey ? 'backward' : 'forward';

  // Cycle to next accent
  const result = cycleAccent(direction);

  if (options.debugMode) {
    console.log('🎨 Accent Cycle:', result);
  }

  // Show tooltip with new accent info
  if (options.enableTooltip) {
    showAccentTooltip(event.target as Element, result.preset);

    // Auto-hide tooltip
    setTimeout(hideAccentTooltip, 2000);
  }

  // Add visual feedback animation
  const element = event.target as HTMLElement;
  element.style.transform = 'scale(0.95)';
  element.style.transition = `transform ${options.animationDuration}ms ease`;

  setTimeout(() => {
    element.style.transform = 'scale(1)';
    cyclingState.isAnimating = false;
  }, options.animationDuration);

  // Dispatch custom event for other components to listen
  window.dispatchEvent(new CustomEvent('accentChange', {
    detail: result
  }));
}

/**
 * Handle keyboard shortcuts for accent cycling
 * @param event - Keyboard event
 * @param options - Configuration options
 */
function handleKeyboardShortcuts(event: KeyboardEvent, options: Required<LogoInteractionOptions>): void {
  // Alt + A: cycle forward
  // Alt + Shift + A: cycle backward
  if (event.altKey && event.key.toLowerCase() === 'a') {
    event.preventDefault();

    const direction = event.shiftKey ? 'backward' : 'forward';
    const result = cycleAccent(direction);

    if (options.debugMode) {
      console.log('🎨 Accent Keyboard Cycle:', result);
    }

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('accentChange', {
      detail: result
    }));
  }
}

/**
 * Bind accent cycling to logo elements
 * @param options - Configuration options
 */
export function bindLogoAccentCycle(options: Partial<LogoInteractionOptions> = {}): void {
  if (typeof window === 'undefined') return;

  const config = { ...DEFAULT_OPTIONS, ...options };

  // Clean up existing bindings
  unbindLogoAccentCycle();

  // Find logo elements
  const logoElements = document.querySelectorAll(config.selector);

  if (logoElements.length === 0) {
    console.warn(`No logo elements found with selector: ${config.selector}`);
    return;
  }

  // Bind click handlers
  logoElements.forEach(element => {
    const clickHandler = (event: Event) => handleLogoClick(event, config);
    element.addEventListener('click', clickHandler);
    boundElements.push(element);

    // Add visual hint
    if (element instanceof HTMLElement) {
      element.style.cursor = 'pointer';
      element.title = 'Click to change accent color (Shift+click for previous)';
    }
  });

  // Bind keyboard shortcuts
  if (config.enableKeyboard) {
    const keyboardHandler = (event: KeyboardEvent) => handleKeyboardShortcuts(event, config);
    document.addEventListener('keydown', keyboardHandler);
  }

  if (config.debugMode) {
    console.log(`🎨 Accent cycling bound to ${logoElements.length} elements`);
  }
}

/**
 * Remove accent cycling bindings
 */
export function unbindLogoAccentCycle(): void {
  // Remove event listeners (note: we can't remove specific handlers without references)
  // This is a limitation, but in practice the component will re-mount
  boundElements.forEach(element => {
    if (element instanceof HTMLElement) {
      element.style.cursor = '';
      element.title = '';
    }
  });

  boundElements = [];
  hideAccentTooltip();
}

// =================================================================
// PREVIEW & UTILITY FUNCTIONS
// =================================================================

/**
 * Get all available accent presets
 * @returns Array of accent presets
 */
export function getAccentPresets(): AccentPreset[] {
  return [...ACCENT_PRESETS];
}

/**
 * Get current accent preset info
 * @returns Current preset or null if not found
 */
export function getCurrentAccentPreset(): AccentPreset | null {
  const index = getCurrentAccentIndex();
  return ACCENT_PRESETS[index] || null;
}

/**
 * Preview what an accent would look like without applying it
 * @param hex - Hex color to preview
 * @returns Preview data including scale and contrast info
 */
export function previewAccent(hex: string) {
  return previewAccentScale(hex);
}

/**
 * Get accent presets by category
 * @param category - Category to filter by
 * @returns Filtered presets
 */
export function getAccentsByCategory(category: AccentPreset['category']): AccentPreset[] {
  return ACCENT_PRESETS.filter(preset => preset.category === category);
}

// =================================================================
// ANALYTICS & DEBUGGING
// =================================================================

/**
 * Get cycling statistics
 * @returns Usage statistics
 */
export function getCyclingStats() {
  return {
    currentIndex: cyclingState.currentIndex,
    currentPreset: getCurrentAccentPreset(),
    totalPresets: ACCENT_PRESETS.length,
    lastChangeTime: cyclingState.lastChangeTime,
    isAnimating: cyclingState.isAnimating,
    boundElements: boundElements.length
  };
}

/**
 * Log current accent cycling state
 */
export function debugAccentCycling(): void {
  console.group('🎨 Accent Cycling Debug');
  console.log('Stats:', getCyclingStats());
  console.log('Available presets:', ACCENT_PRESETS.length);
  console.table(ACCENT_PRESETS);
  console.groupEnd();
}
