# MTA DETENI — Unified Data Flow Audit Certification Evidence

**Certification ID:** MTA-UDF-CERT-2026-09-26-01  
**Gate:** Unified Data Flow Audit  
**Certified commit:** `aee6b19e6feb0c8f345a9558cc528ae06adcf434`  
**Branch:** `gate/unified-data-flow-audit`  
**PR:** #217  
**Environment:** controlled-nonprod / synthetic browser runtime  
**Status:** **CERTIFIED**

## 1. Certification decision

**UNIFIED DATA FLOW AUDIT — CERTIFIED**

The operational browser/runtime path has been verified against:

```
INPUT
  ↓
CANONICAL STATE
  ↓
VALIDATION
  ↓
AUTHORIZATION
  ↓
ACTION
  ↓
MUTATION
  ↓
AUDIT
  ↓
MONITOR
  ↓
REPORT
  ↓
EVIDENCE
  ↓
CERTIFICATION
```

Certification is limited to the controlled synthetic/non-production boundary represented by the certified commit.

## 2. Remediation results

| Finding | Result | Evidence |
|---|---|---|
| UDF-001 Leave return mutation bypass | CLOSED | `p5return` delegates to canonical leave transition |
| UDF-002 Multiple QR resolve paths | CLOSED | manual/preview QR entrypoints delegate to `mtaUnifiedResolve` |
| UDF-003 QR action split | CLOSED | QR action reaches canonical action boundary |
| UDF-004 Movement mutation split | CLOSED | Movement UI delegates to `mtaUnifiedCreateMovement`; placement remains canonical |
| UDF-005 Authorization boundary verification | CLOSED FOR CONTROLLED RUNTIME | authenticated browser acceptance executes protected surfaces under resolved auth context |
| UDF-006 Mutation → Report correlation lineage | CLOSED | movement/placement/leave correlation persisted; report evidence carries source correlation lineage |
| UDF-007 Synthetic-only contract vs real browser flow | CLOSED | authenticated Playwright browser journey executed actual UI entrypoints |
| UDF-008 persistence fallback | CLOSED AS NON-BLOCKING STORAGE ADAPTER | State Kernel is the operational runtime source; fallback remains local synthetic compatibility and does not introduce a second domain mutation command |

## 3. Browser evidence

Device Regression #434 passed all four viewports:

- Phone: 390×844 — PASS
- Tablet: 768×1024 — PASS
- Desktop: 1440×900 — PASS
- Desktop HD: 1920×1080 — PASS

Authenticated browser journey evidence included:

- QR Resolve → Action → Audit
- Detainee CRUD → Audit
- Movement → Placement → Audit
- Leave lifecycle DRAFT → SUBMITTED → APPROVED → DEPARTED → RETURNED → COMPLETED
- one journey correlation preserved across Leave lifecycle
- Monitor reflects mutations
- Daily Guard Report evidence includes source records and source correlation lineage
- functional surface navigation
- logout/authentication boundary

Representative phone evidence:

```
AUTH_QR_JOURNEY_PASS
AUTH_DETAINEE_CRUD_PASS
AUTH_MOVEMENT_MUTATION_PASS
AUTH_LEAVE_MUTATION_PASS
AUTH_REPORT_EVIDENCE_PASS
AUTH_FUNCTIONAL_SURFACES_PASS
AUTH_BROWSER_ACCEPTANCE_PASS
```

## 4. CI evidence on certified commit

All mandatory gates GREEN on `aee6b19e6feb0c8f345a9558cc528ae06adcf434`:

- Static Integration Gate #576 — PASS
- Domain CI #2365 — PASS
- P1 Runtime Observation #579 — PASS
- P9.6 Local PostgreSQL Reconciliation #36 — PASS
- Device Regression #434 — PASS

## 5. Canonical ownership verified

### QR

```
Camera / Manual / Preview
        ↓
mtaUnifiedResolve
        ↓
QR Context
        ↓
mtaUnifiedAction
        ↓
Operational Action
```

### Movement

```
Movement UI
    ↓
mtaUnifiedCreateMovement
    ↓
Canonical Placement
    ↓
Movement Mutation
    ↓
Audit
```

### Temporary Leave

```
Leave UI
    ↓
advanceLeaveCommand
    ↓
one journey correlation
    ↓
Audit per transition
    ↓
COMPLETED
```

### Report

```
Operational mutations
        ↓
shared synthetic state
        ↓
source records
        ↓
sourceCorrelationIds
        ↓
report evidence
```

## 6. Governance locks

The following remain LOCKED:

- Production DB access: **NO**
- Production migration/schema change: **NO**
- Production deployment: **NO**
- AI activation: **NO**
- Real detainee data: **NO**
- External/durable publication: **NO**

This certification does not authorize any of those activities.

## 7. Final status

# 🟢 UNIFIED DATA FLOW AUDIT — CERTIFIED

The next master-sequence gate is:

**End-to-End Journey Certification**

No production action is implied by this certification.
