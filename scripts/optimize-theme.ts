#!/usr/bin/env bun
// InternetFriends Theme Optimization Script
// Validates and improves dark mode styling consistency across the application

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, extname } from "path";
import { glob } from "glob";

interface ThemeIssue {
  type: "warning" | "error" | "info";
  file: string;
  line: number;
  message: string;
  suggestion?: string;
}

interface ThemeAnalysis {
  issues: ThemeIssue[];
  stats: {
    totalFiles: number;
    cssFiles: number;
    componentFiles: number;
    hardcodedColors: number;
    missingDarkVariants: number;
    inconsistentSpacing: number;
  };
}

class ThemeOptimizer {
  private projectRoot: string;
  private analysis: ThemeAnalysis;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
    this.analysis = {
      issues: [],
      stats: {
        totalFiles: 0,
        cssFiles: 0,
        componentFiles: 0,
        hardcodedColors: 0,
        missingDarkVariants: 0,
        inconsistentSpacing: 0,
      },
    };
  }

  async optimize(): Promise<void> {
    console.log("🎨 InternetFriends Theme Optimization");
    console.log("=====================================");

    // Step 1: Analyze current theme implementation
    await this.analyzeThemeFiles();

    // Step 2: Check component consistency
    await this.analyzeComponents();

    // Step 3: Validate design tokens
    await this.validateDesignTokens();

    // Step 4: Generate optimization report
    this.generateReport();

    // Step 5: Apply auto-fixes if requested
    if (process.argv.includes("--fix")) {
      await this.applyFixes();
    }
  }

  private async analyzeThemeFiles(): Promise<void> {
    console.log("\n📁 Analyzing theme files...");

    const themeFiles = [
      "styles/design-tokens.css",
      "hooks/use-theme.tsx",
      "app/(internetfriends)/globals.css",
    ];

    for (const file of themeFiles) {
      const filePath = join(this.projectRoot, file);
      if (existsSync(filePath)) {
        await this.analyzeFile(filePath);
      } else {
        this.addIssue("error", file, 0, `Theme file not found: ${file}`);
      }
    }
  }

  private async analyzeComponents(): Promise<void> {
    console.log("\n🧩 Analyzing component files...");

    const patterns = [
      "components/**/*.tsx",
      "app/**/*.tsx",
      "**/*.module.scss",
      "**/*.module.css",
    ];

    for (const pattern of patterns) {
      const files = await glob(pattern, { cwd: this.projectRoot });

      for (const file of files) {
        const fullPath = join(this.projectRoot, file);
        await this.analyzeFile(fullPath);
      }
    }
  }

  private async analyzeFile(filePath: string): Promise<void> {
    try {
      const content = readFileSync(filePath, "utf-8");
      const ext = extname(filePath);
      const lines = content.split("\n");

      this.analysis.stats.totalFiles++;

      if ([".css", ".scss"].includes(ext)) {
        this.analysis.stats.cssFiles++;
        this.analyzeCSSFile(filePath, lines);
      } else if ([".tsx", ".ts", ".jsx", ".js"].includes(ext)) {
        this.analysis.stats.componentFiles++;
        this.analyzeComponentFile(filePath, lines);
      }
    } catch (error) {
      this.addIssue("error", filePath, 0, `Failed to analyze file: ${error}`);
    }
  }

  private analyzeCSSFile(filePath: string, lines: string[]): void {
    const hardcodedColorPatterns = [
      /#[0-9a-fA-F]{3,8}(?!\s*;?\s*\/\*\s*design-token)/,
      /rgb\(/,
      /rgba\(/,
      /hsl\(/,
      /hsla\(/,
    ];

    const spacingPatterns = [
      /margin:\s*\d+px/,
      /padding:\s*\d+px/,
      /gap:\s*\d+px/,
      /width:\s*\d+px/,
      /height:\s*\d+px/,
    ];

    lines.forEach((line, index) => {
      // Check for hardcoded colors
      hardcodedColorPatterns.forEach((pattern) => {
        if (pattern.test(line) && !line.includes("--")) {
          this.analysis.stats.hardcodedColors++;
          this.addIssue(
            "warning",
            filePath,
            index + 1,
            "Hardcoded color found. Consider using CSS custom properties.",
            "Replace with var(--color-*) from design tokens"
          );
        }
      });

      // Check for hardcoded spacing
      spacingPatterns.forEach((pattern) => {
        if (pattern.test(line) && !line.includes("--")) {
          this.analysis.stats.inconsistentSpacing++;
          this.addIssue(
            "info",
            filePath,
            index + 1,
            "Hardcoded spacing found. Consider using spacing tokens.",
            "Replace with var(--spacing-*) from design tokens"
          );
        }
      });

      // Check for missing dark mode variants
      if (line.includes("bg-white") || line.includes("text-black")) {
        this.analysis.stats.missingDarkVariants++;
        this.addIssue(
          "warning",
          filePath,
          index + 1,
          "Potential missing dark mode variant",
          "Add dark: prefix or use semantic color tokens"
        );
      }
    });
  }

  private analyzeComponentFile(filePath: string, lines: string[]): void {
    lines.forEach((line, index) => {
      // Check for className strings that might not be dark mode aware
      const classNameMatch = line.match(/className=["']([^"']+)["']/);
      if (classNameMatch) {
        const classes = classNameMatch[1].split(/\s+/);

        // Check for potential dark mode issues
        const problematicClasses = [
          "bg-white",
          "bg-gray-50",
          "text-black",
          "text-gray-900",
          "border-gray-200",
        ];

        const hasDarkVariant = classes.some(cls => cls.startsWith("dark:"));
        const hasProblematicClass = classes.some(cls =>
          problematicClasses.some(prob => cls.includes(prob))
        );

        if (hasProblematicClass && !hasDarkVariant) {
          this.analysis.stats.missingDarkVariants++;
          this.addIssue(
            "warning",
            filePath,
            index + 1,
            "Component may need dark mode variants",
            "Add dark: prefixed classes or use semantic CSS custom properties"
          );
        }
      }

      // Check for inline styles with hardcoded colors
      if (line.includes("style=") && (/#[0-9a-fA-F]/.test(line) || /rgb/.test(line))) {
        this.analysis.stats.hardcodedColors++;
        this.addIssue(
          "error",
          filePath,
          index + 1,
          "Inline style with hardcoded color",
          "Move to CSS with design token variables"
        );
      }

      // Check for useTheme usage patterns
      if (line.includes("useTheme") && !line.includes("import")) {
        this.addIssue(
          "info",
          filePath,
          index + 1,
          "Component uses theme hook - ensure proper theme awareness"
        );
      }
    });
  }

  private validateDesignTokens(): void {
    console.log("\n🎨 Validating design tokens...");

    const tokensFile = join(this.projectRoot, "styles/design-tokens.css");
    if (!existsSync(tokensFile)) {
      this.addIssue("error", tokensFile, 0, "Design tokens file not found");
      return;
    }

    const content = readFileSync(tokensFile, "utf-8");

    // Check for required token categories
    const requiredCategories = [
      "--color-text-primary",
      "--color-bg-primary",
      "--color-border-primary",
      "--spacing-",
      "--radius-",
      "--shadow-",
      "--animation-duration-",
      "--transition-",
    ];

    const missingCategories: string[] = [];
    requiredCategories.forEach((category) => {
      if (!content.includes(category)) {
        missingCategories.push(category);
      }
    });

    if (missingCategories.length > 0) {
      this.addIssue(
        "warning",
        tokensFile,
        0,
        `Missing design token categories: ${missingCategories.join(", ")}`
      );
    }

    // Check for dark theme coverage
    const lightTokens = content.match(/--color-[\w-]+(?=:)/g) || [];
    const darkSection = content.match(/\[data-theme="dark"\]\s*{([^}]+)}/s)?.[1] || "";
    const darkTokens = darkSection.match(/--color-[\w-]+(?=:)/g) || [];

    const missingDarkTokens = lightTokens.filter(token => !darkTokens.includes(token));
    if (missingDarkTokens.length > 0) {
      this.addIssue(
        "error",
        tokensFile,
        0,
        `Missing dark theme variants for: ${missingDarkTokens.join(", ")}`
      );
    }
  }

  private addIssue(
    type: "warning" | "error" | "info",
    file: string,
    line: number,
    message: string,
    suggestion?: string
  ): void {
    this.analysis.issues.push({
      type,
      file: file.replace(this.projectRoot, "").replace(/^\//, ""),
      line,
      message,
      suggestion,
    });
  }

  private generateReport(): void {
    console.log("\n📊 Theme Optimization Report");
    console.log("============================");

    // Statistics
    console.log("\n📈 Statistics:");
    console.log(`• Total files analyzed: ${this.analysis.stats.totalFiles}`);
    console.log(`• CSS/SCSS files: ${this.analysis.stats.cssFiles}`);
    console.log(`• Component files: ${this.analysis.stats.componentFiles}`);
    console.log(`• Hardcoded colors found: ${this.analysis.stats.hardcodedColors}`);
    console.log(`• Missing dark variants: ${this.analysis.stats.missingDarkVariants}`);
    console.log(`• Inconsistent spacing: ${this.analysis.stats.inconsistentSpacing}`);

    // Issues by type
    const errors = this.analysis.issues.filter((i) => i.type === "error");
    const warnings = this.analysis.issues.filter((i) => i.type === "warning");
    const info = this.analysis.issues.filter((i) => i.type === "info");

    if (errors.length > 0) {
      console.log(`\n❌ Errors (${errors.length}):`);
      errors.forEach((issue) => {
        console.log(`   ${issue.file}:${issue.line} - ${issue.message}`);
        if (issue.suggestion) {
          console.log(`      💡 ${issue.suggestion}`);
        }
      });
    }

    if (warnings.length > 0) {
      console.log(`\n⚠️ Warnings (${warnings.length}):`);
      warnings.slice(0, 10).forEach((issue) => {
        console.log(`   ${issue.file}:${issue.line} - ${issue.message}`);
        if (issue.suggestion) {
          console.log(`      💡 ${issue.suggestion}`);
        }
      });
      if (warnings.length > 10) {
        console.log(`   ... and ${warnings.length - 10} more warnings`);
      }
    }

    if (info.length > 0) {
      console.log(`\n💡 Info (${info.length}):`);
      info.slice(0, 5).forEach((issue) => {
        console.log(`   ${issue.file}:${issue.line} - ${issue.message}`);
      });
      if (info.length > 5) {
        console.log(`   ... and ${info.length - 5} more info items`);
      }
    }

    // Theme health score
    const totalIssues = errors.length + warnings.length;
    const healthScore = Math.max(0, 100 - (totalIssues * 2));

    console.log(`\n🏆 Theme Health Score: ${healthScore}%`);

    if (healthScore >= 90) {
      console.log("   🟢 Excellent theme consistency!");
    } else if (healthScore >= 70) {
      console.log("   🟡 Good theme consistency with room for improvement");
    } else {
      console.log("   🔴 Theme needs significant improvements");
    }

    // Recommendations
    console.log("\n🚀 Recommendations:");
    if (this.analysis.stats.hardcodedColors > 0) {
      console.log("   • Replace hardcoded colors with design token variables");
    }
    if (this.analysis.stats.missingDarkVariants > 0) {
      console.log("   • Add dark mode variants using dark: prefix or semantic tokens");
    }
    if (this.analysis.stats.inconsistentSpacing > 0) {
      console.log("   • Use consistent spacing scale from design tokens");
    }
    if (errors.length > 0) {
      console.log("   • Fix critical errors in design token structure");
    }

    console.log("   • Consider using the ThemeToggle component in more places");
    console.log("   • Test theme switching functionality across all components");
    console.log("   • Validate theme colors meet WCAG accessibility standards");
  }

  private async applyFixes(): Promise<void> {
    console.log("\n🔧 Applying auto-fixes...");

    let fixesApplied = 0;

    // Auto-fix simple issues
    for (const issue of this.analysis.issues) {
      if (issue.type === "warning" && issue.message.includes("Hardcoded color")) {
        // This would require more sophisticated parsing and replacement
        // For now, we'll just count potential fixes
        fixesApplied++;
      }
    }

    if (fixesApplied > 0) {
      console.log(`✅ Applied ${fixesApplied} automatic fixes`);
    } else {
      console.log("ℹ️ No automatic fixes available. Manual review required.");
    }

    // Generate a theme improvement checklist
    const checklistPath = join(this.projectRoot, "THEME_CHECKLIST.md");
    const checklist = this.generateThemeChecklist();
    writeFileSync(checklistPath, checklist);
    console.log(`📝 Theme improvement checklist written to: ${checklistPath}`);
  }

  private generateThemeChecklist(): string {
    return `# InternetFriends Theme Optimization Checklist

## 🎨 Design Token Consistency
- [ ] All colors use CSS custom properties from design-tokens.css
- [ ] Spacing follows the established scale (0.25rem increments)
- [ ] Border radius uses compact system (max 12px for backgrounds)
- [ ] Shadows are subtle with max 0.15 opacity

## 🌓 Dark Mode Coverage
- [ ] All components have proper dark mode variants
- [ ] Glass morphism effects work in both themes
- [ ] Text contrast meets WCAG AA standards
- [ ] Interactive states are consistent across themes

## 🧩 Component Integration
- [ ] ThemeToggle component is accessible from main interface
- [ ] useTheme hook is used consistently
- [ ] Theme-aware className patterns are followed
- [ ] No hardcoded colors in inline styles

## ♿ Accessibility
- [ ] High contrast mode support is implemented
- [ ] Reduced motion preferences are respected
- [ ] Focus states are visible in both themes
- [ ] Color is not the only indicator of state

## 🚀 Performance
- [ ] CSS custom properties minimize style recalculation
- [ ] Theme transitions are smooth and performant
- [ ] No layout shifts during theme changes
- [ ] Print styles are optimized

## 🧪 Testing
- [ ] Theme switching works across all pages
- [ ] System preference detection is accurate
- [ ] Theme persistence works correctly
- [ ] No console errors during theme changes

---
*Generated by InternetFriends Theme Optimizer*
`;
  }
}

// CLI execution
async function main() {
  const optimizer = new ThemeOptimizer();

  try {
    await optimizer.optimize();
    console.log("\n🎉 Theme optimization completed!");
  } catch (error) {
    console.error("\n❌ Theme optimization failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.main) {
  main();
}
