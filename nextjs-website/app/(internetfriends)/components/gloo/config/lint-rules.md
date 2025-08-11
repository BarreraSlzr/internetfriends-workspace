# Gloo System Lint Rules

## Purpose
Prevent API drift and maintain "steadiest addressability" by flagging problematic prop patterns that lead to over-configuration and instability.

## ESLint Custom Rule: No Adjective Props

### Rule Configuration
Add to your `.eslintrc.js` or `eslint.config.mjs`:

```javascript
module.exports = {
  rules: {
    'gloo/no-adjective-props': 'error'
  }
};
```

### Custom Rule Implementation
Create `eslint-plugin-gloo/rules/no-adjective-props.js`:

```javascript
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent adjective-based props that lead to over-configuration',
      category: 'Best Practices',
    },
    schema: [],
    messages: {
      adjectiveProp: 'Prop "{{propName}}" uses adjective pattern. Use descriptive, function-oriented names instead.',
      removedProp: 'Prop "{{propName}}" was removed from GlooCanvasAtomic. Remove from call site.',
    },
  },
  create(context) {
    const ADJECTIVE_PATTERNS = [
      /^(auto|random|fancy|smart|advanced|enhanced|super|ultra|mega|mini|micro)/i,
      /^(simple|complex|basic|premium|pro|lite|full)/i,
      /(Mode|Config|Strategy|Style|Type)$/i,
    ];
    
    const REMOVED_PROPS = [
      'randomEffect',
      'autoEffectCycle',
      'autoRegeneratePalette',
      'fancyTransitions',
      'smartResize',
    ];
    
    return {
      JSXAttribute(node) {
        const propName = node.name.name;
        
        // Check for removed props
        if (REMOVED_PROPS.includes(propName)) {
          context.report({
            node,
            messageId: 'removedProp',
            data: { propName },
          });
          return;
        }
        
        // Check for adjective patterns
        const hasAdjectivePattern = ADJECTIVE_PATTERNS.some(pattern => 
          pattern.test(propName)
        );
        
        if (hasAdjectivePattern) {
          context.report({
            node,
            messageId: 'adjectiveProp',
            data: { propName },
          });
        }
      },
    };
  },
};
```

## TypeScript Lint Rule: Interface Prop Count

### Rule: Maximum 7 Props Per Interface
Add to `typescript-eslint` configuration:

```javascript
rules: {
  '@typescript-eslint/interface-name-prefix': 'off',
  'gloo/max-interface-props': ['error', { max: 7 }],
}
```

### Custom Rule Implementation
Create `eslint-plugin-gloo/rules/max-interface-props.js`:

```javascript
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Limit interface props to prevent over-configuration',
      category: 'Best Practices',
    },
    schema: [
      {
        type: 'object',
        properties: {
          max: { type: 'integer', minimum: 1 },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      tooManyProps: 'Interface "{{interfaceName}}" has {{count}} props (max: {{max}}). Consider using centralized defaults.',
    },
  },
  create(context) {
    const options = context.options[0] || {};
    const maxProps = options.max || 7;
    
    return {
      TSInterfaceDeclaration(node) {
        if (!node.id.name.includes('Gloo')) return;
        
        const propCount = node.body.body.length;
        
        if (propCount > maxProps) {
          context.report({
            node,
            messageId: 'tooManyProps',
            data: {
              interfaceName: node.id.name,
              count: propCount,
              max: maxProps,
            },
          });
        }
      },
    };
  },
};
```

## Pre-commit Hook

### Git Hook Script
Create `.git/hooks/pre-commit`:

```bash
#!/bin/sh
# Gloo System Quality Gates

echo "🎭 Running Gloo system checks..."

# Check for adjective props in Gloo components
if git diff --cached --name-only | grep -E "gloo|Gloo" | xargs grep -l "random\|auto\|fancy\|smart" 2>/dev/null; then
  echo "❌ Found adjective props in Gloo components"
  echo "Use descriptive, function-oriented prop names instead"
  exit 1
fi

# Check for removed props still being passed
if git diff --cached --name-only | grep -E "\.(tsx?|jsx?)$" | xargs grep -l "randomEffect\|autoEffectCycle" 2>/dev/null; then
  echo "❌ Found usage of removed Gloo props"
  echo "These props were removed: randomEffect, autoEffectCycle"
  echo "Remove them from component call sites"
  exit 1
fi

# Check for multiple Gloo background components in same file
if git diff --cached --name-only | xargs grep -l -E "(GlooClient.*GlooBackground|GlooBackground.*GlooClient)" 2>/dev/null; then
  echo "❌ Multiple Gloo background components detected"
  echo "Use only GlooClient for consistency"
  exit 1
fi

echo "✅ Gloo system checks passed"
```

## VS Code Settings

### Workspace Settings
Add to `.vscode/settings.json`:

```json
{
  "eslint.rules.customizations": [
    {
      "rule": "gloo/no-adjective-props",
      "severity": "error"
    },
    {
      "rule": "gloo/max-interface-props", 
      "severity": "warn"
    }
  ],
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## Test Cases

### Valid Props (Should Pass)
```typescript
// ✅ Good: descriptive, function-oriented
interface GlooProps {
  speed: number;
  resolution: number; 
  effectIndex: number;
  palette: GlooPalette;
  disabled: boolean;
}
```

### Invalid Props (Should Fail)
```typescript
// ❌ Bad: adjective-based, over-configured
interface BadGlooProps {
  randomEffect: boolean;        // Removed prop
  autoEffectCycle: boolean;     // Removed prop  
  fancyTransitions: boolean;    // Adjective pattern
  smartResize: boolean;         // Adjective pattern
  advancedMode: string;         // Adjective pattern
  complexConfig: object;        // Adjective pattern
}
```

## Integration with Epic Tools

### Epic Completion Gate
Add to `scripts/epic-tools/epic-complete.sh`:

```bash
# Check for Gloo system compliance before epic completion
echo "🎭 Validating Gloo system compliance..."

if find . -name "*.tsx" -exec grep -l "randomEffect\|autoEffectCycle" {} \; | head -1; then
  echo "❌ Epic cannot complete: Legacy Gloo props detected"
  echo "Run: npm run lint:gloo:fix"
  exit 1
fi

if [ $(find . -name "*Gloo*.tsx" | wc -l) -gt 5 ]; then
  echo "⚠️  Warning: Multiple Gloo components detected"
  echo "Consider consolidating to GlooClient only"
fi
```

## Automation Scripts

### Fix Script
Create `scripts/gloo-migration.sh`:

```bash
#!/bin/bash
# Automated migration from legacy Gloo props

echo "🔧 Migrating legacy Gloo props..."

# Remove obsolete props
find . -name "*.tsx" -exec sed -i 's/randomEffect={[^}]*}//g' {} \;
find . -name "*.tsx" -exec sed -i 's/autoEffectCycle={[^}]*}//g' {} \;

# Replace deprecated components
find . -name "*.tsx" -exec sed -i 's/GlooBackgroundSimple/GlooClient/g' {} \;
find . -name "*.tsx" -exec sed -i 's/GlooIntegrationSimple/GlooClient/g' {} \;

echo "✅ Migration complete. Run 'npm run lint' to verify."
```

## Enforcement Levels

### Level 1: Warnings (Development)
- Adjective props trigger warnings
- Multiple backgrounds warn but don't block

### Level 2: Errors (CI/CD) 
- Removed props cause build failures
- Interface prop count exceeded fails CI

### Level 3: Blocked (Epic Completion)
- Any non-compliant code blocks epic completion
- Forces cleanup before release