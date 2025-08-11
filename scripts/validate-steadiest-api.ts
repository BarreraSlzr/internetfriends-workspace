#!/usr/bin/env bun
/**
 * validate-steadiest-api.ts - CLI Tool for Steadiest Addressability API Validation
 *
 * Validates components against "Steadiest Addressability Agency" patterns:
 * 1. Minimal configuration surface (≤8 props recommended)
 * 2. No banned patterns (strategy props, micro-config, config objects)
 * 3. Clear component boundaries
 * 4. Productive defaults usage
 * 5. Mature addressability (debuggable props)
 *
 * Usage:
 * bun scripts/validate-steadiest-api.ts
 * bun scripts/validate-steadiest-api.ts --fix
 * bun scripts/validate-steadiest-api.ts --component="GlooClient"
 * bun scripts/validate-steadiest-api.ts --epic="steadiest-addressability-v1"
 */

import { readdir, readFile, writeFile } from "fs/promises";
import { join, relative } from "path";
import { existsSync } from "fs";

// =====================================
// CONFIGURATION
// =====================================

interface ValidationConfig {
  maxProps: number;
  bannedPatterns: string[];
  requiredProps: string[];
  recommendedProps: string[];
  filePatterns: string[];
}

const CONFIG: ValidationConfig = {
  maxProps: 8,
  bannedPatterns: [
    "Strategy", // e.g., paletteStrategy, renderStrategy
    "Mode", // e.g., blendMode, renderMode (unless singular)
    /\w+\d+$/, // e.g., speed1, color1, size2
    "config", // nested config objects
    "Config", // nested config objects
    "Options", // options objects
    "Settings", // settings objects
  ],
  requiredProps: [], // Prefer zero required props
  recommendedProps: [
    "disabled",
    "className",
    "style",
    "data-testid",
  ],
  filePatterns: [
    "**/*.tsx",
    "**/*.ts",
    "!**/*.test.*",
    "!**/*.spec.*",
    "!**/node_modules/**",
  ],
};

// =====================================
// TYPES
// =====================================

interface ComponentProp {
  name: string;
  type: string;
  optional: boolean;
  defaultValue?: string;
  description?: string;
}

interface ComponentInterface {
  name: string;
  props: ComponentProp[];
  filePath: string;
  lineNumber: number;
}

interface ValidationResult {
  filePath: string;
  component: ComponentInterface;
  issues: ValidationIssue[];
  score: number;
  recommendations: string[];
}

interface ValidationIssue {
  type: "error" | "warning" | "info";
  rule: string;
  message: string;
  prop?: string;
  suggestion?: string;
}

// =====================================
// COMPONENT ANALYSIS
// =====================================

class ComponentAnalyzer {
  private componentRegex = /interface\s+(\w*Props)\s*{([^}]*)}/gs;
  private propRegex = /(\w+)\??:\s*([^;,\n]+);?\s*(?:\/\/\s*(.*))?/g;

  async analyzeFile(filePath: string): Promise<ComponentInterface[]> {
    try {
      const content = await readFile(filePath, "utf-8");
      const components: ComponentInterface[] = [];

      let match;
      while ((match = this.componentRegex.exec(content)) !== null) {
        const [fullMatch, interfaceName, propsBlock] = match;
        const lineNumber = this.getLineNumber(content, match.index!);

        const props = this.parseProps(propsBlock);

        components.push({
          name: interfaceName,
          props,
          filePath,
          lineNumber,
        });
      }

      return components;
    } catch (error) {
      console.warn(`⚠️  Failed to analyze ${filePath}:`, error);
      return [];
    }
  }

  private parseProps(propsBlock: string): ComponentProp[] {
    const props: ComponentProp[] = [];
    let propMatch;

    while ((propMatch = this.propRegex.exec(propsBlock)) !== null) {
      const [, propName, propType, comment] = propMatch;

      if (!propName || propName.trim() === "") continue;

      props.push({
        name: propName.trim(),
        type: propType.trim(),
        optional: propsBlock.includes(`${propName}?:`),
        description: comment?.trim(),
      });
    }

    return props;
  }

  private getLineNumber(content: string, index: number): number {
    return content.substring(0, index).split("\n").length;
  }
}

// =====================================
// VALIDATION RULES
// =====================================

