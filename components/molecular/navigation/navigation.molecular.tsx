'use client';

import React from 'react';
import { generateStamp, getIsoTimestamp } from '../../utils/stamp';
import { NavigationConfig, NavigationItem, NavigationProps } from './types';

/**
 * Navigation Molecular Component - Steadiest Addressability Pattern
 * 
 * Following the glass-refinement-v1 epic principles:
 * - Minimal Configuration Surface (≤8 props)
 * - Productive Defaults from real usage patterns
 * - Once-On-Mount Logic for stability
 * - Clear Client/Server boundaries
 */

// Productive defaults extracted from common navigation patterns (steadiest)
const PRODUCTIVE_DEFAULTS: Required<Pick<NavigationConfig, 'variant' | 'theme' | 'showBranding' | 'enableSearch' | 'stickyBehavior'>> = {
    variant: 'horizontal',
    theme: 'auto',
    showBranding: true,
    enableSearch: false,
    stickyBehavior: 'smart'
};

// Brand-appropriate navigation items
const DEFAULT_NAVIGATION_ITEMS: NavigationItem[] = [
    { label: 'Home', href: '/', priority: 'high' },
    { label: 'About', href: '/about', priority: 'medium' },
    { label: 'Contact', href: '/contact', priority: 'medium' },
];

/**
 * Navigation Molecular Component
 * 
 * Implements steadiest addressability with:
 * - 6 props total (within ≤8 limit)
 * - Productive defaults handle 90% of use cases
 * - Once-on-mount initialization
 * - Theme-aware styling
 */
export const NavigationMolecular: React.FC<NavigationProps> = ({
    items = DEFAULT_NAVIGATION_ITEMS,
    variant = PRODUCTIVE_DEFAULTS.variant,
    theme = PRODUCTIVE_DEFAULTS.theme,
    disabled = false,
    className = '',
    'data-testid': testId = 'navigation-molecular'
}) => {
    const stableConfig = useStableNavConfig({ variant, theme });

    // Client-only interactivity (addressability: explicit state boundary)
    const [isClient, setIsClient] = React.useState(false);
    React.useEffect(() => { setIsClient(true); }, []);

    // Early return for disabled state
    if (disabled) return null;

    // Theme-aware CSS classes
    const getThemeClasses = React.useCallback(() => {
        const base = [
            'navigation-molecular',
            `navigation-${stableConfig.variant}`,
            className
        ];
        if (isClient) {
            const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
            const dark = stableConfig.theme === 'dark' || (stableConfig.theme === 'auto' && prefersDark);
            base.push(dark ? 'navigation-dark' : 'navigation-light');
        }
        return base.filter(Boolean).join(' ');
    }, [className, isClient, stableConfig.theme, stableConfig.variant]);

    // Render navigation items with priority-based ordering
    const renderNavigationItems = React.useCallback(() => {
        const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
        return [...items]
            .sort((a, b) => (priorityOrder[a.priority || 'medium'] - priorityOrder[b.priority || 'medium']))
            .map((item, i) => (
                <NavItemComponent
                    key={`${item.href}-${i}`}
                    item={item}
                    config={stableConfig}
                    data-testid={`${testId}-item-${i}`}
                />
            ));
    }, [items, stableConfig, testId]);

    return (
        <nav
            className={getThemeClasses()}
            data-testid={testId}
            data-config-id={stableConfig.id}
            data-stamp={stableConfig.stamp}
            role="navigation"
            aria-label="Main navigation"
        >
            <div className="navigation-container">
                {stableConfig.showBranding && (
                    <div className="navigation-brand" data-testid={`${testId}-brand`}>
                        <span className="brand-text">InternetFriends</span>
                    </div>
                )}
                <ul className="navigation-items" role="list">
                    {renderNavigationItems()}
                </ul>
                {stableConfig.enableSearch && isClient && (
                    <div className="navigation-search" data-testid={`${testId}-search`}>
                        <input
                            type="search"
                            placeholder="Search..."
                            aria-label="Search navigation"
                            className="search-input"
                        />
                    </div>
                )}
            </div>
        </nav>
    );
};

/**
 * Navigation Item Component - Internal implementation
 */
interface StableNavConfig extends NavigationConfig {
    id: string;
    createdAt: string; // ISO timestamp
    stamp: string;     // short stamp
}

interface NavItemComponentProps {
    item: NavigationItem;
    config: StableNavConfig;
    'data-testid'?: string;
}

const NavItemComponent: React.FC<NavItemComponentProps> = ({ item, config, 'data-testid': testId }: NavItemComponentProps) => {
    const [isActive, setIsActive] = React.useState(false);

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsActive(window.location.pathname === item.href);
        }
    }, [item.href]);

    const itemClasses = [
        'navigation-item',
        `priority-${item.priority || 'medium'}`,
        isActive ? 'active' : ''
    ].filter(Boolean).join(' ');

    return (
        <li className={itemClasses} data-testid={testId}>
            <a
                href={item.href}
                className="navigation-link"
                aria-current={isActive ? 'page' : undefined}
                data-priority={item.priority}
            >
                {item.icon && (
                    <span className="navigation-icon" aria-hidden="true">{item.icon}</span>
                )}
                <span className="navigation-label">{item.label}</span>
                {item.badge && (
                    <span className="navigation-badge" aria-label={`${item.badge} notifications`}>{item.badge}</span>
                )}
            </a>
        </li>
    );
};

// Hook: stable nav config (steadiest param object pattern)
interface UseStableNavConfigParams { variant: NavigationConfig['variant']; theme: NavigationConfig['theme']; }
function useStableNavConfig(params: UseStableNavConfigParams): StableNavConfig {
    const { variant, theme } = params;
    return React.useMemo<StableNavConfig>(() => ({
        id: `nav-${generateStamp()}`,
        createdAt: getIsoTimestamp(),
        stamp: generateStamp(),
        ...PRODUCTIVE_DEFAULTS,
        variant,
        theme
    }), [variant, theme]);
}

// Export default for easy imports
export default NavigationMolecular;
