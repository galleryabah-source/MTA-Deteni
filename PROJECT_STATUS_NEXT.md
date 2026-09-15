# MTA DETENI — Next Gate

**Foundation:** v1.60+
**Current:** P13.6043–6120 — reconnect state/evidence hardening / observation pending

## Completed

1. deterministic reconnect transitions for APPLY, SKIP_DUPLICATE and REVIEW_CONFLICT;
2. PENDING/SYNCING → SYNCED for APPLY and SKIP_DUPLICATE;
3. PENDING/SYNCING → CONFLICT for REVIEW_CONFLICT;
4. stable command identity and current-state guards;
5. synthetic reconnect evidence bound to commandId, aggregateId, payload hash, idempotency key and transition;
6. regression coverage for reconnect apply, duplicate, conflict and evidence fabrication guards;
7. no adapter writes to live production systems;
8. no schema migration, AI activation or real detainee data.

## Next gate: P13.6161–6200

Build a framework-neutral reporting projection binding for reconnect evidence. The projection must consume immutable evidence, preserve decision/state semantics, reject mismatched command identity, and remain synthetic-only. Then add a complete deterministic regression from offline command through reconnect, evidence and reporting projection.

## Governance lock

Migration Freeze TRUE. AI OFF. Repository SYNTHETIC ONLY. Production access NOT AUTHORIZED. Live PostgreSQL execution BLOCKED pending explicit governance clearance and approved non-production target.

## Observation blocker

Controlled runtime PASS is not claimed until GitHub Actions exposes usable job-step telemetry/logs/artifacts and an approved non-production runtime target exists.