class ValidationRules {
  validateComponent(component: ComponentInterface): ValidationResult {
    const issues: ValidationIssue[] = [];
    const recommendations: string[] = [];

    // Rule 1: Maximum props count
    if (component.props.length > CONFIG.maxProps) {
      issues.push({
        type: "error",
        rule: "max-props",
        message: `Component has ${component.props.length} props, max recommended is ${CONFIG.maxProps}`,
        suggestion: "Consider grouping related props or using presets",
      });
    }

    // Rule 2: Banned patterns
    CONFIG.bannedPatterns.forEach((pattern) => {
      component.props.forEach((prop) => {
        const isPatternMatch = typeof pattern === "string"
          ? prop.name.includes(pattern)
          : pattern.test(prop.name);

        if (isPatternMatch) {
          issues.push({
            type: "warning",
            rule: "banned-pattern",
            message: `Prop '${prop.name}' matches banned pattern '${pattern}'`,
            prop: prop.name,
            suggestion: "Consider using presets or productive defaults instead",
          });
        }
      });
    });

    // Rule 3: Missing recommended props
    CONFIG.recommendedProps.forEach((recommended) => {
      const hasRecommended = component.props.some(prop => prop.name === recommended);
      if (!hasRecommended) {
        recommendations.push(`Consider adding '${recommended}' prop for better addressability`);
      }
    });

    // Rule 4: Too many required props
    const requiredProps = component.props.filter(prop => !prop.optional);
    if (requiredProps.length > 2) {
      issues.push({
        type: "warning",
        rule: "too-many-required",
        message: `Component has ${requiredProps.length} required props, consider making more optional with defaults`,
        suggestion: "Use productive defaults to reduce required props",
      });
    }

    // Rule 5: Complex nested types
    component.props.forEach((prop) => {
      if (prop.type.includes("{") || prop.type.includes("Record<")) {
        issues.push({
          type: "info",
          rule: "complex-type",
          message: `Prop '${prop.name}' has complex nested type`,
          prop: prop.name,
          suggestion: "Consider flattening or using simple types",
        });
      }
    });

    // Calculate score (0-100)
    const errorCount = issues.filter(i => i.type === "error").length;
    const warningCount = issues.filter(i => i.type === "warning").length;
    const score = Math.max(0, 100 - (errorCount * 20) - (warningCount * 5));

    return {
      filePath: component.filePath,
      component,
      issues,
      score,
      recommendations,
    };
  }
}

// =====================================
// FILE DISCOVERY
// =====================================

class FileFinder {
  async findComponentFiles(rootPath: string): Promise<string[]> {
    const files: string[] = [];

    const searchPaths = [
      join(rootPath, "nextjs-website/app"),
      join(rootPath, "nextjs-website/components"),
      join(rootPath, "components"),
    ];

    for (const searchPath of searchPaths) {
      if (existsSync(searchPath)) {
        const foundFiles = await this.walkDirectory(searchPath);
        files.push(...foundFiles);
      }
    }

    return files.filter(file =>
      file.endsWith(".tsx") || file.endsWith(".ts")
    );
  }

  private async walkDirectory(dirPath: string): Promise<string[]> {
    const files: string[] = [];

    try {
      const entries = await readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);

        if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
          const subFiles = await this.walkDirectory(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile() && (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts"))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory might not exist or be accessible
    }

    return files;
  }
}

// =====================================
// REPORTING
// =====================================

class Reporter {
  generateReport(results: ValidationResult[]): string {
    const totalComponents = results.length;
    const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
    const averageScore = totalComponents > 0
      ? results.reduce((sum, r) => sum + r.score, 0) / totalComponents
      : 0;

    const errors = results.flatMap(r => r.issues.filter(i => i.type === "error"));
    const warnings = results.flatMap(r => r.issues.filter(i => i.type === "warning"));

    let report = `
🎭 STEADIEST ADDRESSABILITY API VALIDATION REPORT
================================================================

📊 SUMMARY
  • Components analyzed: ${totalComponents}
  • Total issues found: ${totalIssues}
  • Average score: ${averageScore.toFixed(1)}/100
  • Errors: ${errors.length}
  • Warnings: ${warnings.length}

`;

    // Top issues
    if (results.length > 0) {
      const topIssues = results
        .filter(r => r.issues.length > 0)
        .sort((a, b) => b.issues.length - a.issues.length)
        .slice(0, 10);

      report += `🚨 COMPONENTS NEEDING ATTENTION\n`;
      topIssues.forEach((result, index) => {
        const relativePath = relative(process.cwd(), result.filePath);
        report += `${index + 1}. ${result.component.name} (${relativePath})\n`;
        report += `   Score: ${result.score}/100, Issues: ${result.issues.length}, Props: ${result.component.props.length}\n`;

        result.issues.slice(0, 3).forEach(issue => {
          const icon = issue.type === "error" ? "❌" : issue.type === "warning" ? "⚠️" : "ℹ️";
          report += `   ${icon} ${issue.message}\n`;
        });

        if (result.issues.length > 3) {
          report += `   ... and ${result.issues.length - 3} more issues\n`;
        }
        report += `\n`;
      });
    }

    // Success stories
    const goodComponents = results.filter(r => r.score >= 90);
    if (goodComponents.length > 0) {
      report += `✅ COMPONENTS FOLLOWING STEADIEST PATTERNS\n`;
      goodComponents.slice(0, 5).forEach(result => {
        const relativePath = relative(process.cwd(), result.filePath);
        report += `  • ${result.component.name} (${relativePath}) - Score: ${result.score}/100\n`;
      });
      report += `\n`;
    }

    // Recommendations
    const allRecommendations = results.flatMap(r => r.recommendations);
    if (allRecommendations.length > 0) {
      const uniqueRecommendations = [...new Set(allRecommendations)];
      report += `💡 RECOMMENDATIONS\n`;
      uniqueRecommendations.slice(0, 5).forEach(rec => {
        report += `  • ${rec}\n`;
      });
    }

    return report;
  }

