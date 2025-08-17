# AGENTS.md - InternetFriends Development Guide

## Build/Test Commands
- `bun run dev` - Start development server (from root or nextjs-website/)
- `bun run build` - Production build
- `bun run lint` - ESLint check
- `bun run typecheck` - TypeScript type checking
- `bun run test` or `bun run test:unit` - Run unit tests
- `bun run test:e2e` - Playwright E2E tests
- `bun test tests/unit/specific.test.ts` - Run single test file
- `bun run format` - Prettier formatting

## AI/OpenCode Enhanced Commands
- `bun ./scripts/ai-context/context-provider.ts` - Get comprehensive AI workspace context
- `./scripts/git-docs/orchestrator.sh` - Generate Git-sourced documentation with GitHub attribution
- `./scripts/git-docs/breaking-change-detector.sh` - Analyze breaking changes for AI context
- `./components/scripts/opencode-delegate.ts` - Generate OpenCode task delegation
- `./scripts/epic-tools/epic dashboard` - Epic status with AI metrics
- See `CLAUDE.md` for complete OpenCode configuration patterns

## Code Style Guidelines
- **Runtime**: Bun (>=1.2.0) for all scripts and package management
- **File naming**: snake_case.dots (e.g., `button.atomic.tsx`, `header.styles.module.scss`)
- **Component structure**: Atomic design pattern (`components/atomic/`, `molecular/`, `organisms/`)
- **Imports**: Use `@/` for absolute imports from project root
- **Types**: Explicit TypeScript with dedicated `types.ts` files, use `React.FC` for components
- **Styling**: SCSS modules only, CSS custom properties for theming (e.g., `var(--color-text-primary)`)
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Error handling**: Use Zod schemas for validation, proper error boundaries for React
- **Testing**: Use `bun test` with descriptive test names, avoid file creation for quick tests

## Key Patterns
- Epic-based development workflow with `./scripts/epic-tools/epic` CLI
- Git-sourced documentation with professional GitHub attribution
- AI-enhanced context provider for comprehensive workspace intelligence
- Glass morphism design system with compact border radius (max 12px)
- Blue-centric color palette (#3b82f6 primary)
- No comments unless explicitly requested
- CSS Modules required (no :global() selectors)
- Focus states use 2px dashed borders (Mermaid viewer style)

## AI Integration
- **Context Provider**: `./scripts/ai-context/context-provider.ts` for comprehensive workspace context
- **OpenCode Config**: `CLAUDE.md` contains enhanced OpenCode configuration patterns
- **Git Documentation**: Professional source attribution with GitHub links
- **Epic Integration**: AI-aware epic management and progress tracking
- **Visual Testing**: Git-integrated visual regression testing

Refer to `.github/copilot-instructions.md` for comprehensive architecture details and epic management.