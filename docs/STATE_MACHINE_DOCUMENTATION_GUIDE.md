# State Machine Documentation Guide

This guide defines how to create, maintain, and locally verify Mermaid-based state / sequence / flow diagrams for InternetFriends.

## Core Principles

1. Canonical Time: Never embed raw dates. Use comments indicating `getIsoTimestamp()` / `generateStamp()` sources.
2. Traceability: Each diagram includes frontmatter-style comments with: id, title, createdAt (placeholder), stamp placeholder, description.
3. Scannability: Keep main state machines ≤ 7 primary states; nest detail states.
4. Active Voice: Transitions are verb-based (e.g., `Analyze`, `Aggregate`, `EmitJSON`).
5. Param Object Alignment: Diagram state names align with params object phases when possible.

## File Naming

```
<domain>.<name>.<kind>.mmd
```
- kind ∈ {`state`, `sequence`, `flow`}
- Extended variants: place under `extended/` subfolder mirroring the same base filename.

## Frontmatter Comment Block

```
%%
%% id: <unique-id>
%% title: <Readable Title>
%% createdAt: USE getIsoTimestamp() VIA CODE, NOT MANUAL DATE
%% stamp: generate with generateStamp()
%% description: <short summary>
%%
```

## Diagram Kinds

- State Machine: `stateDiagram-v2`
- Sequence: `sequenceDiagram`
- Flow / High-Level: `flowchart TD`

## Validation Workflow (Local)

1. Author or modify `.mmd` file.
2. Open Markdown/diagram preview (Mermaid extension) and visually inspect.
3. Run (future) script `bun scripts/scan-diagrams.ts --lint` (placeholder) for structure rules.
4. Commit with conventional commit type `docs(state): ...` or `docs(sequence): ...`.

## Planned Automation

A future script will:
- Parse all `.mmd` files under `docs/state/`
- Ensure required frontmatter placeholders present
- Optionally inject canonical timestamps at release tagging time
- Output JSON index consumed by tooling / site generation

## Examples

See `state/orchestration.opencode-session.state.mmd` for baseline pattern.

## Next Steps

- Implement `scripts/scan-diagrams.ts` to enforce rules
- Add CI step to validate diagrams
- Extend helper to emit dynamic diagrams from runtime traces (future)
