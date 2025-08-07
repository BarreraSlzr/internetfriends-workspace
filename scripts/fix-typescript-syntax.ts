#!/usr/bin/env bun

// Quick TypeScript syntax fix script for InternetFriends project

import { readFileSync, writeFileSync } from "fs";
import { glob } from "glob";

interface FixRule {
  pattern: RegExp;
  replacement: string;
  description: string;
}

const fixRules: FixRule[] = [
  // Fix Record<string, any> syntax
  {
    pattern: /Record\s+string,\s*([^>]+)>/g,
    replacement: 'Record<string, $1>',
    description: 'Fix Record type syntax'
  },
  // Fix Set<string> syntax
  {
    pattern: /Set\s+string>/g,
    replacement: 'Set<string>',
    description: 'Fix Set type syntax'
  },
  // Fix Pick<T, K> syntax
  {
    pattern: /Pick\s+([^,]+),\s*([^>]+)>/g,
    replacement: 'Pick<$1, $2>',
    description: 'Fix Pick type syntax'
  },
  // Fix JSX key/onClick attribute order
  {
    pattern: /onClick\s+key=\{([^}]+)\}=\{([^}]+)\}/g,
    replacement: 'key={$1} onClick={$2}',
    description: 'Fix JSX attribute order'
  },
  // Fix JSX className key syntax
  {
    pattern: /className\s+key=\{([^}]+)\}=\{([^}]+)\}/g,
    replacement: 'key={$1} className={$2}',
    description: 'Fix JSX className key syntax'
  },
  // Fix value key syntax
  {
    pattern: /value\s+key=\{([^}]+)\}=\{([^}]+)\}/g,
    replacement: 'key={$1} value={$2}',
    description: 'Fix JSX value key syntax'
  },
  // Fix motion.div duplication
  {
    pattern: /motion\.div\s+motion\.div/g,
    replacement: 'motion.div',
    description: 'Fix motion.div duplication'
  },
  // Fix template literal in JSX
  {
    pattern: /className\s*=\s*\{`\s*\$\{([^}]+)\}\s*([^`]*)`\}/g,
    replacement: 'className={`${$1}$2`}',
    description: 'Fix template literal className'
  },
  // Fix broken template literals
  {
    pattern: /className\s+key=\{([^}]+)\}=\{`([^`]*)`\}/g,
    replacement: 'key={$1} className={`$2`}',
    description: 'Fix broken template literal'
  }
];

class TypeScriptSyntaxFixer {
  private filesFixed = 0;
  private errorsFixed = 0;

  async run(): Promise<void> {
    console.log('🔧 InternetFriends TypeScript Syntax Fixer');
    console.log('==========================================\n');

    try {
      const files = await this.findTypeScriptFiles();
      console.log(`📁 Found ${files.length} TypeScript/TSX files\n`);

      for (const file of files) {
        await this.fixFile(file);
      }

      this.showSummary();
    } catch (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  }

  private async findTypeScriptFiles(): Promise<string[]> {
    const patterns = [
      'app/**/*.ts',
      'app/**/*.tsx',
      'components/**/*.ts',
      'components/**/*.tsx',
      'shared/**/*.ts',
      'shared/**/*.tsx',
    ];

    const allFiles: string[] = [];
    for (const pattern of patterns) {
      const files = glob.sync(pattern, {
        ignore: [
          '**/*.d.ts',
          '**/node_modules/**',
          '**/.next/**',
          '**/dist/**',
        ]
      });
      allFiles.push(...files);
    }

    return [...new Set(allFiles)]; // Remove duplicates
  }

  private async fixFile(filePath: string): Promise<void> {
    try {
      const content = readFileSync(filePath, 'utf-8');
      let fixedContent = content;
      let fileErrors = 0;

      // Apply all fix rules
      for (const rule of fixRules) {
        const matches = fixedContent.match(rule.pattern);
        if (matches) {
          fixedContent = fixedContent.replace(rule.pattern, rule.replacement);
          fileErrors += matches.length;
          console.log(`   ✓ ${rule.description}: ${matches.length} fixes`);
        }
      }

      // Additional manual fixes for common patterns
      fixedContent = this.applyManualFixes(fixedContent);

      // Only write if changes were made
      if (fixedContent !== content) {
        writeFileSync(filePath, fixedContent);
        this.filesFixed++;
        this.errorsFixed += fileErrors;
        console.log(`🔧 Fixed: ${filePath} (${fileErrors} errors)`);
      }
    } catch (error) {
      console.warn(`⚠️  Could not fix ${filePath}:`, error);
    }
  }

  private applyManualFixes(content: string): string {
    let fixed = content;

    // Fix specific broken JSX patterns
    fixed = fixed.replace(
      /<className key=\{([^}]+)\}=\{`([^`]*)`\}/g,
      '<div key={$1} className={`$2`}'
    );

    // Fix motion.div key issues
    fixed = fixed.replace(
      /<motion\.div key=\{([^}]+)\} motion\.div/g,
      '<motion.div key={$1}'
    );

    // Fix generic type parameters
    fixed = fixed.replace(/useState<([^<>]+)<([^>]+)>>/, 'useState<$1<$2>>');

    // Fix broken JSX closing tags
    fixed = fixed.replace(/\s*>\s*\{`[^`]*`\}\s*>/g, '>');

    return fixed;
  }

  private showSummary(): void {
    console.log('\n📊 Summary');
    console.log('===========');
    console.log(`📁 Files processed: ${this.filesFixed}`);
    console.log(`🔧 Errors fixed: ${this.errorsFixed}`);

    if (this.filesFixed > 0) {
      console.log('\n✅ TypeScript syntax has been fixed!');
      console.log('🎯 You can now run: bun run typecheck');
    } else {
      console.log('\n✨ No syntax errors found!');
    }
  }
}

// Parse command line arguments




// Run the fixer
async function main() {
  const fixer = new TypeScriptSyntaxFixer();
  await fixer.run();
}

if (import.meta.main) {
  main().catch(error => {
    console.error('Fixer failed:', error);
    process.exit(1);
  });
}
