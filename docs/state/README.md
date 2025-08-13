# State Machines & Orchestration Diagrams

This directory contains Mermaid-based diagrams describing the lifecycle, state machines, and orchestration flows for core InternetFriends automation and component behaviors.

## Conventions

- All diagrams use canonical timestamps only when annotating events (reference `getIsoTimestamp()` / `generateStamp()` in comments, never raw Date APIs).
- File naming: `<domain>.<name>.state.mmd` for state machines, `<domain>.<name>.sequence.mmd` for sequences, `<domain>.<name>.flow.mmd` for higher-level flows.
- Each diagram must include Frontmatter comment with: id, title, createdAt (canonical), stamp.
- Keep transitions verb-based and in active voice.
- Prefer compact states (≤ 7) for primary diagrams; extended / derived states go into an `extended/` subfolder if needed.

## Quick Edit & Preview

Use the recommended Mermaid extension for live preview. For CLI export (local), you can integrate `mmdc` later if desired.

## Index

- `orchestration.opencode-session.state.mmd` – OpenCode helper orchestration lifecycle
- `orchestration.analysis.sequence.mmd` – Detailed sequence flow for component analysis

Contribute new diagrams via conventional commits: `docs(state): add <domain> <name> state machine`.
