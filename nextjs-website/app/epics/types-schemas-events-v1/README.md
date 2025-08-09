# Epic: types-schemas-events-v1

Epic Phase: development
Epic Owner: InternetFriends Engineering (AI‑augmented)
Start Date: (set when branch created)
Target Duration: ~7 days
Status: INIT

---

## 1. Objective

Establish a unified, introspectable, and validated foundation for:

- Domain **types**
- **Zod schemas** (forms, events, compute, UX data)
- **Event system** (canonical catalog + runtime validation + metrics)

This foundation enables:
1. Safe incremental migration from legacy / production.
2. Strong runtime correctness (API & event payload validation).
3. Automated developer experience “agent loop”.
4. Production parity snapshot + diff tooling.
5. Measurable performance baselines.

---

## 2. Success Criteria (Definition of Done)

| Category | Target |
|----------|--------|
| Schema Registry Coverage | ≥ 90% of existing meaningful schemas registered |
| Event Canonicalization | 100% of emitted top-level event types appear in catalog |
| API Validation | 100% of new/modified routes use validation factory |
| Orphan Schemas | 0 (all `.schema.ts` files registered or intentionally ignored list) |
| Event Throughput Baseline | Recorded & persisted in `metrics.json` |
| Strict Type Build | `ignoreBuildErrors` removed; `bun run typecheck` clean |
| Docs Generation | `docs/generated/schemas.md` & `docs/generated/events.md` auto-built |
| Parity Snapshots | First prod vs local diff stored; variance < 5% basic heuristic |
| Dev Agent | Single command summarizes structure + registry + events + parity |

---

## 3. Feature Breakdown

| Feature Key | Description | Output Artifacts |
|-------------|-------------|------------------|
| schema-registry | Central index of Zod schemas w/ domains & fixtures | `schemas/registry.ts` |
| event-canonicalization | Catalog mapping event type → schema | `lib/events/catalog.ts` |
| event-payload-validation | Wrapper emitter validating payloads | `lib/events/validated-emitter.ts` |
| runtime-api-validation | Route handler factory w/ Zod enforcement | `lib/api/handler.factory.ts` |
| production-parity-snapshots | Snapshot + diff of prod vs local | `snapshots/**` + diff logs |
| scaffolding-dx | Scripts: scaffold component + schema | `scripts/scaffold-*` |
| generated-docs | Auto-build schema & event docs | `docs/generated/*.md` |
| metrics-benchmark | Event throughput & registry stats | `app/epics/types-schemas-events-v1/metrics.json` |
| strictness-enablement | Remove loose build flags | Updated `next.config.ts` |

---

## 4. Checklist

### Foundation
- [ ] Create epic branch `epic/types-schemas-events-v1`
- [ ] Add registry skeleton
- [ ] Add event catalog skeleton
- [ ] Commit metrics seed file

### Schemas
- [ ] Inventory all existing schemas (`schemas/`, `lib/**`, `forms`)
- [ ] Register ≥ 50% (phase 1)
- [ ] Register ≥ 90% (phase 2)
- [ ] Add fixtures for critical schemas (auth, compute, forms)

### Events
- [ ] Enumerate current event types from `event.system` usage
- [ ] Populate `EventCatalog`
- [ ] Implement validated emitter
- [ ] Diff script: enum vs catalog vs runtime observed

### API Validation
- [ ] Introduce `createValidatedHandler`
- [ ] Migrate first route
- [ ] Migrate remaining routes
- [ ] Add agent check ensuring all routes validated

### Parity
- [ ] Implement `snapshot-prod` script
- [ ] Implement local snapshot script
- [ ] Diff heuristic: HTML length, hash, meta tag count
- [ ] Store diff summary JSON

### DX / Agent
- [ ] `scaffold-component` script
- [ ] `scaffold-schema` script
- [ ] `validate-structure` script (naming)
- [ ] `dev-agent` orchestrator
- [ ] Add to pre-commit (optional gating)

### Docs
- [ ] Generate schema docs
- [ ] Generate event docs
- [ ] Link docs in root README or architecture doc

### Metrics
- [ ] Event throughput benchmark baseline
- [ ] Registry coverage metrics
- [ ] Orphan schema detection
- [ ] Commit updated `metrics.json` each meaningful change

### Strictness
- [ ] Turn off `ignoreBuildErrors` (branch only)
- [ ] Resolve surfaced errors
- [ ] Confirm CI pass (if configured)
- [ ] Merge w/ strict mode retained

---

## 5. Milestone Plan (Day-by-Day Outline)

| Day | Focus |
|-----|-------|
| 1 | Branch + registry + event catalog scaffolds + metrics seed |
| 2 | Populate registry & event catalog (50–70%) + validated emitter |
| 3 | API handler factory adoption + structure & schema scaffolding scripts |
| 4 | Production/local snapshot + diff tooling |
| 5 | Docs generation + orphan detection + event benchmark |
| 6 | Strict type enablement + fix errors + raise coverage to ≥90% |
| 7 | Final metrics update + prune TODOs + epic completion PR |

---

## 6. Metrics File Specification

`metrics.json` structure (auto-updated by agent):

