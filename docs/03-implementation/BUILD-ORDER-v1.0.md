# MTA DETENI — Implementation Build Order v1.0

## Objective

Build MTA DETENI as one coherent production-grade platform. Implementation proceeds in dependency order; no feature is considered complete without authorization, validation, audit, tests, and observability.

## Wave 1 — Platform Kernel

1. Repository/application skeleton.
2. Runtime configuration contract.
3. Error taxonomy and API response contract.
4. Database access layer.
5. Identity/session abstraction.
6. Authorization Control Plane contract.
7. Audit/event primitives.
8. Correlation/request context.
9. Health/readiness endpoints.
10. Test harness.

**Gate:** build, typecheck, unit tests, and kernel integration tests pass.

## Wave 2 — Domain Foundation

1. Site/Rudenim context.
2. Users and roles.
3. Permission catalog.
4. Deteni master record.
5. Document registry.
6. Status/history.
7. Provenance.
8. Classification and retention metadata.

**Gate:** domain contract and authorization tests pass.

## Wave 3 — Operational Core

1. Block/room/bed.
2. Placement.
3. Movement ledger.
4. Headcount.
5. Temporary exit.
6. Escort.
7. Notifications.

**Gate:** critical state transitions are transactional, idempotent, and audited.

## Wave 4 — Document Engine

1. Template registry.
2. Template validation.
3. Field mapping.
4. DOCX generation.
5. Document integrity hash.
6. Numbering/register.
7. Review/approval/issue lifecycle.
8. Distribution/archive.
9. Rendering regression tests.

**Gate:** both mandatory DOCX outputs pass end-to-end tests.

## Wave 5 — Leadership & Access Governance

1. Task inbox.
2. PETUNJUK/ARAHAN/REKOMENDASI/DISPOSISI.
3. Follow-up/closure.
4. Super Admin RBAC Console.
5. Dependency engine.
6. Conflict engine.
7. Policy simulator.
8. Critical-change second approval.
9. Rollback.

**Gate:** RBAC mutation and privilege-escalation suite passes.

## Wave 6 — Intelligence & Reporting

1. Detainee timeline.
2. Operational dashboards.
3. KPI/reporting.
4. Alerts/exceptions.
5. Controlled OCR/intake.
6. Official-message intake.
7. Transcript extraction.
8. Human verification queue.

**Gate:** no unverified extraction reaches canonical records.

## Wave 7 — Production Readiness

1. Performance/load tests.
2. Security regression.
3. Backup/restore drill.
4. Audit integrity verification.
5. Disaster recovery rehearsal.
6. Accessibility/usability review.
7. Operational runbooks.
8. UAT.
9. Pilot.
10. Production release.

## Coding Rules

- TypeScript strict mode.
- No `any` in domain/security code unless explicitly justified.
- Domain rules must be unit-testable without UI.
- API handlers must remain thin; business rules belong in application/domain services.
- Every mutation validates input and authorization server-side.
- Critical mutations are transactional and idempotent where retries are possible.
- Every critical mutation emits an auditable event.
- No raw SQL bypass around policy-sensitive operations without documented review.
- No secrets in source control.
- No real detainee data in fixtures.
- No migration until the relevant contract gate is approved.
