# MTA DETENI — Production Readiness Runbook

## Status
Canonical execution order for reaching real production readiness.

**Rule:** Do not add new features while a gate in this sequence is incomplete unless explicitly authorized as a blocker fix.

## Execution Order

1. Post-merge CI verification
2. Deploy to Cloudflare test/staging environment
3. Real-device Master Kamar test
4. F5 final integrity confirmation
5. P9.6 Local PostgreSQL introspection
6. Expected-vs-Actual DB reconciliation
7. Close P9.6 blockers
8. P9.7 Transaction + Idempotency
9. P9.8 Outbox
10. P9.9 Private Storage
11. P9.10 Observability
12. P9.11 Test Harness
13. P9.12 CI
14. P9.13 Kernel Certification
15. Full operational journey certification
16. Security/adversarial certification
17. Production-like staging
18. Production deployment gate
19. Real user acceptance
20. GO-LIVE

## Production Readiness Definition

MTA DETENI is **Ready for Real Production** only when the application can operate with authorized real data and no critical part of the canonical chain remains UNKNOWN or UNVERIFIED:

Scan → Data → Action → Mutation → Audit → Monitor → Report → Evidence

Required final conditions:

- P0 blockers = 0
- P1 blockers = 0
- Critical security findings = 0
- Critical data-integrity findings = 0
- Failed critical journeys = 0
- Unverified production dependencies = 0
- Production deployment gate = PASS
- Real user acceptance = PASS

## Governance Rules

- Treat MTA DETENI as one integrated application, not disconnected features.
- Prioritize audit, integrity, security, data consistency, and operational readiness before feature expansion.
- No production migration during audit/reconciliation gates.
- Do not switch deployment platform away from the Cloudflare baseline without explicit authorization.
- Preserve the existing smartphone bottom navigation: Beranda | Deteni | Scan QR | Laporan | Menu; do not modify its design, position, size, icons, labels, colors, Scan QR button, height, structure, or behavior unless explicitly authorized.
- AI remains controlled by environment/policy and is not a prerequisite for core production operation.
- Every gate must have objective evidence before being marked PASS.
- Every release-bound evidence record must identify the exact Git commit SHA being certified.
- Evidence from an earlier release candidate must remain historical and must not be silently reused for a newer candidate.

## Current Release Boundary

**Canonical release candidate:** `79fb0a4c77debf7d8e56484e6515f1db7af35f1a`

Current verified evidence on this release includes the mandatory CI/certification gates already recorded in PR #220. The production readiness gate remains **NO-GO** because production deployment and real UAT have not been executed for this exact release candidate.

The existing staging/UAT document records a successful certification for release `36b423263403958ec763671ecddcbd61393c7a6d`. That evidence is historical and is not valid as release-bound evidence for `79fb0a4`.

## Immediate Next Sequence

1. Run **Production-like Staging UAT** manually against the exact release candidate `79fb0a4c77debf7d8e56484e6515f1db7af35f1a`.
2. Confirm the generated staging evidence artifact binds to that exact SHA and all synthetic-only governance controls remain PASS.
3. Execute the **manual Cloudflare production deployment gate** against the same release candidate.
4. Confirm production `/api/health` PASS from the deployment workflow.
5. Perform **Real User Acceptance** against the exact production release.
6. Record production deployment and real-UAT evidence with the exact release SHA.
7. Re-run the Production Readiness Gate. It may become PASS only when every required evidence contract is present, current, and SHA-bound.
8. Only after that gate is PASS may GO-LIVE be considered.

This document is the canonical execution guide for subsequent MTA DETENI work.