```jsonc
{
  "timestamp": "ISO8601",
  "schemaCount": 0,
  "schemasRegistered": 0,
  "schemaCoveragePct": 0,
  "orphanSchemas": [],
  "eventTypesEnum": 0,
  "eventTypesCatalogued": 0,
  "eventCatalogCoveragePct": 0,
  "eventThroughput": {
    "baselineEventsPerSecond": 0,
    "lastBenchmark": 0
  },
  "parity": {
    "lastProdSnapshot": null,
    "lastLocalSnapshot": null,
    "htmlLengthDeltaPct": null,
    "hashMatch": null
  },
  "strictBuild": false
}
```

---

## 7. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Surfacing large type debt | Slows strictness | Phase enforcement (warn → fail) |
| Over-modeling unstable domains | Rework | Start with core (auth, compute, events) |
| Event schema drift | Runtime failures | Diff script + CI gate |
| Snapshot flakiness (dynamic content) | False positives | Normalize / strip volatile sections |
| Registry bloat | Complexity | Tag schemas with domains; prune orphan list weekly |

---

## 8. Design Principles Applied

1. Single Source of Truth: central registry + event catalog.
2. Incremental Hardening: enable strictness only after instrumentation.
3. Transparency: metrics committed to repo; epics visible in graph.
4. Developer Velocity: scaffolding & agent automate repetitive tasks.
5. Observability: parity + throughput benchmarks provide baselines.

---

## 9. Implementation Order (Granular)

1. Create seed files:
   - `schemas/registry.ts`
   - `lib/events/catalog.ts`
   - `lib/events/validated-emitter.ts`
   - `scripts/benchmark-events.ts` (if missing)
2. Add `dev-agent` script (collects registry + events + throughput).
3. Add `scaffold-schema` + `scaffold-component`.
4. Create parity scripts (`snapshot-prod`, `snapshot-local`, `diff`).
5. Introduce API handler factory & migrate representative endpoints.
6. Generate docs & integrate into agent.
7. Activate strict mode & remediate issues.
8. Finalize metrics and mark features done.

---

## 10. Event Canonicalization Strategy

Phases:
- Phase A: Log unknown events (warn).
- Phase B: Soft-fail CI if unknown events > 0.
- Phase C: Hard validation (disallow emit unless catalogued OR explicitly whitelisted).

---

## 11. Parity Diff Heuristics (Initial Simple Rules)

| Signal | Check |
|--------|-------|
| HTML length | Δ ≤ 5% |
| SHA-256 hash | Informational only early |
| <meta> count | Must not decrease unexpectedly |
| Title presence | Required |
| Core sections (`header`, `main`, `footer`) | All present |

Future: Integrate Lighthouse JSON diff & performance budgets.

---

## 12. Open Questions (Track & Resolve)

| Question | Resolution Target |
|----------|-------------------|
| Which events are core vs experimental? | By mid epic |
| Should forms & events unify envelope fields? | After registry stabilization |
| Introduce schema versioning? | Defer to next epic |
| Add OpenAPI generation from Zod? | Candidate for follow-up epic |

---

## 13. Exit Criteria Validation Script (Planned)

A composite script will:
- Assert `schemaCoveragePct >= 0.9`
- Assert `eventCatalogCoveragePct == 1`
- Assert `strictBuild == true`
- Output final metrics summary for PR template

---

## 14. Epic Completion Template (For PR)

```
### Epic Completion: types-schemas-events-v1

Summary:
- Registry coverage: X / Y (Z%)
- Event catalog coverage: 100%
- Orphan schemas: []
- Baseline events/sec: ####
- Parity delta (HTML length): N%
- Strict build: ✅

Artifacts:
- metrics.json
- docs/generated/schemas.md
- docs/generated/events.md
- snapshots/prod/, snapshots/local/

Risks Follow-up:
- (list any deferred items)
```

---

## 15. Next Epic Candidates (Post Completion)

1. `ui-architecture-bootstrap-v1`
2. `production-parity-enhanced-v1` (Lighthouse + visual regression)
3. `event-performance-optimization-v1`
4. `schema-openapi-integration-v1`
5. `observability-dash-v1`

---

## 16. Current State Snapshot (To Fill As We Progress)

- Registered Schemas: (TBD)
- Total Discovered Schemas: (TBD)
- Event Enum Count: (TBD)
- Catalogued Events: (TBD)
- Benchmark (Events/sec): (TBD)
- Parity HTML Δ: (TBD)

(These will be auto-updated in metrics and optionally reflected here.)

---

## 17. Maintenance Notes

- Any new `.schema.ts` must either be registered or added to ignore list (to be created only if noise appears).
- Keep `metrics.json` small & append-only fields strictly—avoid diff churn for volatile diagnostics.

---

## 18. Commands (Expected After Scripts Added)

```
bun run schema:list
bun run schema:validate
bun run events:benchmark
bun run parity:prod
bun run parity:local
bun run parity:diff
bun run agent:dev
bun run scaffold:schema <Name>
bun run scaffold:component atomic button
```

---

## 19. Final Merge Gate

Merge only when:
- All checklist items checked.
- Exit criteria script green.
- metrics.json committed with final snapshot.
- PR uses completion template.

---

## 20. Log / Notes (Append Below During Execution)

(Use this section to record decisions, deviations, blockers.)

---

End of README (living document during epic).
