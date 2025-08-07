# /schemas

This folder contains all Zod schemas for the project, organized by domain.

- Use the pattern: /schemas/<scope>/<domain>.schema.ts or directly /schemas/<domain>.schema.ts (e.g., ml.schema.ts, fossil.schema.ts, zod.schema.ts)
- Import schemas from here in all scripts, tests, and utilities
- See docs/TYPE_AND_SCHEMA_PATTERNS.md for conventions 