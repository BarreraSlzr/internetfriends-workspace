#!/usr/bin/env bun

import { readdir, readFile, writeFile, mkdir, copyFile, rm, stat } from 'fs/promises';
import { join, dirname, relative, basename } from 'path';
import { existsSync } from 'fs';

interface RestructureOptions {
  mode: 'flatten' | 'focus-nextjs';
  backup: boolean;
  fixJSX: boolean;
  cleanBuild: boolean;
}

const DEFAULT_OPTIONS: RestructureOptions = {
  mode: 'flatten',
  backup: true,
  fixJSX: true,
  cleanBuild: true
};

// JSX fixes from our previous attempt, but more comprehensive
const JSX_FIXES = [
  // Fix malformed opening tags
  { from: /<\s*([a-zA-Z][a-zA-Z0-9]*)\s*<([^>]+)>/g, to: '<$1 $2>' },
  { from: /<\s*<([^>]+)>\s*([a-zA-Z][a-zA-Z0-9]*)/g, to: '<$2 $1' },
  { from: /<\s*key=\{[^}]+\}([a-zA-Z][a-zA-Z0-9]*)/g, to: '<$1' },
  { from: /<\s*([a-zA-Z][a-zA-Z0-9]*)\s*<([^>]*?)key=\{([^}]+)\}([^>]*?)>/g, to: '<$1 key={$3} $2$4>' },

  // Fix className issues
  { from: /<([a-zA-Z][a-zA-Z0-9]*)\s*<className\s*key=\{([^}]+)\}=\{([^}]+)\}>/g, to: '<$1 key={$2} className={$3}>' },
  { from: /<([a-zA-Z][a-zA-Z0-9]*)\s*<([^>]*?)className\s*key=\{([^}]+)\}=\{([^}]+)\}([^>]*?)>/g, to: '<$1 key={$3} className={$4} $2$5>' },

  // Fix other attribute issues
  { from: //g, to: '' },
  { from: /hover:/g, to: 'hover:' },
  { from: /variant=/g, to: 'variant=' },
  { from: /onChange=/g, to: 'onChange=' },
  { from: /onSubmit=/g, to: 'onSubmit=' },
  { from: /className=/g, to: 'className=' },
  { from: /whileHover=/g, to: 'whileHover=' },
  { from: /whileTap=/g, to: 'whileTap=' },
  { from: /delay:/g, to: 'delay:' },
  { from: /style=/g, to: 'style=' },
  { from: /active/g, to: 'active' },
  { from: /clickable/g, to: 'clickable' },

  // Fix complex malformed patterns
  { from: /<([a-zA-Z][a-zA-Z0-9]*)\s*<value\s*key=\{([^}]+)\}=\{([^}]+)\}>/g, to: '<$1 key={$2} value={$3}>' },
  { from: /<([a-zA-Z][a-zA-Z0-9]*)\s*<([^>]*?)value\s*key=\{([^}]+)\}=\{([^}]+)\}([^>]*?)>/g, to: '<$1 key={$3} value={$4} $2$5>' },
  { from: /<onClick\s*key=\{([^}]+)\}=\{([^}]+)\}/g, to: '<button key={$1} onClick={$2}' },
  { from: /<initial\s*key=\{([^}]+)\}=/g, to: '<motion.div key={$1} initial=' },

  // Fix React.Fragment issues
  { from: /<\s*key=\{[^}]+\}React\.Fragment/g, to: '<React.Fragment' },

  // Parameter name fixes
  { from: /\(_e\)\s*=>/g, to: '(e) =>' },
];

