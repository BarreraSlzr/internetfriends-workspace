// Design System Patterns - InternetFriends Shared Utilities
// Centralized patterns, schemes, and utilities for scalable component development

export interface InternetFriendsTheme {
  colors: {
    primary: string;
    primaryHover: string;
    primaryLight: string;
    primaryActive: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
      contrast: string;
    };
    background: {
      primary: string;
      secondary: string;
      tertiary: string;
      glass: string;
      glassScrolled: string;
    };
    border: {
      primary: string;
      focus: string;
      glass: string;
      glassEnhanced: string;
      glassOutset: string;
    };
    shadow: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    component: {
      atomic: string;
      molecular: string;
      organism: string;
      template: string;
      page: string;
    };
  };
  radius: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  typography: {
    fontFamily: {
      sans: string;
      mono: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
    };
    fontWeight: {
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
    };
    lineHeight: {
      tight: string;
      normal: string;
      relaxed: string;
    };
  };
  breakpoints: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  animation: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      inOut: string;
      out: string;
      in: string;
    };
  };
}

// Light theme configuration
export const lightTheme: InternetFriendsTheme = {
  colors: {
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    primaryLight: 'rgba(59, 130, 246, 0.08)',
    primaryActive: 'rgba(59, 130, 246, 0.12)',
    text: {
      primary: '#111827',
      secondary: '#6b7280',
      muted: '#9ca3af',
      contrast: '#000000',
    },
    background: {
      primary: '#ffffff',
      secondary: '#f9fafb',
      tertiary: '#f3f4f6',
      glass: 'rgba(255, 255, 255, 0.85)',
      glassScrolled: 'rgba(255, 255, 255, 0.92)',
    },
    border: {
      primary: '#e5e7eb',
      focus: '#60a5fa',
      glass: 'rgba(255, 255, 255, 0.12)',
      glassEnhanced: 'rgba(255, 255, 255, 0.18)',
      glassOutset: 'rgba(59, 130, 246, 0.15)',
    },
    shadow: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    },
    component: {
      atomic: '#10b981',
      molecular: '#3b82f6',
      organism: '#8b5cf6',
      template: '#ec4899',
      page: '#f59e0b',
    },
  },
  radius: {
    xs: '0.25rem',
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    '2xl': '2rem',
  },
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      mono: '"SF Mono", "Monaco", "Cascadia Code", "Roboto Mono", monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  breakpoints: {
    xs: '320px',
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
  },
  animation: {
    duration: {
      fast: '0.15s',
      normal: '0.2s',
      slow: '0.3s',
    },
    easing: {
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
    },
  },
};

// Dark theme configuration
export const darkTheme: InternetFriendsTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    text: {
      primary: '#ffffff',
      secondary: '#d1d5db',
      muted: '#9ca3af',
      contrast: '#ffffff',
    },
    background: {
      primary: '#111827',
      secondary: '#1f2937',
      tertiary: '#374151',
      glass: 'rgba(17, 24, 39, 0.85)',
      glassScrolled: 'rgba(17, 24, 39, 0.92)',
    },
    border: {
      primary: '#374151',
      focus: '#60a5fa',
      glass: 'rgba(255, 255, 255, 0.12)',
      glassEnhanced: 'rgba(255, 255, 255, 0.18)',
      glassOutset: 'rgba(59, 130, 246, 0.15)',
    },
  },
};

// Common component patterns
export interface ComponentPattern {
  name: string;
  description: string;
  props: Record<string, unknown>;
  variants?: Record<string, unknown>;
  states?: string[];
  accessibility?: {
    ariaLabel?: string;
    keyboardNavigation?: string[];
    focusManagement?: string;
  };
}

// Button pattern
export const buttonPattern: ComponentPattern = {
  name: 'Button',
  description: 'Interactive button component with consistent styling',
  props: {
    variant: {
      type: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger'],
      default: 'primary',
    },
    size: {
      type: 'select',
      options: ['sm', 'md', 'lg'],
      default: 'md',
    },
    disabled: {
      type: 'boolean',
      default: false,
    },
    loading: {
      type: 'boolean',
      default: false,
    },
    fullWidth: {
      type: 'boolean',
      default: false,
    },
  },
  variants: {
    primary: {
      background: 'var(--if-primary)',
      color: 'white',
      '&:hover': {
        background: 'var(--if-primary-hover)',
      },
    },
    secondary: {
      background: 'var(--bg-secondary)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-primary)',
      '&:hover': {
        background: 'var(--if-primary-light)',
        borderColor: 'var(--if-primary)',
      },
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      '&:hover': {
        background: 'var(--if-primary-light)',
        color: 'var(--if-primary)',
      },
    },
    danger: {
      background: '#dc2626',
      color: 'white',
      '&:hover': {
        background: '#b91c1c',
      },
    },
  },
  states: ['default', 'hover', 'active', 'disabled', 'loading'],
  accessibility: {
    ariaLabel: 'Interactive button',
    keyboardNavigation: ['Enter', 'Space'],
    focusManagement: 'Focus ring with 2px dashed border',
  },
};

