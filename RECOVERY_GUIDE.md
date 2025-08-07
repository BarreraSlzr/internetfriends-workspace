# Recovery Guide - InternetFriends Project

## 🚨 Emergency Recovery Procedures

This guide helps you recover from common development issues in the InternetFriends portfolio project.

## Current Status Overview

### ✅ Working Components
- **Editor Configuration**: VS Code and Zed settings are properly configured
- **Package Management**: Bun and dependencies are correctly installed
- **Core Framework**: Next.js 15.2.4 with TypeScript is functional
- **Development Server**: `bun run dev` works for basic development

### ⚠️ Known Issues
- Some utility scripts have syntax errors from automated fixes
- Import path resolution issues in certain files
- TypeScript compilation warnings in some files

## Quick Recovery Commands

### 1. Basic System Check
```bash
# Check if development server starts
bun run dev:skip-validation

# Check package integrity
bun install --force

# Basic linting (ignore complex scripts)
bun run lint --quiet
```

### 2. Reset Corrupted Scripts
```bash
# If validation scripts are broken, reset them from git
git checkout HEAD -- scripts/validate-quick.ts
git checkout HEAD -- scripts/fix-*.ts

# Or remove problematic scripts temporarily
mkdir -p .backup-scripts
mv scripts/fix-*.ts .backup-scripts/ 2>/dev/null || true
```

### 3. Essential File Fixes

#### Fix Contact Action (if broken)
```typescript
// app/(internetfriends)/actions/contact.ts
"use server";

import { upsertContactSubmission } from "@/app/(internetfriends)/lib/db/queries/contact";
import { ContactFormData } from "@/app/(internetfriends)/lib/db/schema";

export async function submitContactForm(formData: FormData) {
  try {
    const data: ContactFormData = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      company_name: formData.get("company_name") as string,
      email: formData.get("email") as string,
      project_start_date: formData.get("project_start_date") as string,
      budget: formData.get("budget") as string,
      project_scope: formData.get("project_scope") as string,
    };

    const result = await upsertContactSubmission(data);

    if (!result?.id) {
      return { error: "Failed to submit form" };
    }

    return { _success: true, id: result.id };
  } catch (error) {
    console.error(error);
    return { error: "An unexpected error occurred" };
  }
}
```

## Working Development Workflow

### 1. Start Development
```bash
# Skip validation if scripts are broken
bun run dev:skip-validation

# Alternative: direct Next.js start
bun --bun next dev --turbopack
```

### 2. Check Code Quality
```bash
# Basic linting (safe)
bun run lint

# Type checking (may show import errors, ignore for now)
bun run typecheck

# Format code
bun run format
```

### 3. Safe Building
```bash
# Build without validation
bunx next build

# Start production server
bun run start
```

## Zed Editor Tasks Status

### ✅ Safe Tasks (Always Work)
- 🚀 Dev Server
- 🚀 Dev Server (Skip Validation)
- 🎨 Format Code
- 🏗️ Build
- ✨ Clean & Install

### ⚠️ Unreliable Tasks (May Fail)
- 🔍 Validate System
- ⚡ Quick Validate
- 🔧 Fix scripts (various)
- 📊 Monitor Events

### 🆕 Recovery Tasks Added
- 🔧 Check Syntax Errors
- 🔧 Repair Corrupted Files
- 📋 Quick Status
- 🚨 Recovery Mode

## Import Path Issues Fix

If you see `Cannot find module '@/...'` errors:

### 1. Check tsconfig.json paths
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### 2. Verify file structure
```bash
# Check if files exist
ls -la app/(internetfriends)/lib/db/
ls -la components/
```

### 3. Use relative imports temporarily
```typescript
// Instead of: import { something } from "@/path"
// Use: import { something } from "../../path"
```

## Common File Corruption Patterns

### 1. Missing Closing Braces
Look for functions ending without `}`:
```typescript
// ❌ Broken
export function myFunction() {
  return something;
// Missing closing brace

// ✅ Fixed
export function myFunction() {
  return something;
}
```

### 2. Malformed Object Literals
```typescript
// ❌ Broken
const data = {
  prop: value,
// Missing closing brace

// ✅ Fixed
const data = {
  prop: value,
};
```

### 3. Missing Semicolons
```typescript
// ❌ Broken
const result = await someFunction()
if (result) {

// ✅ Fixed
const result = await someFunction();
if (result) {
```

## Safe Development Practices

### 1. Use Git Frequently
```bash
# Before making changes
git add .
git commit -m "Working state before changes"

# After issues arise
git diff  # See what changed
git checkout -- filename  # Reset specific file
git reset --hard HEAD~1  # Nuclear option: go back one commit
```

### 2. Test Changes Incrementally
```bash
# After each change
bun run dev:skip-validation
# Check browser at http://localhost:3000
# Ctrl+C to stop server
```

### 3. Validate Core Files Only
Focus on fixing these critical files first:
- `app/(internetfriends)/page.tsx` - Main homepage
- `app/(internetfriends)/layout.tsx` - Root layout
- `package.json` - Dependencies
- `next.config.js` - Next.js config

## Emergency Contacts

### File Locations
- **Main Config**: `package.json`, `tsconfig.json`, `next.config.js`
- **Editor Settings**: `.vscode/settings.json`, `.zed/settings.json`
- **Development Tasks**: `.zed/tasks.json`
- **Core App**: `app/(internetfriends)/`

### Useful Commands
```bash
# Find broken TypeScript files
find . -name "*.ts" -o -name "*.tsx" | xargs -I {} sh -c 'echo "Checking {}" && bun run typecheck {} 2>&1 | head -3'

# Count total TypeScript files
find . -name "*.ts" -o -name "*.tsx" | wc -l

# Check for files with syntax issues
grep -l "const data = {" **/*.{ts,tsx} 2>/dev/null
```

## Last Resort Recovery

If everything breaks:

### 1. Fresh Dependencies
```bash
rm -rf node_modules bun.lockb .next
bun install
```

### 2. Reset to Known Good State
```bash
git log --oneline -10  # Find last good commit
git reset --hard <commit-hash>
```

### 3. Minimal Working Setup
Create a basic `page.tsx`:
```typescript
export default function Page() {
  return <div>Hello InternetFriends</div>;
}
```

---

**Remember**: The goal is to get back to a working development environment quickly. Perfect code can be achieved incrementally once the basics are stable.