async function createBackup(sourceDir: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = join(dirname(sourceDir), `backup-${basename(sourceDir)}-${timestamp}`);

  console.log(`📦 Creating backup at: ${backupDir}`);

  async function copyRecursive(src: string, dest: string) {
    const stats = await stat(src);

    if (stats.isDirectory()) {
      await mkdir(dest, { recursive: true });
      const entries = await readdir(src);

      for (const entry of entries) {
        if (entry === 'node_modules' || entry === '.next' || entry.startsWith('.')) {
          continue;
        }
        await copyRecursive(join(src, entry), join(dest, entry));
      }
    } else {
      await mkdir(dirname(dest), { recursive: true });
      await copyFile(src, dest);
    }
  }

  await copyRecursive(sourceDir, backupDir);
  return backupDir;
}

async function fixJSXInFile(filePath: string): Promise<number> {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) {
    return 0;
  }

  let content = await readFile(filePath, 'utf8');
  const originalContent = content;
  let fixCount = 0;

  // Apply all JSX fixes
  for (const fix of JSX_FIXES) {
    const matches = content.match(fix.from);
    if (matches) {
      content = content.replace(fix.from, fix.to);
      fixCount += matches.length;
    }
  }

  // Additional complex manual fixes

  // Fix SelectItem patterns specifically
  content = content.replace(
    /<SelectItem\s*<value\s*key=\{([^}]+)\}=\{([^}]+)\}>/g,
    '<SelectItem key={$1} value={$2}>'
  );

  // Fix option patterns
  content = content.replace(
    /<option\s*<value\s*key=\{([^}]+)\}=\{([^}]+)\}>/g,
    '<option key={$1} value={$2}>'
  );

  // Fix button patterns
  content = content.replace(
    /<button\s*<([^>]*?)key=\{([^}]+)\}([^>]*?)>/g,
    '<button key={$2} $1$3>'
  );

  // Fix motion.div patterns
  content = content.replace(
    /<motion\.div\s*<([^>]*?)key=\{([^}]+)\}([^>]*?)>/g,
    '<motion.div key={$2} $1$3>'
  );

  // Fix generic component patterns with malformed attributes
  content = content.replace(
    /<([A-Z][a-zA-Z0-9]*)\s*<([^>]*?)key=\{([^}]+)\}([^>]*?)>/g,
    '<$1 key={$3} $2$4>'
  );

  if (content !== originalContent) {
    await writeFile(filePath, content, 'utf8');
    return fixCount;
  }

  return 0;
}

async function fixJSXInDirectory(dir: string): Promise<{ files: number; fixes: number }> {
  let totalFiles = 0;
  let totalFixes = 0;

  async function processDirectory(currentDir: string) {
    const entries = await readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);

      if (entry.isDirectory() && !['node_modules', '.next', '.git'].includes(entry.name)) {
        await processDirectory(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
        const fixes = await fixJSXInFile(fullPath);
        if (fixes > 0) {
          console.log(`  ✓ Fixed ${fixes} issues in ${relative(dir, fullPath)}`);
          totalFiles++;
          totalFixes += fixes;
        }
      }
    }
  }

  await processDirectory(dir);
  return { files: totalFiles, fixes: totalFixes };
}

async function createUtilsFile(targetDir: string): Promise<void> {
  const utilsDir = join(targetDir, 'lib');
  const utilsFile = join(utilsDir, 'utils.ts');

  if (!existsSync(utilsFile)) {
    await mkdir(utilsDir, { recursive: true });

    const utilsContent = `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`;

    await writeFile(utilsFile, utilsContent, 'utf8');
    console.log('  ✓ Created missing lib/utils.ts');
  }
}

