#!/usr/bin/env bun
/**
 * Component Graph Builder - AST-based component metadata extractor
 *
 * Scans TypeScript/React components and generates metadata for the
 * React Flow component explorer. Analyzes dependencies, complexity,
 * design token usage, and atmospheric primitive integration.
 */

import { Project, SyntaxKind, Node, SourceFile } from "ts-morph";
import { glob } from "glob";
import fs from "node:fs/promises";
import path from "node:path";
import { watch } from "chokidar";

export interface ComponentMetadata {
  id: string; // unique stable id (path + export)
  filePath: string;
  exportName: string;
  kind: "atomic" | "molecular" | "organism" | "utility" | "hook" | "page";
  props: {
    total: number;
    required: number;
    optional: number;
    names: string[];
  };
  dependencies: string[]; // other component ids this imports
  dependents: string[]; // components that import this
  uses: {
    glass: boolean;
    goo: boolean;
    noise: boolean;
    vignette: boolean;
    motion: boolean;
    hooks: string[];
  };
  tokensReferenced: string[]; // CSS custom properties used
  size: {
    loc: number;
    linesJsx: number;
    complexity: number;
  };
  riskScore: number; // computed risk/complexity score
  a11y: {
    ariaCount: number;
    roles: string[];
    hasSemanticHtml: boolean;
  };
  lastModified: string;
  category: string; // inferred from file path
}

export interface ComponentGraphData {
  nodes: ComponentMetadata[];
  edges: Array<{
    id: string;
    source: string;
    target: string;
    type: "import" | "extends" | "uses";
    weight: number;
  }>;
  stats: {
    totalComponents: number;
    tokenCoverage: number;
    avgRiskScore: number;
    atmoshericUsage: number;
    legacyPatterns: number;
  };
  generatedAt: string;
}

class ComponentGraphBuilder {
  private project: Project;
  private baseDir: string;
  private componentMap = new Map<string, ComponentMetadata>();

  constructor(baseDir: string = process.cwd()) {
    this.baseDir = baseDir;
    this.project = new Project({
      tsConfigFilePath: path.join(baseDir, "tsconfig.json"),
      skipAddingFilesFromTsConfig: true,
    });
  }

  async build(): Promise<ComponentGraphData> {
    console.log("🔍 Scanning component files...");

    // Define scan patterns - relative to current working directory
    const patterns = [
      "components/**/*.{ts,tsx}",
      "app/**/*.{ts,tsx}",
      "!**/*.test.{ts,tsx}",
      "!**/*.stories.{ts,tsx}",
      "!**/*.d.ts",
      "!node_modules/**",
    ];

    // Get all files
    const filePaths = await glob(patterns, { cwd: this.baseDir });
    console.log(`📁 Found ${filePaths.length} files to analyze`);

    // Add files to project
    const sourceFiles = this.project.addSourceFilesAtPaths(
      filePaths.map((p) => path.resolve(this.baseDir, p)),
    );

    // Extract metadata from each file
    for (const sourceFile of sourceFiles) {
      await this.extractFileMetadata(sourceFile);
    }

    // Build dependency relationships
    this.buildDependencyGraph();

    // Generate edges
    const edges = this.generateEdges();

    // Calculate stats
    const stats = this.calculateStats();

    const graphData: ComponentGraphData = {
      nodes: Array.from(this.componentMap.values()),
      edges,
      stats,
      generatedAt: new Date().toISOString(),
    };

    console.log(`✅ Analyzed ${graphData.nodes.length} components`);
    return graphData;
  }

  private async extractFileMetadata(sourceFile: SourceFile): Promise<void> {
    const filePath = sourceFile.getFilePath();
    const relativePath = path.relative(this.baseDir, filePath);

    // Skip non-component files early
    if (!this.isComponentFile(sourceFile)) {
      return;
    }

    const text = sourceFile.getFullText();
    const exports = sourceFile.getExportedDeclarations();

    for (const [exportName, declarations] of exports) {
      // Skip non-component exports (but allow default exports)
      if (exportName.toLowerCase() === exportName && exportName !== "default") {
        continue;
      }

      if (!this.isReactComponent(exportName, declarations, text)) {
        continue;
      }

      const metadata = await this.buildComponentMetadata({
        sourceFile,
        exportName,
        relativePath,
        text,
      });

      if (metadata) {
        this.componentMap.set(metadata.id, metadata);
        console.log(`   Found: ${exportName} in ${relativePath}`);
      }
    }
  }

