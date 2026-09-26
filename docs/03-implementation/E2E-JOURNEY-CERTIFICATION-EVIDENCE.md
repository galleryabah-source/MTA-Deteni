# MTA DETENI — End-to-End Journey Certification Evidence

**Certification ID:** MTA-E2EJC-CERT-2026-09-26-01  
**Gate:** End-to-End Journey Certification  
**PR:** #218  
**Evidence baseline commit:** `c0dd61ac3392e9f907022aed9306e0596ed72af1`  
**E2E Certification Run:** #7  
**Environment:** controlled-nonprod / synthetic runtime  
**Status:** CERTIFIED PENDING FINAL-EVIDENCE-COMMIT CI

## Certification scope

The E2E journey is certified only when executable evidence proves the following integrated chain:

```
AUTHENTICATED INPUT
      ↓
QR SCAN
      ↓
RESOLVE
      ↓
DETAINEE DATA
      ↓
ACTION
      ↓
MOVEMENT / PLACEMENT
      ↓
TEMPORARY LEAVE LIFECYCLE
      ↓
AUDIT
      ↓
MONITOR
      ↓
DAILY GUARD REPORT
      ↓
EVIDENCE
      ↓
OFFLINE / REPLAY SAFETY
      ↓
E2E CERTIFICATION
```

## Application/runtime evidence

Application E2E job passed and produced:

- QR verification accepted
- canonical action committed
- mutation transaction context preserved
- audit evidence present
- outbox evidence present
- deterministic Daily Guard report dataset generated
- report evidence hash binding verified
- offline queue replay duplicate protection verified
- integrated acceptance stages PASS

Governance assertions:

- syntheticOnly = TRUE
- productionAccessAuthorized = FALSE
- migrationExecuted = FALSE
- aiEnabled = FALSE

## Browser evidence

Authenticated browser journey passed on:

| Device | Viewport | Result |
|---|---:|---|
| Phone | 390×844 | PASS |
| Tablet | 768×1024 | PASS |
| Desktop | 1440×900 | PASS |
| Desktop HD | 1920×1080 | PASS |

Each browser journey proved:

- authentication boundary
- QR journey
- Detainee CRUD
- Movement mutation
- Placement linkage
- Leave lifecycle through COMPLETED
- mutation correlation lineage
- monitor reflection
- report generation
- report source correlation lineage
- functional operational surfaces
- logout boundary

## Evidence validator

The dedicated E2E validator passed all downloaded evidence artifacts:

```
E2E_JOURNEY_CERTIFICATION=PASS
APPLICATION_E2E=PASS
BROWSER_E2E_4_VIEWPORTS=PASS
GOVERNANCE_LOCKS=PASS
```

## Baseline CI on evidence-producing revision

Before this evidence document was added, the evidence-producing revision `c0dd61ac…` had:

- Static Integration #584 — PASS
- Domain CI #2373 — PASS
- P1 Runtime Observation #587 — PASS
- P9.6 Reconciliation #44 — PASS
- Device Regression #442 — PASS
- E2E Journey Certification #7 — PASS

## Governance

This certification does NOT authorize:

- production database access
- production migration/schema change
- production deployment
- AI activation
- real detainee/PII data
- external transport or durable publication

All remain LOCKED.

## Final decision

The E2E journey evidence is complete for the controlled synthetic/non-production boundary.

**Next master gate:** Cross-Device Hardening.

Final certification is bound only after the final evidence-document commit itself passes all mandatory CI gates.