async function flattenStructure(sourceDir: string): Promise<void> {
  console.log('🏗️  Flattening project structure...');

  const nextjsDir = join(sourceDir, 'nextjs-website');

  if (!existsSync(nextjsDir)) {
    console.log('❌ nextjs-website directory not found!');
    return;
  }

  // Move everything from nextjs-website to root
  const entries = await readdir(nextjsDir);

  for (const entry of entries) {
    const srcPath = join(nextjsDir, entry);
    const destPath = join(sourceDir, entry);

    if (entry === 'node_modules' || entry === '.next') {
      continue; // Skip these, we'll reinstall
    }

    // If destination exists and is a directory, we need to merge
    if (existsSync(destPath)) {
      const srcStat = await stat(srcPath);
      const destStat = await stat(destPath);

      if (srcStat.isDirectory() && destStat.isDirectory()) {
        console.log(`  📁 Merging ${entry}/`);
        await mergeDirectories(srcPath, destPath);
        continue;
      }
    }

    console.log(`  📄 Moving ${entry}`);
    await copyRecursive(srcPath, destPath);
  }

  // Clean up old nextjs-website directory
  await rm(nextjsDir, { recursive: true, force: true });

  // Update package.json to remove cd commands
  await updatePackageJson(sourceDir, 'flatten');

  console.log('  ✓ Structure flattened successfully');
}

async function focusOnNextJS(sourceDir: string): Promise<void> {
  console.log('🎯 Focusing on nextjs-website as main project...');

  const nextjsDir = join(sourceDir, 'nextjs-website');

  if (!existsSync(nextjsDir)) {
    console.log('❌ nextjs-website directory not found!');
    return;
  }

  // Move useful scripts and configs to nextjs-website
  const filesToMove = [
    'scripts/fix-jsx-syntax.ts',
    'scripts/micro-ux-explorer.ts',
    '.github',
    'docs',
  ];

  for (const file of filesToMove) {
    const srcPath = join(sourceDir, file);
    const destPath = join(nextjsDir, file);

    if (existsSync(srcPath)) {
      console.log(`  📄 Moving ${file} to nextjs-website/`);
      await copyRecursive(srcPath, destPath);
    }
  }

  // Update nextjs-website package.json
  await updatePackageJson(nextjsDir, 'focus');

  console.log('  ✓ Focused on nextjs-website successfully');
  console.log('  ℹ️  You can now work entirely within nextjs-website/');
}

async function copyRecursive(src: string, dest: string): Promise<void> {
  const stats = await stat(src);

  if (stats.isDirectory()) {
    await mkdir(dest, { recursive: true });
    const entries = await readdir(src);

    for (const entry of entries) {
      await copyRecursive(join(src, entry), join(dest, entry));
    }
  } else {
    await mkdir(dirname(dest), { recursive: true });
    await copyFile(src, dest);
  }
}

async function mergeDirectories(src: string, dest: string): Promise<void> {
  const entries = await readdir(src);

  for (const entry of entries) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);

    if (existsSync(destPath)) {
      const srcStat = await stat(srcPath);
      const destStat = await stat(destPath);

      if (srcStat.isDirectory() && destStat.isDirectory()) {
        await mergeDirectories(srcPath, destPath);
      }
      // If file exists, skip (keep existing)
    } else {
      await copyRecursive(srcPath, destPath);
    }
  }
}

async function updatePackageJson(dir: string, mode: 'flatten' | 'focus'): Promise<void> {
  const packageJsonPath = join(dir, 'package.json');

  if (!existsSync(packageJsonPath)) {
    return;
  }

  const content = await readFile(packageJsonPath, 'utf8');
  const packageJson = JSON.parse(content);

  if (mode === 'flatten') {
    // Remove all "cd nextjs-website &&" prefixes from scripts
    if (packageJson.scripts) {
      for (const [key, value] of Object.entries(packageJson.scripts)) {
        if (typeof value === 'string' && value.includes('cd nextjs-website &&')) {
          packageJson.scripts[key] = value.replace('cd nextjs-website && ', '');
        }
      }
    }

    // Update name to reflect it's now the main project
    packageJson.name = '@internetfriends/portfolio';
    packageJson.description = 'InternetFriends Portfolio - Advanced Next.js portfolio with AI-driven development patterns';
  } else if (mode === 'focus') {
    // Add helpful scripts for working in focused mode
    if (!packageJson.scripts) packageJson.scripts = {};

    packageJson.scripts['workspace:root'] = 'cd ..';
    packageJson.scripts['workspace:status'] = 'cd .. && git status';
    packageJson.scripts['fix:jsx'] = 'bun scripts/fix-jsx-syntax.ts';
  }

  await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
  console.log('  ✓ Updated package.json');
}

