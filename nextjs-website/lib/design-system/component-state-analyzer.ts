/**
 * Component State Machine Analyzer
 * Analyzes React components and generates Mermaid state diagrams
 * showing component logic flow, state transitions, and CSS specifications
 */

import { ComponentMetadata } from './component-discovery';

export interface ComponentState {
  name: string;
  description: string;
  triggers: string[];
  transitions: StateTransition[];
  cssClasses: string[];
  props: Record<string, any>;
}

export interface StateTransition {
  from: string;
  to: string;
  trigger: string;
  condition?: string;
  effect?: string;
}

export interface ComponentStateMachine {
  componentName: string;
  initialState: string;
  states: ComponentState[];
  transitions: StateTransition[];
  cssStates: CSSStateSpec[];
  mermaidDiagram: string;
  documentation: string;
}

export interface CSSStateSpec {
  state: string;
  styles: {
    backgroundColor?: string;
    borderColor?: string;
    color?: string;
    opacity?: number;
    transform?: string;
    transition?: string;
    borderWidth?: string;
  };
  classes: string[];
  pseudoStates: string[];
}

/**
 * Analyzes a component's source code to extract state machine information
 */
export class ComponentStateAnalyzer {
  
  /**
   * Extract state machine from component source code
   */
  static async analyzeComponent(metadata: ComponentMetadata): Promise<ComponentStateMachine> {
    const sourceCode = await this.getComponentSource(metadata.filePath);
    
    const states = this.extractStates(sourceCode);
    const transitions = this.extractTransitions(sourceCode);
    const cssStates = this.extractCSSStates(sourceCode, metadata);
    
    const mermaidDiagram = this.generateMermaidDiagram(states, transitions);
    const documentation = this.generateMarkdownDocumentation(metadata, states, transitions, cssStates);
    
    return {
      componentName: metadata.name,
      initialState: states[0]?.name || 'idle',
      states,
      transitions,
      cssStates,
      mermaidDiagram,
      documentation
    };
  }

  /**
   * Extract component states from useState, useReducer, and conditional logic
   */
  private static extractStates(sourceCode: string): ComponentState[] {
    const states: ComponentState[] = [];
    
    // Extract useState calls
    const useStateMatches = sourceCode.match(/const\s*\[\s*(\w+)\s*,\s*set\w+\s*\]\s*=\s*useState\s*\(\s*([^)]+)\s*\)/g);
    
