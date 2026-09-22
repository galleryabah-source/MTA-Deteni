# MTA DETENI — Current Closure Status

**Revision:** `a81e24bb41310e9eaaefaa90d64a294a43df2486`  
**Date:** 2026-09-22

## Verified

- Domain CI run 1446: **PASS**
  - static architecture gate
  - production typecheck
  - test typecheck
  - JavaScript regression suite
  - TypeScript domain suite
  - controlled execution evidence harness
  - evidence validator
  - evidence artifact upload
- P1 Runtime Observation run 237: **PASS**
- Supabase project `MTA DETENI`: **ACTIVE_HEALTHY**
- Supabase Security Advisor: **0 findings**
- Supabase Performance Advisor: 8 INFO unused-index observations; retained intentionally because the database is still synthetic/low-volume and the indexes are part of the planned operational access paths.

## Implemented in this closure pass

- Integrated Acceptance Journey contract `IAJ-v1`
- Controlled-nonprod executable Integrated Acceptance runtime evidence: Domain CI Run #1470; artifact `10673903431`; all five mandatory stages observed PASS.
- Local Runtime Adapter executable evidence: Domain CI Run #1480 **PASS**.
- Local Runtime Recovery executable evidence: Domain CI Run #1480 **PASS**; artifact `10674888472` proves first admission APPLY, idempotent replay `REPLAYED`, fingerprint drift `CONFLICT/FINGERPRINT_CONFLICT`, deterministic sync APPLY, and deterministic sync replay `REPLAYED`.
- The evidence remains synthetic controlled-nonprod adapter/engine evidence; physical PC/LAN deployment remains an external acceptance gate.
- Cross-stage binding for:
  - domain journey
  - offline/reconnect
  - QR
  - Daily Guard Report
  - audit/outbox correlation
- Negative-path regression for stage incompleteness and audit/outbox correlation drift.
- Backup/recovery continuity executable evidence: Domain CI Run #1484 **PASS**, including valid-chain READY, missing-predecessor BLOCKED, and committed recovery certification with canonical RETRY → SKIP_DUPLICATE evidence.
- Runtime device/handoff executable evidence: Domain CI Run #1489 **PASS**; CLOUD/DESKTOP, LAN/TABLET, LOCAL/SMARTPHONE capability contracts, certified handoff with pending reconciliation, and responsive invariants were executed successfully.
- Physical device acceptance remains separate from synthetic CI evidence.
- Documentation now distinguishes contract completion from runtime evidence.

## Still open before production activation

1. Physical Offline/LAN execution on the intended PC/local runtime, including real local persistence, reconnect/reconciliation, and device/network handoff acceptance.
2. Daily Guard Report + QR + desktop/tablet/smartphone acceptance.
4. Cloudflare controlled-nonprod runtime validation.
6. Backup/restore and disaster-recovery execution evidence against an actual recoverable runtime/storage target; synthetic backup-chain and recovery certification are now executable but do not substitute for restore testing.
7. Canonical scope-authorization model before tightening domain SELECT RLS.
8. Final production-readiness review.

## Deployment hardening

- Cloudflare production deployment is now **manual (`workflow_dispatch`)** rather than automatic on every `main` push.
- The production workflow performs an artifact preflight before reading deployment credentials or invoking Wrangler.
- Cloudflare preview remains the controlled non-production path; its independent runtime-health verification is still open because the preview hostname is not yet fixed in deployment configuration.

## Governance locks

- No production migration execution is implied by this status.
- No real detainee/PII/health/WhatsApp data.
- AI remains disabled as a decision-maker.
- External durable publication remains disabled unless separately authorized.
- No production GO decision is inferred from CI PASS alone.

## Decision

The repository/domain baseline is now **CI-green and contract-complete for the integrated acceptance composition**, but the application is **not yet declared production-ready**. The remaining work is runtime/environmental validation, recovery evidence, scope authorization, and final operational acceptance.
