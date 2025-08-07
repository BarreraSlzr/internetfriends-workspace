#!/usr/bin/env bun

/**
 * Fix React Prop Warnings Script - InternetFriends
 * Removes underscore prefixes from DOM props and fixes undefined href values
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import path from 'path';

interface FixStats {
  filesProcessed: number;
  fixesApplied: number;
  errors: string[];
}

const stats: FixStats = {
  filesProcessed: 0,
  fixesApplied: 0,
  errors: []
};

// React DOM props that shouldn't have underscores
const domPropFixes = [
  // Common DOM attributes
  { pattern: /_className=/g, replacement: 'className=' },
  { pattern: /_onClick=/g, replacement: 'onClick=' },
  { pattern: /_onChange=/g, replacement: 'onChange=' },
  { pattern: /_onSubmit=/g, replacement: 'onSubmit=' },
  { pattern: /_onFocus=/g, replacement: 'onFocus=' },
  { pattern: /_onBlur=/g, replacement: 'onBlur=' },
  { pattern: /_onMouseEnter=/g, replacement: 'onMouseEnter=' },
  { pattern: /_onMouseLeave=/g, replacement: 'onMouseLeave=' },
  { pattern: /_href=/g, replacement: 'href=' },
  { pattern: /_src=/g, replacement: 'src=' },
  { pattern: /_alt=/g, replacement: 'alt=' },
  { pattern: /_title=/g, replacement: 'title=' },
  { pattern: /_id=/g, replacement: 'id=' },
  { pattern: /_type=/g, replacement: 'type=' },
  { pattern: /_value=/g, replacement: 'value=' },
  { pattern: /_placeholder=/g, replacement: 'placeholder=' },
  { pattern: /_disabled=/g, replacement: 'disabled=' },
  { pattern: /_required=/g, replacement: 'required=' },
  { pattern: /_name=/g, replacement: 'name=' },
  { pattern: /_role=/g, replacement: 'role=' },
  { pattern: /_tabIndex=/g, replacement: 'tabIndex=' },
  { pattern: /_target=/g, replacement: 'target=' },
  { pattern: /_rel=/g, replacement: 'rel=' },
  { pattern: /_referrerPolicy=/g, replacement: 'referrerPolicy=' },

  // ARIA attributes
  { pattern: /aria-_([a-z]+)=/g, replacement: 'aria-$1=' },
  { pattern: /_aria-([a-z]+)=/g, replacement: 'aria-$1=' },

  // Data attributes
  { pattern: /data-_([a-z-]+)=/g, replacement: 'data-$1=' },
  { pattern: /_data-([a-z-]+)=/g, replacement: 'data-$1=' },
];

// Specific content fixes for href values
const contentFixes = [
  // Fix mailto links
  { pattern: /_mailto:/g, replacement: 'mailto:' },
  { pattern: /href=['"]_mailto:/g, replacement: 'href="mailto:' },

  // Fix tel links
  { pattern: /_tel:/g, replacement: 'tel:' },
  { pattern: /href=['"]_tel:/g, replacement: 'href="tel:' },

  // Fix http/https links
  { pattern: /_https?:/g, replacement: (match: string) => match.substring(1) },
  { pattern: /href=['"]_https?:/g, replacement: (match: string) => match.replace('_', '') },
];

// Fix missing keys in map iterations
const keyFixes = [
  {
    pattern: /\.map\(\(([^,]+),\s*([^)]+)\)\s*=>\s*\(\s*<([^>]+)(?!\s+key=)/g,
    replacement: (match: string, item: string, index: string, tag: string) => {
      // Only add key if it's not already present
      if (!match.includes('key=')) {
        return match.replace(`<${tag}`, `<${tag} key={${index}}`);
      }
      return match;
    },
    description: 'Add missing keys to mapped elements'
  }
];

/**
 * Apply fixes to a single file
 */
