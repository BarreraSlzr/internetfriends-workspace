#!/usr/bin/env bun

import { readdir, stat, readFile } from "fs/promises";
import { join, relative } from "path";

interface FontUsage {
  file: string;
  families: string[];
  weights: string[];
  styles: string[];
  sources: string[];
}

interface FontInventoryResult {
  timestamp: string;
  totalFontReferences: number;
  uniqueFamilies: string[];
  uniqueWeights: string[];
  usageByFile: FontUsage[];
  recommendations: string[];
}

const extractFontReferences = (
  content: string,
  filePath: string,
): FontUsage => {
  const usage: FontUsage = {
    file: filePath,
    families: [],
    weights: [],
    styles: [],
    sources: [],
  };

  // Extract font-family declarations
  const familyMatches = content.match(/font-family:\s*([^;}]+)[;}]/gi) || [];
  familyMatches.forEach((match) => {
    const family = match
      .replace(/font-family:\s*/i, "")
      .replace(/[;}]/g, "")
      .trim();
    if (family && family.length > 0 && !usage.families.includes(family)) {
      usage.families.push(family);
    }
  });

  // Extract font-weight declarations
  const weightMatches = content.match(/font-weight:\s*([^;}]+)[;}]/gi) || [];
  weightMatches.forEach((match) => {
    const weight = match
      .replace(/font-weight:\s*/i, "")
      .replace(/[;}]/g, "")
      .trim();
    if (weight && weight.length > 0 && !usage.weights.includes(weight)) {
      usage.weights.push(weight);
    }
  });

  // Extract @font-face sources
  const srcMatches = content.match(/src:\s*([^;}]+)[;}]/gi) || [];
  srcMatches.forEach((match) => {
    const src = match
      .replace(/src:\s*/i, "")
      .replace(/[;}]/g, "")
      .trim();
    if (src && src.length > 0 && !usage.sources.includes(src)) {
      usage.sources.push(src);
    }
  });

  // Extract font-style declarations
  const styleMatches = content.match(/font-style:\s*([^;}]+)[;}]/gi) || [];
  styleMatches.forEach((match) => {
    const style = match
      .replace(/font-style:\s*/i, "")
      .replace(/[;}]/g, "")
      .trim();
    if (style && style.length > 0 && !usage.styles.includes(style)) {
      usage.styles.push(style);
    }
  });

  return usage;
};

const scanForFontUsage = async (
  dirPath: string,
  basePath: string,
): Promise<FontUsage[]> => {
  const results: FontUsage[] = [];

  try {
    const entries = await readdir(dirPath);

    for (const entry of entries) {
      const fullPath = join(dirPath, entry);
      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        if (["node_modules", ".next", ".git"].includes(entry)) continue;
        const subResults = await scanForFontUsage(fullPath, basePath);
        results.push(...subResults);
      } else if (entry.match(/\.(scss|css|tsx|ts|js|jsx)$/)) {
        const content = await readFile(fullPath, "utf8");
        const usage = extractFontReferences(
          content,
          relative(basePath, fullPath),
        );
        if (usage.families.length > 0 || usage.sources.length > 0) {
          results.push(usage);
        }
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not scan directory ${dirPath}:`, error);
  }

  return results;
};

const generateFontInventory = async (): Promise<FontInventoryResult> => {
  console.log("🔍 Scanning for font usage across project...");

  const projectRoot = process.cwd();
  const fontUsage = await scanForFontUsage(projectRoot, projectRoot);

  // Aggregate unique values
  const allFamilies = new Set<string>();
  const allWeights = new Set<string>();
  const allStyles = new Set<string>();

  fontUsage.forEach((usage) => {
    usage.families.forEach((f) => allFamilies.add(f));
    usage.weights.forEach((w) => allWeights.add(w));
    usage.styles.forEach((s) => allStyles.add(s));
  });

  // Generate recommendations
  const recommendations: string[] = [];

  if (allFamilies.size > 3) {
    recommendations.push(
      `Too many font families (${allFamilies.size}) - consider consolidating`,
    );
  }

  if (allWeights.size > 6) {
    recommendations.push(
      `Many font weights (${allWeights.size}) - audit necessity`,
    );
  }

  const hasCustomFonts = fontUsage.some((u) => u.sources.length > 0);
  if (hasCustomFonts) {
    recommendations.push(
      "Custom fonts detected - implement preloading strategy",
    );
  }

  return {
    timestamp: new Date().toISOString(),
    totalFontReferences: fontUsage.length,
    uniqueFamilies: Array.from(allFamilies),
    uniqueWeights: Array.from(allWeights),
    usageByFile: fontUsage,
    recommendations,
  };
};

const main = async (): Promise<void> => {
  try {
    const inventory = await generateFontInventory();

    console.log("\n📊 Font Usage Inventory");
    console.log("═══════════════════════");
    console.log(`🕐 Timestamp: ${inventory.timestamp}`);
    console.log(`📁 Files with font usage: ${inventory.totalFontReferences}`);
    console.log(`🔤 Unique font families: ${inventory.uniqueFamilies.length}`);
    console.log(`⚖️  Unique font weights: ${inventory.uniqueWeights.length}`);

    console.log("\n🔤 Font Families:");
    inventory.uniqueFamilies.forEach((family, i) => {
      console.log(`  ${i + 1}. ${family}`);
    });

    console.log("\n⚖️ Font Weights:");
    inventory.uniqueWeights.forEach((weight, i) => {
      console.log(`  ${i + 1}. ${weight}`);
    });

    console.log("\n💡 Recommendations:");
    inventory.recommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec}`);
    });

    // Save results
    const filename = "font-inventory-" + Date.now() + ".json";
    const filepath = join("scripts/perf/snapshots", filename);
    await Bun.write(filepath, JSON.stringify(inventory, null, 2));

    console.log(`\n💾 Font inventory saved: ${filepath}`);
    console.log("\n🎭 FONT INVENTORY COMPLETE");
  } catch (error) {
    console.error("❌ Font inventory failed:", error);
    process.exit(1);
  }
};

if (import.meta.main) {
  main();
}

export { generateFontInventory, FontInventoryResult };