async function cleanBuildArtifacts(dir: string): Promise<void> {
  const artifactsToRemove = [
    '.next',
    'node_modules',
    '.vercel',
    'dist',
    'build',
    '.turbo'
  ];

  for (const artifact of artifactsToRemove) {
    const artifactPath = join(dir, artifact);
    if (existsSync(artifactPath)) {
      console.log(`  🗑️  Removing ${artifact}`);
      await rm(artifactPath, { recursive: true, force: true });
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const options: RestructureOptions = { ...DEFAULT_OPTIONS };

  // Parse command line arguments
  for (const arg of args) {
    if (arg === '--focus-nextjs') {
      options.mode = 'focus-nextjs';
    } else if (arg === '--flatten') {
      options.mode = 'flatten';
    } else if (arg === '--no-backup') {
      options.backup = false;
    } else if (arg === '--no-jsx-fix') {
      options.fixJSX = false;
    } else if (arg === '--no-clean') {
      options.cleanBuild = false;
    }
  }

  const sourceDir = process.cwd();

  console.log('🚀 InternetFriends Project Restructure Tool');
  console.log(`📂 Working directory: ${sourceDir}`);
  console.log(`⚙️  Mode: ${options.mode}`);
  console.log('');

  try {
    // Step 1: Create backup if requested
    let backupDir = '';
    if (options.backup) {
      backupDir = await createBackup(sourceDir);
      console.log('✅ Backup created successfully');
      console.log('');
    }

    // Step 2: Clean build artifacts
    if (options.cleanBuild) {
      console.log('🧹 Cleaning build artifacts...');
      await cleanBuildArtifacts(sourceDir);
      if (existsSync(join(sourceDir, 'nextjs-website'))) {
        await cleanBuildArtifacts(join(sourceDir, 'nextjs-website'));
      }
      console.log('✅ Build artifacts cleaned');
      console.log('');
    }

    // Step 3: Fix JSX syntax issues
    if (options.fixJSX) {
      console.log('🔧 Fixing JSX syntax issues...');

      const targetDir = options.mode === 'flatten' ? sourceDir : join(sourceDir, 'nextjs-website');
      const results = await fixJSXInDirectory(targetDir);

      console.log(`✅ Fixed ${results.fixes} JSX issues in ${results.files} files`);
      console.log('');
    }

    // Step 4: Restructure project
    if (options.mode === 'flatten') {
      await flattenStructure(sourceDir);
      await createUtilsFile(sourceDir);
    } else if (options.mode === 'focus-nextjs') {
      await focusOnNextJS(sourceDir);
      await createUtilsFile(join(sourceDir, 'nextjs-website'));
    }

    console.log('');
    console.log('🎉 Project restructuring complete!');
    console.log('');

    // Step 5: Next steps
    if (options.mode === 'flatten') {
      console.log('📋 Next steps:');
      console.log('1. Run: bun install');
      console.log('2. Run: bun run build');
      console.log('3. Run: bun run dev');
      console.log('');
      console.log('Your project is now flattened and ready to use! 🚀');
    } else if (options.mode === 'focus-nextjs') {
      console.log('📋 Next steps:');
      console.log('1. cd nextjs-website');
      console.log('2. bun install');
      console.log('3. bun run build');
      console.log('4. bun run dev');
      console.log('');
      console.log('You can now work entirely within nextjs-website/ 🎯');
    }

    if (options.backup) {
      console.log(`💾 Backup saved at: ${backupDir}`);
    }

  } catch (error) {
    console.error('❌ Error during restructuring:', error);

    if (options.backup && backupDir) {
      console.log(`💾 Your backup is safe at: ${backupDir}`);
      console.log('You can restore from backup if needed.');
    }

    process.exit(1);
  }
}

if (import.meta.main) {
  main().catch(console.error);
}
