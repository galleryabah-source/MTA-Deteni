# MTA DETENI — Current Closure Status

**Revision:** `558fe7d51395a050ee9167faef54b6f4ddefb47a`  
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
- Cross-stage binding for:
  - domain journey
  - offline/reconnect
  - QR
  - Daily Guard Report
  - audit/outbox correlation
- Negative-path regression for stage incompleteness and audit/outbox correlation drift.
- Documentation now distinguishes contract completion from runtime evidence.

## Still open before production activation

1. Offline/LAN execution with an actual local runtime and reconnect/reconciliation evidence.
2. Daily Guard Report + QR + desktop/tablet/smartphone acceptance.
4. Cloudflare controlled-nonprod validation.
6. Backup/restore and disaster-recovery execution evidence.
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