    if (useStateMatches) {
      useStateMatches.forEach(match => {
        const stateMatch = match.match(/const\s*\[\s*(\w+)\s*,\s*set(\w+)\s*\]\s*=\s*useState\s*\(\s*([^)]+)\s*\)/);
        if (stateMatch) {
          const [, stateName, setterName, initialValue] = stateMatch;
          
          // Detect boolean states (loading, disabled, open, etc.)
          if (initialValue.includes('false') || initialValue.includes('true')) {
            states.push({
              name: `${stateName}False`,
              description: `${stateName} is false`,
              triggers: [`set${setterName}(false)`],
              transitions: [],
              cssClasses: this.extractCSSClasses(sourceCode, stateName, false),
              props: { [stateName]: false }
            });
            
            states.push({
              name: `${stateName}True`,
              description: `${stateName} is true`,
              triggers: [`set${setterName}(true)`],
              transitions: [],
              cssClasses: this.extractCSSClasses(sourceCode, stateName, true),
              props: { [stateName]: true }
            });
          }
        }
      });
    }

    // Extract common component states from prop patterns
    const commonStates = this.extractCommonStates(sourceCode);
    states.push(...commonStates);

    return states.length > 0 ? states : this.getDefaultStates();
  }

  /**
   * Extract common component states from prop usage patterns
   */
  private static extractCommonStates(sourceCode: string): ComponentState[] {
    const states: ComponentState[] = [];
    
    // Check for loading states
    if (sourceCode.includes('loading') || sourceCode.includes('isLoading')) {
      states.push({
        name: 'loading',
        description: 'Component is in loading state',
        triggers: ['async action started'],
        transitions: [],
        cssClasses: ['animate-pulse', 'opacity-50', 'cursor-not-allowed'],
        props: { loading: true }
      });
    }

    // Check for disabled states
    if (sourceCode.includes('disabled') || sourceCode.includes('isDisabled')) {
      states.push({
        name: 'disabled',
        description: 'Component is disabled',
        triggers: ['disabled prop true'],
        transitions: [],
        cssClasses: ['opacity-50', 'cursor-not-allowed', 'pointer-events-none'],
        props: { disabled: true }
      });
    }

    // Check for error states
    if (sourceCode.includes('error') || sourceCode.includes('hasError')) {
      states.push({
        name: 'error',
        description: 'Component has error state',
        triggers: ['error occurred'],
        transitions: [],
        cssClasses: ['border-red-500', 'text-red-600', 'bg-red-50'],
        props: { error: true }
      });
    }

    // Check for success states
    if (sourceCode.includes('success') || sourceCode.includes('isSuccess')) {
      states.push({
        name: 'success',
        description: 'Component is in success state',
        triggers: ['operation completed'],
        transitions: [],
        cssClasses: ['border-green-500', 'text-green-600', 'bg-green-50'],
        props: { success: true }
      });
    }

    return states;
  }

  /**
   * Extract CSS classes associated with different states
   */
  private static extractCSSClasses(sourceCode: string, stateName: string, stateValue: boolean): string[] {
    const classes: string[] = [];
    
    // Look for conditional className patterns
    const classNamePatterns = [
      `className.*${stateName}.*?['"\`]([^'"\`]+)['"\`]`,
      `${stateName}\\s*\\?\\s*['"\`]([^'"\`]+)['"\`]`,
      `clsx\\(.*${stateName}.*?['"\`]([^'"\`]+)['"\`]`
    ];

    classNamePatterns.forEach(pattern => {
      const regex = new RegExp(pattern, 'g');
      let match;
      while ((match = regex.exec(sourceCode)) !== null) {
        const classString = match[1];
        classes.push(...classString.split(/\s+/).filter(Boolean));
      }
    });

    return [...new Set(classes)];
  }

  /**
   * Extract state transitions from event handlers and effects
   */
  private static extractTransitions(sourceCode: string): StateTransition[] {
    const transitions: StateTransition[] = [];
    
    // Look for onClick, onSubmit, etc. handlers that change state
    const handlerMatches = sourceCode.match(/on\w+\s*=\s*\{[^}]+\}/g);
    
    if (handlerMatches) {
      handlerMatches.forEach(handler => {
        // Extract setState calls within handlers
        const setStateMatches = handler.match(/set\w+\([^)]+\)/g);
        if (setStateMatches) {
          setStateMatches.forEach(setState => {
            transitions.push({
              from: 'any',
              to: 'new_state',
              trigger: handler.match(/on(\w+)/)?.[1] || 'unknown',
              effect: setState
            });
          });
        }
      });
    }

    return transitions;
  }

  /**
   * Extract CSS state specifications for styling documentation
   */
  private static extractCSSStates(sourceCode: string, metadata: ComponentMetadata): CSSStateSpec[] {
    const cssStates: CSSStateSpec[] = [];

    // Default/idle state
    cssStates.push({
      state: 'default',
      styles: {
        borderColor: 'var(--color-border)',
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-text-primary)'
      },
      classes: ['border', 'rounded-lg', 'px-4', 'py-2'],
      pseudoStates: [':hover', ':focus', ':active']
    });

    // Hover state
    cssStates.push({
      state: 'hover',
      styles: {
        backgroundColor: 'var(--color-background-hover)',
        borderColor: 'var(--color-border-hover)',
        transform: 'translateY(-1px)'
      },
      classes: ['hover:bg-gray-50', 'hover:border-gray-300'],
      pseudoStates: [':hover']
    });

    // Focus state (InternetFriends style - dashed border)
    cssStates.push({
      state: 'focus',
      styles: {
        borderColor: 'var(--color-primary)',
        borderWidth: '2px'
      },
      classes: ['focus:border-dashed', 'focus:border-2', 'focus:border-blue-500'],
      pseudoStates: [':focus', ':focus-visible']
    });

    return cssStates;
  }

  /**
   * Generate Mermaid state diagram
   */
  private static generateMermaidDiagram(states: ComponentState[], transitions: StateTransition[]): string {
    const mermaid = ['stateDiagram-v2'];
    
    // Add states
    states.forEach(state => {
      mermaid.push(`    ${state.name} : ${state.description}`);
    });

    // Add transitions
    transitions.forEach(transition => {
      mermaid.push(`    ${transition.from} --> ${transition.to} : ${transition.trigger}`);
    });

    // Add CSS state transitions
    mermaid.push('    [*] --> default');
    mermaid.push('    default --> hover : mouse enter');
    mermaid.push('    hover --> default : mouse leave');
    mermaid.push('    default --> focus : tab/click');
    mermaid.push('    focus --> default : blur');
    mermaid.push('    default --> loading : async action');
    mermaid.push('    loading --> default : action complete');
    mermaid.push('    default --> error : error occurred');
    mermaid.push('    error --> default : reset');

    return mermaid.join('\n');
  }

  /**
   * Generate comprehensive markdown documentation
   */
  private static generateMarkdownDocumentation(
    metadata: ComponentMetadata,
    states: ComponentState[],
    transitions: StateTransition[],
    cssStates: CSSStateSpec[]
  ): string {
    return `# ${metadata.name} State Machine

## Overview
${metadata.description}

## Component States

### Logical States
${states.map(state => `
#### ${state.name}
- **Description**: ${state.description}
- **Triggers**: ${state.triggers.join(', ')}
- **CSS Classes**: \`${state.cssClasses.join(' ')}\`
- **Props**: \`${JSON.stringify(state.props)}\`
`).join('')}