  printResult(result: ValidationResult): void {
    const relativePath = relative(process.cwd(), result.filePath);
    const scoreColor = result.score >= 90 ? "green" : result.score >= 70 ? "yellow" : "red";

    console.log(`\n📝 ${result.component.name} (${relativePath})`);
    console.log(`   Score: ${result.score}/100 | Props: ${result.component.props.length}/${CONFIG.maxProps}`);

    if (result.issues.length > 0) {
      result.issues.forEach(issue => {
        const icon = issue.type === "error" ? "❌" : issue.type === "warning" ? "⚠️" : "ℹ️";
        console.log(`   ${icon} ${issue.message}`);
        if (issue.suggestion) {
          console.log(`      💡 ${issue.suggestion}`);
        }
      });
    }

    if (result.recommendations.length > 0) {
      console.log(`   💭 Recommendations:`);
      result.recommendations.forEach(rec => {
        console.log(`      • ${rec}`);
      });
    }
  }
}

// =====================================
// MAIN CLI
// =====================================

class SteadiestAPIValidator {
  private analyzer = new ComponentAnalyzer();
  private validator = new ValidationRules();
  private finder = new FileFinder();
  private reporter = new Reporter();

  async run(args: string[]): Promise<void> {
    const options = this.parseArgs(args);

    console.log("🎭 Steadiest Addressability API Validator");
    console.log("==========================================");

    if (options.help) {
      this.printHelp();
      return;
    }

    const rootPath = process.cwd();
    const files = await this.finder.findComponentFiles(rootPath);

    if (files.length === 0) {
      console.log("❌ No component files found");
      return;
    }

    console.log(`📁 Found ${files.length} component files`);

    const allResults: ValidationResult[] = [];

    for (const file of files) {
      if (options.component && !file.includes(options.component)) {
        continue;
      }

      const components = await this.analyzer.analyzeFile(file);

      for (const component of components) {
        const result = this.validator.validateComponent(component);
        allResults.push(result);

        if (options.verbose) {
          this.reporter.printResult(result);
        }
      }
    }

    if (allResults.length === 0) {
      console.log("❌ No component interfaces found");
      return;
    }

    // Generate and print report
    const report = this.reporter.generateReport(allResults);
    console.log(report);

    // Exit with error code if issues found
    const hasErrors = allResults.some(r => r.issues.some(i => i.type === "error"));
    if (hasErrors && !options.ignoreErrors) {
      console.log("❌ Validation failed - components need attention");
      process.exit(1);
    } else {
      console.log("✅ Validation complete");
    }
  }

  private parseArgs(args: string[]): any {
    const options: any = {
      help: false,
      verbose: false,
      fix: false,
      component: null,
      epic: null,
      ignoreErrors: false,
    };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg === "--help" || arg === "-h") {
        options.help = true;
      } else if (arg === "--verbose" || arg === "-v") {
        options.verbose = true;
      } else if (arg === "--fix") {
        options.fix = true;
      } else if (arg === "--ignore-errors") {
        options.ignoreErrors = true;
      } else if (arg.startsWith("--component=")) {
        options.component = arg.split("=")[1];
      } else if (arg.startsWith("--epic=")) {
        options.epic = arg.split("=")[1];
      }
    }

    return options;
  }

  private printHelp(): void {
    console.log(`
Usage: bun scripts/validate-steadiest-api.ts [options]

Options:
  --help, -h           Show this help message
  --verbose, -v        Show detailed results for each component
  --fix                Attempt to auto-fix issues (future feature)
  --component=NAME     Only analyze components matching NAME
  --epic=NAME          Only analyze components in epic context
  --ignore-errors      Don't exit with error code on validation failure

Examples:
  bun scripts/validate-steadiest-api.ts
  bun scripts/validate-steadiest-api.ts --verbose
  bun scripts/validate-steadiest-api.ts --component="Gloo"
  bun scripts/validate-steadiest-api.ts --epic="steadiest-addressability-v1"

Validation Rules:
  • Maximum ${CONFIG.maxProps} props per component (recommended)
  • No banned patterns: ${CONFIG.bannedPatterns.filter(p => typeof p === "string").join(", ")}
  • Minimal required props (prefer defaults)
  • Include recommended props: ${CONFIG.recommendedProps.join(", ")}
  • Avoid complex nested types
`);
  }
}

// =====================================
// EXECUTION
// =====================================

if (import.meta.main) {
  const validator = new SteadiestAPIValidator();
  const args = process.argv.slice(2);

  validator.run(args).catch((error) => {
    console.error("❌ Validation failed:", error);
    process.exit(1);
  });
}

export { SteadiestAPIValidator, ValidationConfig, ValidationResult };