// Input pattern
export const inputPattern: ComponentPattern = {
  name: 'Input',
  description: 'Form input component with validation and states',
  props: {
    type: {
      type: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
      default: 'text',
    },
    size: {
      type: 'select',
      options: ['sm', 'md', 'lg'],
      default: 'md',
    },
    disabled: {
      type: 'boolean',
      default: false,
    },
    error: {
      type: 'boolean',
      default: false,
    },
    success: {
      type: 'boolean',
      default: false,
    },
    placeholder: {
      type: 'string',
      default: 'Enter text...',
    },
  },
  states: ['default', 'focus', 'error', 'success', 'disabled'],
  accessibility: {
    ariaLabel: 'Text input field',
    keyboardNavigation: ['Tab', 'Enter'],
    focusManagement: 'Focus ring with enhanced border color',
  },
};

// Card pattern
export const cardPattern: ComponentPattern = {
  name: 'Card',
  description: 'Container component for grouped content',
  props: {
    variant: {
      type: 'select',
      options: ['default', 'glass', 'elevated', 'outlined'],
      default: 'default',
    },
    padding: {
      type: 'select',
      options: ['sm', 'md', 'lg'],
      default: 'md',
    },
    interactive: {
      type: 'boolean',
      default: false,
    },
    selected: {
      type: 'boolean',
      default: false,
    },
  },
  variants: {
    default: {
      background: 'var(--bg-primary)',
      border: '1px solid var(--border-primary)',
      borderRadius: 'var(--radius-lg)',
    },
    glass: {
      background: 'var(--glass-bg-header)',
      border: '1px solid var(--glass-border-enhanced)',
      borderRadius: 'var(--radius-lg)',
      backdropFilter: 'blur(12px)',
    },
    elevated: {
      background: 'var(--bg-primary)',
      border: '1px solid var(--border-primary)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-lg)',
    },
    outlined: {
      background: 'transparent',
      border: '2px solid var(--border-primary)',
      borderRadius: 'var(--radius-lg)',
    },
  },
  states: ['default', 'hover', 'selected', 'focus'],
};

// Modal pattern
export const modalPattern: ComponentPattern = {
  name: 'Modal',
  description: 'Overlay component for dialogs and popups',
  props: {
    size: {
      type: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'fullscreen'],
      default: 'md',
    },
    closable: {
      type: 'boolean',
      default: true,
    },
    backdrop: {
      type: 'select',
      options: ['blur', 'dark', 'transparent'],
      default: 'blur',
    },
    animation: {
      type: 'select',
      options: ['fade', 'scale', 'slide'],
      default: 'scale',
    },
  },
  accessibility: {
    ariaLabel: 'Modal dialog',
    keyboardNavigation: ['Escape', 'Tab'],
    focusManagement: 'Trap focus within modal, return to trigger on close',
  },
};

// Utility functions for pattern application
export class PatternUtility {
  static applyTheme(theme: InternetFriendsTheme): string {
    return Object.entries(theme.colors).map(([key, value]) => {
      if (typeof value === 'object') {
        return Object.entries(value).map(([subKey, subValue]) =>
          `--${key}-${subKey}: ${subValue};`
        ).join('\n  ');
      }
      return `--${key}: ${value};`;
    }).join('\n  ');
  }

  static generateCSS(pattern: ComponentPattern, theme: InternetFriendsTheme): string {
    const baseStyles = `
.${pattern.name.toLowerCase()} {
  font-family: ${theme.typography.fontFamily.sans};
  transition: all ${theme.animation.duration.normal} ${theme.animation.easing.inOut};
  border-radius: ${theme.radius.md};
}`;

    const variantStyles = pattern.variants ? Object.entries(pattern.variants).map(([variant, styles]) => `
.${pattern.name.toLowerCase()}--${variant} {
  ${Object.entries(styles as Record<string, any>).map(([prop, value]) =>
    `${prop}: ${value};`
  ).join('\n  ')}
}`).join('\n') : '';

    return baseStyles + variantStyles;
  }

  static getResponsiveStyle(property: string, values: Record<string, string>, theme: InternetFriendsTheme): string {
    return Object.entries(values).map(([breakpoint, value]) => {
      if (breakpoint === 'base') {
        return `${property}: ${value};`;
      }
      const bpValue = theme.breakpoints[breakpoint as keyof typeof theme.breakpoints];
      return `@media (min-width: ${bpValue}) { ${property}: ${value}; }`;
    }).join('\n  ');
  }

