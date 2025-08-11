#!/usr/bin/env bun

import { readdir, stat, readFile } from 'fs/promises';
import { join, relative } from 'path';
import { execSync } from 'child_process';

interface FileInfo {
  path: string;
  sizeBytes: number;
  sizeKB: number;
  type: 'js' | 'css' | 'other';
}

interface BundleSnapshot {
  timestamp: string;
  commitHash: string;
  build: {
    js: {
      totalBytes: number;
      totalKB: number;
      files: FileInfo[];
    };
    css: {
      totalBytes: number;
      totalKB: number;
      files: FileInfo[];
    };
    other: {
      totalBytes: number;
      totalKB: number;
      files: FileInfo[];
    };
  };
  meta: {
    nodeEnv: string;
    nextVersion?: string;
    totalFiles: number;
    largestFile?: FileInfo;
  };
}

const getCommitHash = (): string => {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
};

const getFileType = (filename: string): 'js' | 'css' | 'other' => {
  if (filename.endsWith('.js') || filename.endsWith('.mjs')) return 'js';
  if (filename.endsWith('.css')) return 'css';
  return 'other';
};

const scanDirectory = async (dirPath: string, basePath: string): Promise<FileInfo[]> => {
  const files: FileInfo[] = [];

  try {
    const entries = await readdir(dirPath);

    for (const entry of entries) {
      const fullPath = join(dirPath, entry);
      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        // Recursively scan subdirectories
        const subFiles = await scanDirectory(fullPath, basePath);
        files.push(...subFiles);
      } else {
        const sizeBytes = stats.size;
        const relativePath = relative(basePath, fullPath);

        files.push({
          path: relativePath,
          sizeBytes,
          sizeKB: Math.round((sizeBytes / 1024) * 100) / 100,
          type: getFileType(entry),
        });
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not scan directory ${dirPath}:`, error);
  }

  return files;
};

const getNextVersion = async (): Promise<string | undefined> => {
  try {
    const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
    return packageJson.dependencies?.next || packageJson.devDependencies?.next;
  } catch {
    return undefined;
  }
};

const createSnapshot = async (): Promise<BundleSnapshot> => {
  const projectRoot = process.cwd();
  const buildDirs = [
    join(projectRoot, '.next/static'),
    join(projectRoot, '.vercel/output/static'),
    join(projectRoot, 'out/_next/static'), // Static export
  ];

  let allFiles: FileInfo[] = [];
  let scannedDir = '';

  // Try to find the build output directory
  for (const buildDir of buildDirs) {
    try {
      await stat(buildDir);
      console.log(`📁 Scanning build directory: ${buildDir}`);
      allFiles = await scanDirectory(buildDir, projectRoot);
      scannedDir = buildDir;
      break;
    } catch {
      // Directory doesn't exist, try next
      continue;
    }
  }

  if (allFiles.length === 0) {
    console.warn('⚠️  No build directory found. Run `bun run build` first.');
    console.warn('Searched for:', buildDirs);
  }

  // Categorize files
  const jsFiles = allFiles.filter(f => f.type === 'js');
  const cssFiles = allFiles.filter(f => f.type === 'css');
  const otherFiles = allFiles.filter(f => f.type === 'other');

  // Calculate totals
  const jsTotalBytes = jsFiles.reduce((sum, f) => sum + f.sizeBytes, 0);
  const cssTotalBytes = cssFiles.reduce((sum, f) => sum + f.sizeBytes, 0);
  const otherTotalBytes = otherFiles.reduce((sum, f) => sum + f.sizeBytes, 0);

  // Find largest file
  const largestFile = allFiles.reduce((largest, current) =>
    !largest || current.sizeBytes > largest.sizeBytes ? current : largest,
    null as FileInfo | null
  );

  const snapshot: BundleSnapshot = {
    timestamp: new Date().toISOString(),
    commitHash: getCommitHash(),
    build: {
      js: {
        totalBytes: jsTotalBytes,
        totalKB: Math.round((jsTotalBytes / 1024) * 100) / 100,
        files: jsFiles.sort((a, b) => b.sizeBytes - a.sizeBytes),
      },
      css: {
        totalBytes: cssTotalBytes,
        totalKB: Math.round((cssTotalBytes / 1024) * 100) / 100,
        files: cssFiles.sort((a, b) => b.sizeBytes - a.sizeBytes),
      },
      other: {
        totalBytes: otherTotalBytes,
        totalKB: Math.round((otherTotalBytes / 1024) * 100) / 100,
        files: otherFiles.sort((a, b) => b.sizeBytes - a.sizeBytes),
      },
    },
    meta: {
      nodeEnv: process.env.NODE_ENV || 'development',
      nextVersion: await getNextVersion(),
      totalFiles: allFiles.length,
      largestFile: largestFile || undefined,
    },
  };

  return snapshot;
};

const formatSize = (kb: number): string => {
  if (kb < 1024) return `${kb}KB`;
  return `${Math.round((kb / 1024) * 10) / 10}MB`;
};

const printSummary = (snapshot: BundleSnapshot): void => {
  console.log('\n📊 Bundle Snapshot Summary');
  console.log('═══════════════════════════');
  console.log(`🕐 Timestamp: ${snapshot.timestamp}`);
  console.log(`🔗 Commit: ${snapshot.commitHash}`);
  console.log(`📦 Next.js: ${snapshot.meta.nextVersion || 'unknown'}`);
  console.log(`📁 Total files: ${snapshot.meta.totalFiles}`);

  console.log('\n📈 Asset Breakdown:');
  console.log(`  JavaScript: ${formatSize(snapshot.build.js.totalKB)} (${snapshot.build.js.files.length} files)`);
  console.log(`  CSS: ${formatSize(snapshot.build.css.totalKB)} (${snapshot.build.css.files.length} files)`);
  console.log(`  Other: ${formatSize(snapshot.build.other.totalKB)} (${snapshot.build.other.files.length} files)`);

  const totalKB = snapshot.build.js.totalKB + snapshot.build.css.totalKB + snapshot.build.other.totalKB;
  console.log(`  Total: ${formatSize(totalKB)}`);

  if (snapshot.meta.largestFile) {
    console.log(`\n🏆 Largest file: ${snapshot.meta.largestFile.path} (${formatSize(snapshot.meta.largestFile.sizeKB)})`);
  }

  // Show top 5 largest files per category
  const showTop = (files: FileInfo[], category: string, limit = 5) => {
    if (files.length === 0) return;
    console.log(`\n📋 Top ${category} files:`);
    files.slice(0, limit).forEach((file, index) => {
      console.log(`  ${index + 1}. ${file.path} - ${formatSize(file.sizeKB)}`);
    });
  };

  showTop(snapshot.build.js.files, 'JS');
  showTop(snapshot.build.css.files, 'CSS');
};

const saveSnapshot = async (snapshot: BundleSnapshot): Promise<void> => {
  const filename = `bundle-snapshot-${snapshot.commitHash}-${Date.now()}.json`;
  const filepath = join('scripts/perf/snapshots', filename);

  // Ensure snapshots directory exists
  try {
    await execSync('mkdir -p scripts/perf/snapshots', { encoding: 'utf8' });
  } catch {
    console.warn('Could not create snapshots directory');
  }

  await Bun.write(filepath, JSON.stringify(snapshot, null, 2));
  console.log(`\n💾 Snapshot saved: ${filepath}`);

  // Also save as latest snapshot
  const latestPath = join('scripts/perf/snapshots', 'latest.json');
  await Bun.write(latestPath, JSON.stringify(snapshot, null, 2));
  console.log(`💾 Latest snapshot: ${latestPath}`);
};

const main = async (): Promise<void> => {
  console.log('🚀 Creating bundle snapshot...\n');

  try {
    const snapshot = await createSnapshot();
    printSummary(snapshot);
    await saveSnapshot(snapshot);

    console.log('\n✅ Bundle snapshot complete!');

    // Epic integration: log performance metrics
    console.log('\n🎭 EPIC METRICS UPDATE:');
    console.log(JSON.stringify({
      epic: 'performance-optimization',
      phase: 'baseline',
      metrics: {
        bundle: {
          jsKB: snapshot.build.js.totalKB,
          cssKB: snapshot.build.css.totalKB,
          totalFiles: snapshot.meta.totalFiles,
        },
        timestamp: snapshot.timestamp,
      }
    }, null, 2));

  } catch (error) {
    console.error('❌ Error creating bundle snapshot:', error);
    process.exit(1);
  }
};

// Run if called directly
if (import.meta.main) {
  main();
}

export { createSnapshot, BundleSnapshot, FileInfo };
