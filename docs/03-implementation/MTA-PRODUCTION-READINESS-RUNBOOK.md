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

## Current Direction

The immediate sequence begins with post-merge CI verification, followed by Cloudflare test/staging deployment and real-device Master Kamar testing. After those checks, return to P9.6 database introspection and reconciliation.

This document is the canonical execution guide for subsequent MTA DETENI work.