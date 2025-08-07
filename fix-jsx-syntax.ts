#!/usr/bin/env bun

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

interface JSXFix {
  pattern: RegExp;
  replacement: string;
  description: string;
}

const JSX_FIXES: JSXFix[] = [
  {
    pattern: /< key=\{[^}]+\}([a-zA-Z][a-zA-Z0-9]*)/g,
    replacement: '<$1',
    description: 'Fix malformed opening tags with key attributes'
  },
  {
    pattern: /\{[^}]+\}/g,
    replacement: '',
    description: 'Remove duplicate _key attributes'
  },
  {
    pattern: /hover:/g,
    replacement: 'hover:',
    description: 'Fix hover: CSS classes'
  },
  {
    pattern: /variant=/g,
    replacement: 'variant=',
    description: 'Fix _variant attributes'
  },
  {
    pattern: /onChange=/g,
    replacement: 'onChange=',
    description: 'Fix _onChange attributes'
  },
  {
    pattern: /onSubmit=/g,
    replacement: 'onSubmit=',
    description: 'Fix _onSubmit attributes'
  },
  {
    pattern: /className=/g,
    replacement: 'className=',
    description: 'Fix _className attributes'
  },
  {
    pattern: /whileHover=/g,
    replacement: 'whileHover=',
    description: 'Fix _whileHover Framer Motion attributes'
  },
  {
    pattern: /whileTap=/g,
    replacement: 'whileTap=',
    description: 'Fix _whileTap Framer Motion attributes'
  },
  {
    pattern: /delay:/g,
    replacement: 'delay:',
    description: 'Fix _delay in motion properties'
  },
  {
    pattern: /style=/g,
    replacement: 'style=',
    description: 'Fix _style attributes'
  },
  {
    pattern: /active/g,
    replacement: 'active',
    description: 'Fix active CSS classes'
  },
  {
    pattern: /clickable/g,
    replacement: 'clickable',
    description: 'Fix clickable CSS classes'
  },
  {
    pattern: /< key=\{[^}]+\}([A-Z][a-zA-Z0-9]*)/g,
    replacement: '<$1',
    description: 'Fix malformed component tags with key attributes'
  },
  {
    pattern: /< key=\{[^}]+, [^}]+\}([a-zA-Z][a-zA-Z0-9]*)/g,
    replacement: '<$1',
    description: 'Fix malformed tags with complex key expressions'
  },
  {
    pattern: /(_e\)) => \{/g,
    replacement: '(e) => {',
    description: 'Fix parameter names in arrow functions'
  }
];

async function getAllTSXFiles(dir: string): Promise<string[]> {
  const files: string[] = [];

  async function scanDirectory(currentDir: string) {
    try {
      const entries = await readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(currentDir, entry.name);

        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await scanDirectory(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not scan directory ${currentDir}:`, error);
    }
  }

  await scanDirectory(dir);
  return files;
}

async function fixFile(filePath: string): Promise<{ fixed: boolean; fixCount: number }> {
  try {
    let content = await readFile(filePath, 'utf8');
    const originalContent = content;
    let fixCount = 0;

    for (const fix of JSX_FIXES) {
      const matches = content.match(fix.pattern);
      if (matches) {
        content = content.replace(fix.pattern, fix.replacement);
        fixCount += matches.length;
        console.log(`  ✓ Applied: ${fix.description} (${matches.length} fixes)`);
      }
    }

    // Additional complex fixes that need special handling

    // Fix key attributes that got separated
    content = content.replace(/key=\{([^}]+)\}\s+([a-zA-Z][a-zA-Z0-9]*)/g, (match, keyValue, tagName) => {
      return `<${tagName} key={${keyValue}}`;
    });

    // Fix SelectItem and other components with malformed opening tags
    content = content.replace(/< key=\{[^}]+\}([A-Z][a-zA-Z0-9]*)/g, '<$1');

    // Fix React.Fragment with complex keys
    content = content.replace(/< key=\{[^}]+\}React\.Fragment/g, '<React.Fragment');

    if (content !== originalContent) {
      await writeFile(filePath, content, 'utf8');
      return { fixed: true, fixCount };
    }

    return { fixed: false, fixCount: 0 };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return { fixed: false, fixCount: 0 };
  }
}

async function main() {
  const startDir = process.argv[2] || './nextjs-website';

  console.log(`🔧 Fixing JSX syntax errors in ${startDir}...`);
  console.log('');

  const tsxFiles = await getAllTSXFiles(startDir);
  console.log(`Found ${tsxFiles.length} TypeScript/TSX files to process`);
  console.log('');

  let totalFixed = 0;
  let totalFixes = 0;

  for (const file of tsxFiles) {
    const relativePath = file.replace(process.cwd() + '/', '');
    console.log(`Processing: ${relativePath}`);

    const result = await fixFile(file);

    if (result.fixed) {
      console.log(`  ✅ Fixed with ${result.fixCount} changes`);
      totalFixed++;
      totalFixes += result.fixCount;
    } else {
      console.log(`  ➖ No changes needed`);
    }

    console.log('');
  }

  console.log('🎉 JSX Syntax Fix Complete!');
  console.log(`Files processed: ${tsxFiles.length}`);
  console.log(`Files fixed: ${totalFixed}`);
  console.log(`Total fixes applied: ${totalFixes}`);

  if (totalFixed > 0) {
    console.log('\n✨ Ready to build! Try running: bun run build');
  } else {
    console.log('\n✨ All files were already clean!');
  }
}

if (import.meta.main) {
  main().catch(console.error);
}
