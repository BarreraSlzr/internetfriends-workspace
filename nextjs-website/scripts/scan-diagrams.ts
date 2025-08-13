#!/usr/bin/env bun
/**
 * scan-diagrams.ts
 * Diagram validation and lint script for mermaid documentation
 *
 * Purpose:
 *  - List all *.mmd files under docs/state
 *  - Verify frontmatter tokens (id, title, createdAt, stamp, description)
 *  - Print JSON summary of diagram metadata
 *  - Exit non-zero if any required tokens are missing
 *
 * Usage:
 *  bun scripts/scan-diagrams.ts
 *  bun scripts/scan-diagrams.ts --validate
 *  bun scripts/scan-diagrams.ts --json
 *  bun scripts/scan-diagrams.ts --fix-missing
 *
 * Expected frontmatter format:
 *  <!--
 *  id: 20250813-022349-abc123
 *  title: Component Analysis Flow
 *  createdAt: 2025-08-13T02:23:49.277Z
 *  stamp: 20250813-022349-xyz789
 *  description: Sequence diagram for helper invocation loop
 *  -->
 */

import * as fs from "fs";
import * as path from "path";

interface DiagramMetadata {
  filePath: string;
  fileName: string;
  exists: boolean;
  metadata: {
    id?: string;
    title?: string;
    createdAt?: string;
    stamp?: string;
    description?: string;
  };
  missingTokens: string[];
  isValid: boolean;
  content?: string;
}

interface DiagramScanReport {
  summary: {
    totalDiagrams: number;
    validDiagrams: number;
    invalidDiagrams: number;
    missingTokensCount: number;
  };
  diagrams: DiagramMetadata[];
  requiredTokens: string[];
  recommendations: string[];
  createdAt: string;
  stamp: string;
}

// Utility functions
function generateStamp(): string {
  return new Date()
    .toISOString()
    .replace(/[-:T.]/g, "")
    .slice(0, 15);
}

function getIsoTimestamp(): string {
  return new Date().toISOString();
}

const REQUIRED_TOKENS = ["id", "title", "createdAt", "stamp", "description"];

function parseFrontmatter(content: string): DiagramMetadata["metadata"] {
  const frontmatterRegex = /<!--\s*([\s\S]*?)\s*-->/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return {};
  }

  const frontmatter = match[1];
  const metadata: DiagramMetadata["metadata"] = {};

  // Parse key-value pairs
  const lines = frontmatter
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();

    if (REQUIRED_TOKENS.includes(key)) {
      metadata[key as keyof DiagramMetadata["metadata"]] = value;
    }
  }

  return metadata;
}

function validateDiagram(filePath: string): DiagramMetadata {
  const fileName = path.basename(filePath);
  const exists = fs.existsSync(filePath);

  let metadata: DiagramMetadata["metadata"] = {};
  let content = "";

  if (exists) {
    try {
      content = fs.readFileSync(filePath, "utf-8");
      metadata = parseFrontmatter(content);
    } catch (error) {
      console.error(`Error reading ${filePath}:`, error);
    }
  }

  const missingTokens = REQUIRED_TOKENS.filter(
    (token) => !metadata[token as keyof typeof metadata],
  );
  const isValid = exists && missingTokens.length === 0;

  return {
    filePath,
    fileName,
    exists,
    metadata,
    missingTokens,
    isValid,
    content,
  };
}

function generateFrontmatter(title: string, description: string): string {
  const timestamp = getIsoTimestamp();
  const stamp = generateStamp();
  const id = `${stamp}-${Math.random().toString(36).slice(2, 8)}`;

  return `<!--
id: ${id}
title: ${title}
createdAt: ${timestamp}
stamp: ${stamp}
description: ${description}
-->`;
}