function fixFile(filePath: string): number {
  try {
    let content = readFileSync(filePath, 'utf-8');
    let fixCount = 0;
    const originalContent = content;

    // Apply DOM prop fixes
    for (const fix of domPropFixes) {
      const before = content;
      content = content.replace(fix.pattern, fix.replacement);
      if (content !== before) {
        fixCount++;
      }
    }

    // Apply content fixes
    for (const fix of contentFixes) {
      const before = content;
      if (typeof fix.replacement === 'function') {
        content = content.replace(fix.pattern, fix.replacement);
      } else {
        content = content.replace(fix.pattern, fix.replacement);
      }
      if (content !== before) {
        fixCount++;
      }
    }

    // Fix JSX key issues
    const keyBefore = content;

    // More comprehensive key fix pattern
    content = content.replace(
      /\.map\(\(([^,)]+)(?:,\s*([^)]+))?\)\s*=>\s*(?:\(|\s)*(<[^>]*?)(?!\s+key\s*=)([^>]*>)/g,
      (match, item, index, openTag, rest) => {
        const indexVar = index || 'index';
        return match.replace(openTag, `${openTag} key={${indexVar}}`);
      }
    );

    // Fix specific patterns like {items.map((item, index) => <Component ...>)}
    content = content.replace(
      /\{[^}]*\.map\(\(([^,)]+)(?:,\s*([^)]+))?\)\s*=>\s*<([^>\s]+)(?![^>]*key\s*=)([^>]*)>/g,
      (match, item, index, component, props) => {
        const indexVar = index || 'index';
        return match.replace(`<${component}${props}>`, `<${component} key={${indexVar}}${props}>`);
      }
    );

    if (content !== keyBefore) {
      fixCount++;
    }

    // Fix empty string src attributes
    const srcBefore = content;
    content = content.replace(
      /src\s*=\s*['"]{2}|src\s*=\s*\{['"]{2}\}/g,
      'src={null}'
    );
    if (content !== srcBefore) {
      fixCount++;
    }

    // Fix value without onChange (make controlled components)
    const valueBefore = content;
    content = content.replace(
      /(<input[^>]+value\s*=\s*[^>]+)(?![^>]*onChange)([^>]*>)/g,
      (match, beforeValue, afterValue) => {
        if (!match.includes('readOnly') && !match.includes('onChange')) {
          return match.replace(afterValue, ` onChange={() => {}}${afterValue}`);
        }
        return match;
      }
    );
    if (content !== valueBefore) {
      fixCount++;
    }

    // Write back if changes were made
    if (content !== originalContent) {
      writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ Fixed ${fixCount} React prop issues in ${path.relative(process.cwd(), filePath)}`);
    }

    return fixCount;
  } catch (error) {
    const errorMsg = `Failed to process ${filePath}: ${error}`;
    stats.errors.push(errorMsg);
    console.error(`❌ ${errorMsg}`);
    return 0;
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🔧 InternetFriends React Props Fix\n');

  const patterns = [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}'
  ];

  const files: string[] = [];

  for (const pattern of patterns) {
    const matches = await glob(pattern, { ignore: ['node_modules/**', '.next/**'] });
    files.push(...matches);
  }

  console.log(`📁 Found ${files.length} files to process\n`);

  for (const file of files) {
    const fixes = fixFile(file);
    stats.filesProcessed++;
    stats.fixesApplied += fixes;
  }

  // Summary
  console.log('\n========================================');
  console.log('🎯 REACT PROPS FIX SUMMARY');
  console.log('========================================');
  console.log(`📄 Files processed: ${stats.filesProcessed}`);
  console.log(`🔧 Total fixes applied: ${stats.fixesApplied}`);

  if (stats.errors.length > 0) {
    console.log(`❌ Errors encountered: ${stats.errors.length}`);
    stats.errors.forEach(error => console.log(`   • ${error}`));
  }

  console.log('========================================\n');

  if (stats.fixesApplied > 0) {
    console.log('💡 Fixed issues:');
    console.log('   • Removed underscore prefixes from DOM props');
    console.log('   • Fixed mailto: and tel: href values');
    console.log('   • Added missing keys to mapped elements');
    console.log('   • Fixed empty src attributes');
    console.log('   • Added onChange handlers to controlled inputs');
    console.log('\n📝 Next steps:');
    console.log('   • Test the application for any regressions');
    console.log('   • Run the development server to verify fixes');
    console.log('   • Check console for remaining warnings');
  } else {
    console.log('✨ No React prop issues found to fix automatically');
  }

  console.log('\n🌐 Test your fixes:');
  console.log('   • http://localhost:3001 - Main application');
  console.log('   • Check browser console for warnings');
}

// Execute if run directly
if (import.meta.main) {
  main().catch(console.error);
}

export { fixFile, domPropFixes, contentFixes };
