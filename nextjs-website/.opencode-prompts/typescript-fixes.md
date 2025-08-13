# TypeScript Error Fixes

Please fix the following critical TypeScript errors that are blocking our development pipeline:

## Priority Errors to Fix:

1. **Module Resolution Issues:**
   - `Cannot find module '@/lib/events/pattern-monitor'`
   - `Cannot find module './schema'` in database files
   - Missing type declarations across event system

2. **Type Safety Issues:**
   - Implicit 'any' types in database column definitions
   - Missing null checks in string/undefined assignments
   - Generic type constraints in React Flow components

3. **Import/Export Problems:**
   - Circular dependency in database schema imports
   - Missing default exports in event modules
   - Incorrect path resolutions

## Focus Areas:

### 1. Fix Event System Modules

- Ensure proper exports in `lib/events/pattern-monitor.ts`
- Fix imports in `lib/events/horse-race-pipeline.ts`
- Add proper type declarations

### 2. Database Schema Resolution

- Fix missing `schema.ts` imports
- Ensure Kysely types are properly configured
- Add proper column type definitions

### 3. Component Type Safety

- Fix React Flow edge type assignments
- Add proper props interfaces
- Ensure all components have proper TypeScript coverage

## Approach:

1. Start with module resolution - ensure all imports work
2. Fix database types using existing Kysely patterns
3. Add proper TypeScript interfaces throughout
4. Maintain compatibility with existing bun/zod/kysely stack

**Current Status**: 🚨 Critical - Blocking development pipeline
**Expected Result**: ✅ All TypeScript errors resolved, full type safety
