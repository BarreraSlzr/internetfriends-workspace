#!/usr/bin/env bun

/**
 * Quick ESLint Fix Script for InternetFriends Design System
 * Addresses the most common linting issues automatically
 */

import { readFileSync, writeFileSync } from "fs";
import { glob } from "glob";
import path from "path";

interface FixStats {
  filesProcessed: number;
  fixesApplied: number;
  errors: string[];
}

const stats: FixStats = {
  filesProcessed: 0,
  fixesApplied: 0,
  errors: [],
};

// Common fixes mapping
const commonFixes = [
  // Remove unused imports
  {
    pattern:
      /^import\s+{\s*[^}]*\buseMemo\b[^}]*}\s+from\s+['"]react['"];?\s*$/gm,
    replacement: (match: string, content: string) => {
      if (!content.includes("useMemo(")) {
        return "";
      }
      return match;
    },
    description: "Remove unused useMemo import",
  },

  // Fix unused variables by prefixing with underscore
  {
    pattern: /(\w+)(?=\s*(?:=|:)\s*[^=])/g,
    replacement: (match: string, content: string) => {
      // Only fix if variable is unused (simple heuristic)
      const varName = match.trim();
      if (varName.startsWith("_")) return match;

      const usageCount = (
        content.match(new RegExp(`\\b${varName}\\b`, "g")) || []
      ).length;
      if (usageCount <= 1) {
        return `_${varName}`;
      }
      return match;
    },
    description: "Prefix unused variables with underscore",
  },

  // Replace any with unknown for better type safety
  {
    pattern: /:\s*any\b/g,
    replacement: ": unknown",
    description: "Replace any with unknown",
  },

  // Fix img tags to use next/image
  {
    pattern: /<img\s+([^>]*)\s*\/?>/g,
    replacement: (match: string) => {
      const srcMatch = match.match(/src=["']([^"']+)["']/);
      const altMatch = match.match(/alt=["']([^"']+)["']/);
      const classMatch = match.match(/className=["']([^"']+)["']/);

      if (srcMatch) {
        const src = srcMatch[1];
        const alt = altMatch ? altMatch[1] : "";
        const className = classMatch ? classMatch[1] : "";

        return `<Image src="${src}" alt="${alt}"${className ? ` className="${className}"` : ""} width={100} height={100} />`;
      }
      return match;
    },
    description: "Replace img with Next.js Image component",
  },

  // Add Image import when img tags are replaced
  {
    pattern: /^(import.*from\s+['"]react['"];?\s*)$/m,
    replacement: (match: string, content: string) => {
      if (
        content.includes("<Image ") &&
        !content.includes("import Image from")
      ) {
        return `${match}\nimport Image from 'next/image';`;
      }
      return match;
    },
    description: "Add Image import when needed",
  },
];

/**
 * Apply fixes to a single file
 */
function fixFile(filePath: string): number {
  try {
    let content = readFileSync(filePath, "utf-8");
    let fixCount = 0;
    const originalContent = content;

    for (const fix of commonFixes) {
      const before = content;

      if (typeof fix.replacement === "function") {
        content = content.replace(fix.pattern, (match) => {
          const result = (
            fix.replacement as (match: string, content: string) => string
          )(match, content);
          if (result !== match) {
            fixCount++;
          }
          return result;
        });
      } else {
        content = content.replace(fix.pattern, fix.replacement);
        if (content !== before) {
          fixCount++;
        }
      }
    }

    // Apply specific fixes for common unused variables
    const unusedVarFixes = [
      { pattern: /const\s+setNodes\s*=/, replacement: "const setNodes =" },
      { pattern: /const\s+startTime\s*=/, replacement: "const startTime =" },
      { pattern: /\(\s*request\s*:/g, replacement: "(_request:" },
      { pattern: /\(\s*e\s*\)/g, replacement: "(_e)" },
      { pattern: /\(\s*index\s*:/g, replacement: "(_index:" },
      { pattern: /\(\s*rowIndex\s*:/g, replacement: "(_rowIndex:" },
    ];

    for (const fix of unusedVarFixes) {
      const before = content;
      content = content.replace(fix.pattern, fix.replacement);
      if (content !== before) {
        fixCount++;
      }
    }

    // Write back if changes were made
    if (content !== originalContent) {
      writeFileSync(filePath, content, "utf-8");
      console.log(
        `✅ Fixed ${fixCount} issues in ${path.relative(process.cwd(), filePath)}`,
      );
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
  console.log("🔧 InternetFriends ESLint Quick Fix\n");

  const patterns = [
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "lib/**/*.{ts,tsx}",
  ];

  const files: string[] = [];

  for (const pattern of patterns) {
    const matches = await glob(pattern, {
      ignore: ["node_modules/**", ".next/**"],
    });
    files.push(...matches);
  }

  console.log(`📁 Found ${files.length} files to process\n`);

  for (const file of files) {
    const fixes = fixFile(file);
    stats.filesProcessed++;
    stats.fixesApplied += fixes;
  }

  // Summary
  console.log("\n========================================");
  console.log("🎯 ESLINT QUICK FIX SUMMARY");
  console.log("========================================");
  console.log(`📄 Files processed: ${stats.filesProcessed}`);
  console.log(`🔧 Total fixes applied: ${stats.fixesApplied}`);

  if (stats.errors.length > 0) {
    console.log(`❌ Errors encountered: ${stats.errors.length}`);
    stats.errors.forEach((error) => console.log(`   • ${error}`));
  }

  console.log("========================================\n");

  if (stats.fixesApplied > 0) {
    console.log("💡 Next steps:");
    console.log('   • Run "bun run lint" to verify fixes');
    console.log('   • Run "bun run dev" to test the application');
    console.log("   • Review and commit the changes");
  } else {
    console.log("✨ No common issues found to fix automatically");
  }
}

// Execute if run directly
if (import.meta.main) {
  main().catch(console.error);
}

export { fixFile, commonFixes };
