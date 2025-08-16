#!/usr/bin/env bun

/**
 * Critical Issues Cleanup Script
 * Fixes the most pressing issues for development stability
 */

import { readFileSync, writeFileSync } from "fs";
import { glob } from "glob";

interface CleanupStats {
  filesProcessed: number;
  generateStampRemoved: number;
  unusedImportsRemoved: number;
  unusedExpressionsRemoved: number;
}

class CodeCleaner {
  private stats: CleanupStats = {
    filesProcessed: 0,
    generateStampRemoved: 0,
    unusedImportsRemoved: 0,
    unusedExpressionsRemoved: 0,
  };

  async cleanupCriticalIssues() {
    console.log("🧹 Starting critical issues cleanup...");

    // Get all TypeScript/TSX files
    const files = await glob("**/*.{ts,tsx}", {
      ignore: ["node_modules/**", ".next/**", "dist/**"],
    });

    console.log(`📁 Found ${files.length} files to process`);

    for (const file of files) {
      try {
        await this.processFile(file);
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error);
      }
    }

    this.printStats();
  }

  private async processFile(filePath: string) {
    let content = readFileSync(filePath, "utf-8");
    let modified = false;

    // Remove unused generateStamp imports and calls
    const generateStampPattern = /^const generateStamp = \w+\(\w+\);?\s*$/gm;
    if (generateStampPattern.test(content)) {
      content = content.replace(generateStampPattern, "");
      this.stats.generateStampRemoved++;
      modified = true;
    }

    // Remove import lines with generateStamp
    const generateStampImportPattern =
      /^import { generateStamp } from[^;]+;\s*$/gm;
    if (generateStampImportPattern.test(content)) {
      content = content.replace(generateStampImportPattern, "");
      modified = true;
    }

    // Remove standalone generateStamp expressions
    const generateStampExpressionPattern = /^\s*generateStamp;\s*$/gm;
    if (generateStampExpressionPattern.test(content)) {
      content = content.replace(generateStampExpressionPattern, "");
      this.stats.unusedExpressionsRemoved++;
      modified = true;
    }

    // Clean up extra empty lines
    content = content.replace(/\n\n\n+/g, "\n\n");

    if (modified) {
      writeFileSync(filePath, content);
      console.log(`✅ Cleaned: ${filePath}`);
    }

    this.stats.filesProcessed++;
  }

  private printStats() {
    console.log("\n📊 Cleanup Summary:");
    console.log(`   Files processed: ${this.stats.filesProcessed}`);
    console.log(
      `   generateStamp calls removed: ${this.stats.generateStampRemoved}`,
    );
    console.log(
      `   Unused expressions removed: ${this.stats.unusedExpressionsRemoved}`,
    );
    console.log("✨ Critical cleanup complete!");
  }
}

// Run cleanup
const cleaner = new CodeCleaner();
cleaner.cleanupCriticalIssues().catch(console.error);