async function scanDiagrams(options: {
  validate?: boolean;
  fixMissing?: boolean;
}): Promise<DiagramScanReport> {
  const diagrams: DiagramMetadata[] = [];
  const docsStatePath =
    "/Users/emmanuelbarrera/Projects/InternetFriends/zed_workspace/nextjs-website/docs/state";

  // Create docs/state directory if it doesn't exist
  if (!fs.existsSync(docsStatePath)) {
    fs.mkdirSync(docsStatePath, { recursive: true });
    console.log(`Created directory: ${docsStatePath}`);
  }

  // Scan for existing .mmd files
  const scanDirectory = (dir: string) => {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        scanDirectory(fullPath); // Recursive scan
      } else if (entry.name.endsWith(".mmd")) {
        const diagramData = validateDiagram(fullPath);
        diagrams.push(diagramData);

        // Fix missing frontmatter if requested
        if (options.fixMissing && !diagramData.isValid && diagramData.exists) {
          const title = diagramData.fileName
            .replace(".mmd", "")
            .replace(/[._-]/g, " ");
          const description = `Auto-generated description for ${title}`;
          const newFrontmatter = generateFrontmatter(title, description);

          const updatedContent = diagramData.content?.includes("<!--")
            ? diagramData.content.replace(/<!--[\s\S]*?-->/, newFrontmatter)
            : `${newFrontmatter}\n\n${diagramData.content || ""}`;

          fs.writeFileSync(fullPath, updatedContent.trim() + "\n");
          console.log(`Fixed frontmatter for: ${diagramData.fileName}`);
        }
      }
    }
  };

  scanDirectory(docsStatePath);

  // Generate summary statistics
  const totalDiagrams = diagrams.length;
  const validDiagrams = diagrams.filter((d) => d.isValid).length;
  const invalidDiagrams = totalDiagrams - validDiagrams;
  const missingTokensCount = diagrams.reduce(
    (sum, d) => sum + d.missingTokens.length,
    0,
  );

  // Generate recommendations
  const recommendations: string[] = [];
  if (invalidDiagrams > 0) {
    recommendations.push(
      `${invalidDiagrams} diagrams missing required frontmatter tokens`,
    );
  }
  if (missingTokensCount > 0) {
    recommendations.push(
      `Total ${missingTokensCount} missing tokens across all diagrams`,
    );
    recommendations.push(
      "Use --fix-missing flag to auto-generate missing frontmatter",
    );
  }
  if (totalDiagrams === 0) {
    recommendations.push(
      "No mermaid diagrams found - consider creating sequence/flow diagrams for orchestration",
    );
  }

  return {
    summary: {
      totalDiagrams,
      validDiagrams,
      invalidDiagrams,
      missingTokensCount,
    },
    diagrams: diagrams.sort((a, b) => a.fileName.localeCompare(b.fileName)),
    requiredTokens: REQUIRED_TOKENS,
    recommendations,
    createdAt: getIsoTimestamp(),
    stamp: generateStamp(),
  };
}

function formatOutput(report: DiagramScanReport, format: string): string {
  switch (format) {
    case "json":
      return JSON.stringify(report, null, 2);

    case "markdown":
      return `# Diagram Scan Report
Generated: ${report.createdAt}

## Summary
- **Total Diagrams**: ${report.summary.totalDiagrams}
- **Valid Diagrams**: ${report.summary.validDiagrams}
- **Invalid Diagrams**: ${report.summary.invalidDiagrams}
- **Missing Tokens**: ${report.summary.missingTokensCount}

## Required Tokens
${report.requiredTokens.map((token) => `- \`${token}\``).join("\n")}

## Diagrams
${report.diagrams
  .map(
    (d) =>
      `### ${d.fileName}
**Status**: ${d.isValid ? "✅ Valid" : "❌ Invalid"}
**Path**: \`${d.filePath}\`
${d.missingTokens.length > 0 ? `**Missing**: ${d.missingTokens.join(", ")}` : ""}
${d.metadata.title ? `**Title**: ${d.metadata.title}` : ""}
${d.metadata.description ? `**Description**: ${d.metadata.description}` : ""}`,
  )
  .join("\n\n")}

## Recommendations
${report.recommendations.map((r) => `- ${r}`).join("\n")}
`;

    case "summary":
    default:
      return `Diagram Scan Summary:
Total: ${report.summary.totalDiagrams} diagrams
Valid: ${report.summary.validDiagrams}/${report.summary.totalDiagrams}
Missing Tokens: ${report.summary.missingTokensCount}

${report.recommendations.length > 0 ? "Issues:\n" + report.recommendations.map((r) => `• ${r}`).join("\n") : "✅ All diagrams valid"}
`;
  }
}

async function main() {
  const args = process.argv.slice(2);

  const options = {
    validate: args.includes("--validate"),
    fixMissing: args.includes("--fix-missing"),
  };

  const format =
    args.find((arg) => arg.startsWith("--format="))?.split("=")[1] ||
    (args.includes("--json") ? "json" : "summary");

  try {
    const report = await scanDiagrams(options);
    const output = formatOutput(report, format);
    console.log(output);

    // Exit with appropriate code
    const exitCode = report.summary.invalidDiagrams > 0 ? 1 : 0;

    if (options.validate && exitCode !== 0) {
      console.error(
        `\nValidation failed: ${report.summary.invalidDiagrams} invalid diagrams found`,
      );
    }

    process.exit(exitCode);
  } catch (error) {
    console.error(
      "Diagram scan failed:",
      error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