### CSS States & Styling

${cssStates.map(cssState => `
#### ${cssState.state}
\`\`\`css
${Object.entries(cssState.styles).map(([prop, value]) => 
  `${prop}: ${value};`
).join('\n')}
\`\`\`

**Classes**: \`${cssState.classes.join(' ')}\`  
**Pseudo-states**: ${cssState.pseudoStates.join(', ')}
`).join('')}

## State Transitions

\`\`\`mermaid
${this.generateMermaidDiagram(states, transitions)}
\`\`\`

## CSS Custom Properties

Following InternetFriends design system:

\`\`\`css
:root {
  --color-primary: #3b82f6;
  --color-border: #e5e7eb;
  --color-border-hover: #d1d5db;
  --color-background: #ffffff;
  --color-background-hover: #f9fafb;
  --color-text-primary: #111827;
}
\`\`\`

## Focus States

InternetFriends style focus states use **2px dashed borders**:

\`\`\`css
.component:focus-visible {
  border: 2px dashed var(--color-primary);
  outline: none;
}
\`\`\`

## Animation Transitions

\`\`\`css
.component {
  transition: all 0.2s ease-in-out;
}
\`\`\`

## Usage Examples

\`\`\`tsx
// Default state
<${metadata.name} />

// Loading state
<${metadata.name} loading />

// Error state
<${metadata.name} error="Something went wrong" />

// Success state
<${metadata.name} success />
\`\`\`

## Testing States

\`\`\`tsx
// Test all states
describe('${metadata.name} States', () => {
  it('renders default state', () => {
    render(<${metadata.name} />);
  });
  
  it('renders loading state', () => {
    render(<${metadata.name} loading />);
  });
  
  it('handles error state', () => {
    render(<${metadata.name} error="Test error" />);
  });
});
\`\`\`
`;
  }

  /**
   * Get component source code
   */
  private static async getComponentSource(filePath: string): Promise<string> {
    try {
      // Use fs to read the actual component file
      const fs = await import('fs');
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf-8');
      }
      
      // Fallback to mock component if file doesn't exist
      return `
        const Component = ({ loading, disabled, error, success, ...props }) => {
          const [isOpen, setIsOpen] = useState(false);
          const [value, setValue] = useState('');
          
          const handleClick = () => {
            setIsOpen(!isOpen);
          };
          
          return (
            <div 
              className={clsx(
                'border rounded-lg px-4 py-2',
                loading && 'animate-pulse opacity-50',
                disabled && 'opacity-50 cursor-not-allowed',
                error && 'border-red-500 text-red-600',
                success && 'border-green-500 text-green-600',
                isOpen && 'border-blue-500'
              )}
              onClick={handleClick}
            >
              {children}
            </div>
          );
        };
      `;
    } catch (error) {
      console.error('Failed to read component source:', error);
      return '';
    }
  }

  /**
   * Default states for components without clear state patterns
   */
  private static getDefaultStates(): ComponentState[] {
    return [
      {
        name: 'idle',
        description: 'Component in default/idle state',
        triggers: ['initial render'],
        transitions: [],
        cssClasses: ['border', 'rounded-lg'],
        props: {}
      },
      {
        name: 'interactive',
        description: 'Component ready for user interaction',
        triggers: ['hover', 'focus'],
        transitions: [],
        cssClasses: ['hover:bg-gray-50', 'focus:border-dashed'],
        props: {}
      }
    ];
  }
}

/**
 * Generate live component state testing interface
 */
export class ComponentStateTester {
  
  static generateStateTestingInterface(stateMachine: ComponentStateMachine): string {
    return `
## 🧪 Live State Testing

<StateTestingPanel component="${stateMachine.componentName}">

### Current State: \`idle\`

**Available Actions:**
${stateMachine.states.map(state => `
- **${state.name}**: ${state.description}
  - Triggers: ${state.triggers.join(', ')}
  - CSS: \`${state.cssClasses.join(' ')}\`
`).join('')}

**State Transitions:**
\`\`\`mermaid
${stateMachine.mermaidDiagram}
\`\`\`

</StateTestingPanel>
    `.trim();
  }
}