  static generateStateStyles(states: string[], baseClass: string): string {
    return states.map(state => {
      switch (state) {
        case 'hover':
          return `.${baseClass}:hover { transform: translateY(-1px); box-shadow: var(--shadow-md); }`;
        case 'focus':
          return `.${baseClass}:focus { outline: 2px dashed var(--border-focus); outline-offset: 2px; }`;
        case 'active':
          return `.${baseClass}:active { transform: translateY(0); }`;
        case 'disabled':
          return `.${baseClass}:disabled { opacity: 0.5; cursor: not-allowed; }`;
        default:
          return '';
      }
    }).filter(Boolean).join('\n');
  }
}

// MDX integration utilities
export interface MDXComponentConfig {
  frontmatter: Record<string, unknown>;
  components: Record<string, unknown>;
  exports: string[];
  imports: string[];
}

export class MDXPatternIntegration {
  static extractFrontmatter(content: string): Record<string, unknown> {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
    const match = content.match(frontmatterRegex);

    if (!match) return {};

    try {
      // Simple YAML parser - in production, use a proper YAML library
      const lines = match[1].split('\n');
      const result: Record<string, unknown> = {};

      lines.forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > -1) {
          const key = line.slice(0, colonIndex).trim();
          const value = line.slice(colonIndex + 1).trim();
          result[key] = value.replace(/^['"]|['"]$/g, ''); // Remove quotes
        }
      });

      return result;
    } catch (error) {
      console.warn('Failed to parse frontmatter:', error);
      return {};
    }
  }

  static generateMDXComponent(pattern: ComponentPattern, theme: InternetFriendsTheme): string {
    return `---
title: ${pattern.name}
description: ${pattern.description}
category: component
type: pattern
---


# ${pattern.name}

${pattern.description}

## Props

${Object.entries(pattern.props).map(([prop, config]) =>
  `- **${prop}**: \`${(config as any).type}\` - ${(config as any).default ? `Default: \`${(config as any).default}\`` : ''}`
).join('\n')}

## Example

\`\`\`jsx
<${pattern.name}
  ${Object.entries(pattern.props).map(([prop, config]) =>
    `${prop}="${(config as any).default || 'value'}"`
  ).join('\n  ')}
>
  Content
</${pattern.name}>
\`\`\`

## Variants

${pattern.variants ? Object.keys(pattern.variants).map(variant =>
  `### ${variant}\n\n<${pattern.name} variant="${variant}">Example</${pattern.name}>`
).join('\n\n') : 'No variants available'}

## Accessibility

${pattern.accessibility ? Object.entries(pattern.accessibility).map(([key, value]) =>
  `- **${key}**: ${Array.isArray(value) ? value.join(', ') : value}`
).join('\n') : 'No specific accessibility notes'}
`;
  }
}

// Microfrontend utilities
export interface MicrofrontendModule {
  name: string;
  version: string;
  components: ComponentPattern[];
  shared: string[];
  federation: {
    exposes: Record<string, string>;
    shared: Record<string, unknown>;
  };
}

export class MicrofrontendPatternIntegration {
  static generateModuleFederation(module: MicrofrontendModule): unknown {
    return {
      name: module.name,
      exposes: module.federation.exposes,
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
        ...module.federation.shared,
      },
    };
  }

  static generateManifest(module: MicrofrontendModule): string {
    return JSON.stringify({
      name: module.name,
      version: module.version,
      components: module.components.map(c => ({
        name: c.name,
        description: c.description,
        props: Object.keys(c.props),
        variants: c.variants ? Object.keys(c.variants) : [],
      })),
      shared: module.shared,
      federation: module.federation,
    }, null, 2);
  }
}

// Data pipeline integration
export interface DataPipelineSchema {
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  transforms: Array<{
    type: string;
    config: Record<string, any>;
  }>;
}

export class DataPipelinePatternIntegration {
  static createComponentDataPipeline(pattern: ComponentPattern): DataPipelineSchema {
    return {
      input: pattern.props,
      output: {
        rendered: 'ReactElement',
        state: 'ComponentState',
        events: 'ComponentEvents',
      },
      transforms: [
        {
          type: 'validate',
          config: { schema: pattern.props },
        },
        {
          type: 'theme',
          config: { theme: 'system' },
        },
        {
          type: 'render',
          config: { pattern: pattern.name },
        },
      ],
    };
  }
}

// Export all patterns and utilities
export const patterns = {
  button: buttonPattern,
  input: inputPattern,
  card: cardPattern,
  modal: modalPattern,
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
};

export const utilities = {
  PatternUtility,
  MDXPatternIntegration,
  MicrofrontendPatternIntegration,
  DataPipelinePatternIntegration,
};

// Default export for easy consumption
export default {
  patterns,
  themes,
  utilities,
};
