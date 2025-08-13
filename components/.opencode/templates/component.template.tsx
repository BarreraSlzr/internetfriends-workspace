/**
 * Steadiest Addressability Component Template
 * Based on glass-refinement-v1 epic patterns
 */

import React from 'react';
import { generateStamp, getIsoTimestamp } from '../../utils/stamp';

// Types (≤8 props recommended)
interface ComponentProps {
  // Essential props
  disabled?: boolean;
  className?: string;
  
  // Functional props  
  variant?: 'primary' | 'secondary';
  theme?: 'light' | 'dark' | 'auto';
  
  // Testing & accessibility
  'data-testid'?: string;
  
  // Content
  children?: React.ReactNode;
}

// Productive defaults (steadiest addressability)
const DEFAULTS = {
  variant: 'primary' as const,
  theme: 'auto' as const,
};

/**
 * Component Name - Following Steadiest Addressability
 * 
 * Patterns:
 * - ≤8 props total
 * - Productive defaults handle common cases
 * - Once-on-mount stable configuration
 * - Clear client/server boundaries
 * - Early return for disabled state
 */
export const Component: React.FC<ComponentProps> = ({
  disabled = false,
  className = '',
  variant = DEFAULTS.variant,
  theme = DEFAULTS.theme,
  'data-testid': testId = 'component',
  children
}) => {
  // Early return for disabled (steadiest pattern)
  if (disabled) return null;
  
  // Stable config (once-on-mount, no churn)
  const stableConfig = React.useMemo(() => ({
    id: `component-${generateStamp()}`,
    createdAt: getIsoTimestamp(),
    stamp: generateStamp(),
    variant,
    theme
  }), [variant, theme]);
  
  // Client-only features (addressability: explicit boundary)
  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => { setIsClient(true); }, []);
  
  // Theme-aware CSS classes
  const getThemeClasses = React.useCallback(() => {
    const base = ['component', `component-${stableConfig.variant}`, className];
    
    if (isClient) {
      const prefersDark = typeof window !== 'undefined' && 
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      const dark = stableConfig.theme === 'dark' || 
        (stableConfig.theme === 'auto' && prefersDark);
      base.push(dark ? 'component-dark' : 'component-light');
    }
    
    return base.filter(Boolean).join(' ');
  }, [className, isClient, stableConfig.theme, stableConfig.variant]);
  
  return (
    <div
      className={getThemeClasses()}
      data-testid={testId}
      data-config-id={stableConfig.id}
      data-stamp={stableConfig.stamp}
      role="region"
      aria-label="Component region"
    >
      <div className="component-container">
        {children}
      </div>
    </div>
  );
};

export default Component;