  private isComponentFile(sourceFile: SourceFile): boolean {
    const text = sourceFile.getFullText();
    const filePath = sourceFile.getFilePath();

    // Skip certain file types
    if (
      filePath.includes(".test.") ||
      filePath.includes(".stories.") ||
      filePath.includes(".d.ts") ||
      filePath.includes("node_modules")
    ) {
      return false;
    }

    return (
      filePath.endsWith(".tsx") ||
      text.includes("React") ||
      text.includes("jsx") ||
      text.includes("export") ||
      /<[A-Z]/.test(text) ||
      /return\s*\(?\s*</.test(text)
    );
  }

  private isReactComponent(
    exportName: string,
    declarations: Node[],
    fileText: string,
  ): boolean {
    if (declarations.length === 0) return false;

    // Check if export name starts with capital letter or is default (React convention)
    const hasComponentNaming =
      exportName === "default" || /^[A-Z][a-zA-Z0-9]*/.test(exportName);

    // Look for JSX patterns in the file
    const hasJsx =
      /return\s*\(?\s*<[A-Z]/.test(fileText) ||
      /return\s*<[A-Z]/.test(fileText) ||
      /<[A-Z][a-zA-Z0-9]*/.test(fileText) ||
      /React\.createElement/.test(fileText) ||
      /jsx/.test(fileText) ||
      fileText.includes("</");

    // Look for function/component patterns in the declaration
    const declText = declarations[0]?.getText() || "";
    const isFunction =
      /^(export\s+)?(default\s+)?(function|const|let)\s+/.test(declText) ||
      /Arrow/.test(declText) ||
      /FunctionDeclaration/.test(declText);

    return hasComponentNaming && hasJsx;
  }

  private async buildComponentMetadata({
    sourceFile,
    exportName,
    relativePath,
    text,
  }: {
    sourceFile: SourceFile;
    exportName: string;
    relativePath: string;
    text: string;
  }): Promise<ComponentMetadata | null> {
    const filePath = sourceFile.getFilePath();
    const stats = await fs.stat(filePath);

    // Basic file metrics
    const loc = sourceFile.getEndLineNumber();
    const jsxMatches = text.match(/<[\w-]+/g) || [];
    const linesJsx = jsxMatches.length;

    // Analyze imports
    const imports = sourceFile.getImportDeclarations();
    const dependencies = imports
      .map((imp) => imp.getModuleSpecifierValue())
      .filter((spec) => spec.startsWith(".") || spec.startsWith("@/"))
      .map((spec) => this.normalizeImportPath(spec, relativePath));

    // Detect atmospheric primitive usage
    const uses = {
      glass: /GlassPanel|glass-panel|glass-layer/.test(text),
      goo: /<BgGoo|import.*BgGoo/.test(text),
      noise: /NoiseFilter|noise-filter/.test(text),
      vignette: /Vignette|vignette/.test(text),
      motion: /motion\.|framer-motion|animate/.test(text),
      hooks: this.extractHookUsage(text),
    };

    // Extract CSS tokens
    const tokensReferenced = Array.from(
      new Set(
        [
          ...text.matchAll(
            /(--if-[a-z0-9-]+|--glass-[a-z0-9-]+|--color-[a-z0-9-]+)/gi,
          ),
        ].map((m) => m[0]),
      ),
    );

    // Analyze props interface (simplified)
    const props = this.analyzeProps(sourceFile, exportName);

    // Calculate complexity
    const complexity = this.calculateComplexity({
      loc,
      dependencies: dependencies.length,
      props: props.total,
      jsxElements: linesJsx,
      hasMotion: uses.motion,
      hasMultipleAtmos:
        [uses.glass, uses.goo, uses.noise, uses.vignette].filter(Boolean)
          .length > 2,
    });

    // Calculate risk score
    const riskScore = this.calculateRiskScore({
      complexity,
      dependencies: dependencies.length,
      props: props.total,
      loc,
      atmoshericComplexity: uses.motion ? 2 : 1,
    });

    // Analyze accessibility
    const a11y = this.analyzeAccessibility(text);

    const metadata: ComponentMetadata = {
      id: `${relativePath}::${exportName}`,
      filePath: relativePath,
      exportName,
      kind: this.inferComponentKind(relativePath),
      props,
      dependencies,
      dependents: [], // filled in buildDependencyGraph
      uses,
      tokensReferenced,
      size: { loc, linesJsx, complexity },
      riskScore,
      a11y,
      lastModified: stats.mtime.toISOString(),
      category: this.inferCategory(relativePath),
    };

    return metadata;
  }

  private normalizeImportPath(importSpec: string, currentFile: string): string {
    if (importSpec.startsWith("@/")) {
      return importSpec.replace("@/", "nextjs-website/");
    }
    if (importSpec.startsWith(".")) {
      const dir = path.dirname(currentFile);
      return path.normalize(path.join(dir, importSpec));
    }
    return importSpec;
  }

  private extractHookUsage(text: string): string[] {
    const hookMatches = text.match(/use[A-Z][a-zA-Z0-9]*/g) || [];
    return Array.from(new Set(hookMatches));
  }

  private analyzeProps(
    sourceFile: SourceFile,
    exportName: string,
  ): ComponentMetadata["props"] {
    // Simplified props analysis - look for interface patterns
    const text = sourceFile.getFullText();
    const propsInterfaceRegex = new RegExp(
      `interface\\s+${exportName}Props\\s*{([^}]*)}`,
      "s",
    );
    const match = text.match(propsInterfaceRegex);

    if (!match) {
      return { total: 0, required: 0, optional: 0, names: [] };
    }

    const propsText = match[1];
    const propLines = propsText
      .split("\n")
      .map((line) => line.trim())
      .filter(
        (line) => line && !line.startsWith("//") && !line.startsWith("*"),
      );

    const props = propLines
      .map((line) => {
        const optional = line.includes("?:");
        const name = line.split(/[?:]/, 1)[0].trim();
        return { name, optional };
      })
      .filter((prop) => prop.name && prop.name !== "");

    return {
      total: props.length,
      required: props.filter((p) => !p.optional).length,
      optional: props.filter((p) => p.optional).length,
      names: props.map((p) => p.name),
    };
  }

  private calculateComplexity(factors: {
    loc: number;
    dependencies: number;
    props: number;
    jsxElements: number;
    hasMotion: boolean;
    hasMultipleAtmos: boolean;
  }): number {
    const {
      loc,
      dependencies,
      props,
      jsxElements,
      hasMotion,
      hasMultipleAtmos,
    } = factors;

    let score = 0;
    score += Math.floor(loc / 50); // 1 point per 50 lines
    score += dependencies * 0.5;
    score += props * 0.3;
    score += jsxElements * 0.1;
    score += hasMotion ? 2 : 0;
    score += hasMultipleAtmos ? 3 : 0;

    return Math.round(score * 10) / 10;
  }

  private calculateRiskScore(factors: {
    complexity: number;
    dependencies: number;
    props: number;
    loc: number;
    atmoshericComplexity: number;
  }): number {
    const { complexity, dependencies, props, loc, atmoshericComplexity } =
      factors;

    let risk = 0;
    risk += complexity * 0.4;
    risk += dependencies > 10 ? 2 : dependencies * 0.2;
    risk += props > 15 ? 3 : props * 0.15;
    risk += loc > 300 ? 2 : loc / 150;
    risk += atmoshericComplexity;

    return Math.round(risk * 100) / 100;
  }

  private analyzeAccessibility(text: string): ComponentMetadata["a11y"] {
    const ariaMatches = text.match(/aria-[\w-]+/g) || [];
    const roleMatches = text.match(/role=["']([^"']+)["']/g) || [];
    const semanticTags = [
      "main",
      "nav",
      "section",
      "article",
      "header",
      "footer",
      "aside",
    ];

    const hasSemanticHtml = semanticTags.some((tag) =>
      new RegExp(`<${tag}\\b`, "i").test(text),
    );

    return {
      ariaCount: ariaMatches.length,
      roles: roleMatches.map(
        (match) => match.match(/role=["']([^"']+)["']/)?.[1] || "",
      ),
      hasSemanticHtml,
    };
  }

  private inferComponentKind(filePath: string): ComponentMetadata["kind"] {
    if (filePath.includes("/atomic/")) return "atomic";
    if (filePath.includes("/molecular/")) return "molecular";
    if (filePath.includes("/organism/")) return "organism";
    if (filePath.includes("/hooks/")) return "hook";
    if (filePath.includes("/pages/") || filePath.includes("/app/"))
      return "page";

    // Heuristic based on naming
    if (filePath.includes(".atomic.")) return "atomic";
    if (filePath.includes("hook") || filePath.includes("use-")) return "hook";

    return "utility";
  }

  private inferCategory(filePath: string): string {
    const segments = filePath.split("/");
    if (segments.includes("components")) {
      const compIndex = segments.indexOf("components");
      return segments[compIndex + 1] || "components";
    }
    if (segments.includes("app")) {
      return "pages";
    }
    return "misc";
  }

  private buildDependencyGraph(): void {
    // Build reverse dependency map (dependents)
    for (const [id, component] of this.componentMap) {
      for (const dep of component.dependencies) {
        // Find components that match this dependency
        const dependentComponents = Array.from(
          this.componentMap.values(),
        ).filter((c) => c.filePath.includes(dep) || c.id.includes(dep));

        for (const depComponent of dependentComponents) {
          if (!depComponent.dependents.includes(id)) {
            depComponent.dependents.push(id);
          }
        }
      }
    }
  }

  private generateEdges(): ComponentGraphData["edges"] {
    const edges: ComponentGraphData["edges"] = [];

    for (const component of this.componentMap.values()) {
      for (const dep of component.dependencies) {
        // Find target component
        const targetComponent = Array.from(this.componentMap.values()).find(
          (c) => c.filePath.includes(dep) || c.id.includes(dep),
        );

        if (targetComponent) {
          edges.push({
            id: `${component.id}->${targetComponent.id}`,
            source: component.id,
            target: targetComponent.id,
            type: "import",
            weight: 1,
          });
        }
      }
    }

    return edges;
  }

  private calculateStats(): ComponentGraphData["stats"] {
    const components = Array.from(this.componentMap.values());
    const totalComponents = components.length;

    const withTokens = components.filter(
      (c) => c.tokensReferenced.length > 0,
    ).length;
    const tokenCoverage =
      totalComponents > 0 ? (withTokens / totalComponents) * 100 : 0;

    const avgRiskScore =
      totalComponents > 0
        ? components.reduce((sum, c) => sum + c.riskScore, 0) / totalComponents
        : 0;

    const withAtmospheric = components.filter(
      (c) => c.uses.glass || c.uses.goo || c.uses.noise || c.uses.vignette,
    ).length;
    const atmoshericUsage =
      totalComponents > 0 ? (withAtmospheric / totalComponents) * 100 : 0;

    // Count legacy patterns (simplified)
    const withLegacy = components.filter(
      (c) =>
        c.filePath.includes("surface-glass") ||
        c.tokensReferenced.some((token) => token.includes("legacy")),
    ).length;

    return {
      totalComponents,
      tokenCoverage: Math.round(tokenCoverage * 100) / 100,
      avgRiskScore: Math.round(avgRiskScore * 100) / 100,
      atmoshericUsage: Math.round(atmoshericUsage * 100) / 100,
      legacyPatterns: withLegacy,
    };
  }

  async saveToFile(
    data: ComponentGraphData,
    outputPath: string,
  ): Promise<void> {
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(data, null, 2));
    console.log(`💾 Component graph saved to ${outputPath}`);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const watchMode = args.includes("--watch");
  const outputPath = path.join(process.cwd(), ".cache/component-graph.json");

  const builder = new ComponentGraphBuilder(process.cwd());

  const buildGraph = async () => {
    try {
      console.log("🏗️  Building component graph...");
      const graphData = await builder.build();
      await builder.saveToFile(graphData, outputPath);

      console.log("\n📊 Graph Statistics:");
      console.log(`   Components: ${graphData.stats.totalComponents}`);
      console.log(`   Token Coverage: ${graphData.stats.tokenCoverage}%`);
      console.log(`   Avg Risk Score: ${graphData.stats.avgRiskScore}`);
      console.log(`   Atmospheric Usage: ${graphData.stats.atmoshericUsage}%`);
      console.log(`   Legacy Patterns: ${graphData.stats.legacyPatterns}`);
    } catch (error) {
      console.error("❌ Error building component graph:", error);
    }
  };

  await buildGraph();

  if (watchMode) {
    console.log("\n👀 Watching for changes...");
    const watcher = watch(["components/**/*.{ts,tsx}", "app/**/*.{ts,tsx}"], {
      ignoreInitial: true,
      ignored: ["**/*.test.*", "**/*.stories.*", "**/node_modules/**"],
    });

    let timeout: NodeJS.Timeout;
    watcher.on("all", () => {
      clearTimeout(timeout);
      timeout = setTimeout(buildGraph, 800); // Debounce 800ms
    });

    // Graceful shutdown
    process.on("SIGINT", () => {
      console.log("\n👋 Shutting down watcher...");
      watcher.close();
      process.exit(0);
    });
  }
}

// Run if called directly
if (import.meta.main) {
  main().catch(console.error);
}

export { ComponentGraphBuilder };
