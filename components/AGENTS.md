# AGENTS.md - InternetFriends Components Library

## Build/Test Commands
- `bun run typecheck` - TypeScript type checking
- `bun run build` - Build component library
- `bun run dev` - Development integration guide
- `bun test specific.test.ts` - Run single test file
- From workspace root: `bun run test`, `bun run lint`, `bun run build`

## Code Style Guidelines
- **Runtime**: Bun (>=1.2.0) for all scripts and package management
- **File naming**: snake_case.dots (e.g., `navigation.molecular.tsx`, `types.ts`)
- **Component structure**: Atomic design pattern (`atomic/`, `molecular/`, `organisms/`)
- **Imports**: Relative imports within components, React as default import
- **Types**: Explicit TypeScript with dedicated `types.ts` files, use `React.FC`
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Props**: Max 8 props per component (steadiest addressability pattern)
- **Comments**: Detailed JSDoc for public APIs, minimal inline comments
- **Error handling**: Proper null checks, early returns for disabled states

## Key Patterns
- Steadiest addressability: ≤8 props, productive defaults, stable config patterns
- Glass-refinement-v1 epic: minimal config surface, once-on-mount logic
- Client/server boundaries with `useEffect` for client-only features
- Theme-aware with CSS custom properties: `var(--color-text-primary)`
- Priority-based rendering and data attributes for state: `data-testid`, `data-config-id`
- Stamp-based unique IDs using `generateStamp()` utility

Refer to `/Users/emmanuelbarrera/Projects/InternetFriends/zed_workspace/.github/copilot-instructions.md` for comprehensive architecture details.