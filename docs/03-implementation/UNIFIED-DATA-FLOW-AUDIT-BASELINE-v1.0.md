# MTA DETENI — Unified Data Flow Audit Baseline

**Gate:** Post-P9.6  
**Audit ID:** MTA-UDF-AUDIT-2026-09-26-01  
**Baseline commit:** 1ccb645ba979acd1cdbb0027664348f2c5b46134  
**Branch:** gate/unified-data-flow-audit  
**Status:** AUDIT IN PROGRESS — NOT CERTIFIED

## 1. Scope

Audit the real application flow against the canonical chain:

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

The audit covers QR/scan entrypoints, detainee/placement/movement/temporary-exit mutations, audit correlation, monitoring/reporting, offline/replay boundaries, and certification realism.

No production DB, migration, AI activation, real detainee data, or production deployment is authorized by this gate.

## 2. Existing controls confirmed

- P9.6 database contract/reconciliation is certified separately.
- State Kernel exists as the intended synthetic persistence boundary.
- Unified Shell is the intended navigation dispatcher.
- Canonical placement command exists.
- Canonical temporary-exit application workflow exists.
- Unified Journey Certification requires Scan → Resolve → Context → Action → Mutation → Audit → Monitor → Report → Evidence and correlation continuity.
- Integrated Acceptance Certification binds domain, offline/reconnect, QR, report, and audit/outbox stages.
- AI remains OFF and production database access remains disconnected/frozen.

## 3. Findings

### UDF-001 — Temporary-exit return has a direct mutation bypass
**Severity:** HIGH  
**Evidence:** `web/preview-v5.js` exposes `window.p5return` and directly assigns `l.status='RETURNED'`, revokes the QR, persists, and writes audit events.

**Risk:** The browser entrypoint can mutate temporary-exit state without traversing the canonical `TemporaryExitWorkflow` authorization/state-transition boundary. This creates a split path between the application workflow and the synthetic browser workflow.

**Required remediation:** Route return through one canonical temporary-exit transition command. Browser code must not directly mutate leave state.

**Gate status:** BLOCKED

### UDF-002 — QR scanner has multiple resolution paths
**Severity:** HIGH  
**Evidence:** Unified Shell contains `mtaUnifiedResolve` with QR context verification, while `preview-v6.js` contains a separate `p6manualScan` token lookup and `preview-v5.js` contains `p5resolve`.

**Risk:** Different scan entrypoints can apply different validation/context/expiry semantics. A contract may pass on the unified resolver while another real browser entrypoint bypasses it.

**Required remediation:** Establish one canonical QR resolve entrypoint and make camera/manual/legacy preview surfaces adapters to it.

**Gate status:** BLOCKED

### UDF-003 — QR action path is not yet proven to share the mutation boundary
**Severity:** HIGH  
**Evidence:** Unified Shell exposes a QR action entrypoint and opens Movement for detainees, while legacy preview modules expose their own QR action/return behavior.

**Risk:** Scan → Resolve can reach different action/mutation paths depending on loaded surface. This violates the requirement for one authoritative action path.

**Required remediation:** Map every QR resource kind to a single action command; remove or adapt legacy action mutations.

**Gate status:** BLOCKED

### UDF-004 — Movement mutation is only partially canonical
**Severity:** MEDIUM/HIGH  
**Evidence:** `movement-v9.js` performs validation, constructs the movement record, invokes the canonical placement command, then directly inserts the movement and audit record before persistence.

**Risk:** Placement has a canonical command, but Movement itself still has a browser-local mutation boundary. This makes Movement dependent on UI implementation rather than a single application mutation command.

**Required remediation:** Introduce/verify one canonical Movement mutation command owning validation, idempotency, placement linkage, mutation, audit, and correlation propagation. UI submits intent only.

**Gate status:** BLOCKED

### UDF-005 — Browser mutation functions need explicit authorization-boundary verification
**Severity:** HIGH  
**Evidence:** Several global browser functions (`p5return`, room QR state changes, leave QR issue, etc.) are callable as JavaScript entrypoints and perform state mutation directly.

**Risk:** Authenticated UI presence alone does not demonstrate that every mutation is authorization-gated at the mutation boundary. A user who can invoke the function must not be able to bypass policy merely by calling the entrypoint.

**Required remediation:** Verify authorization immediately before policy-sensitive mutation, and fail closed when authorization context is absent/invalid. Contract tests must invoke the real entrypoint.

**Gate status:** BLOCKED pending runtime/adversarial verification

### UDF-006 — Correlation continuity from mutation to report is not yet demonstrated
**Severity:** MEDIUM/HIGH  
**Evidence:** Unified Journey Certification requires audit and report correlation IDs to equal the journey correlation ID. Browser report rendering/export paths create their own audit events but the inspected paths do not demonstrate binding those report events to the originating operational journey.

**Risk:** Audit → Monitor → Report → Evidence may become a new correlation chain rather than a continuation of the original mutation evidence chain.

**Required remediation:** Carry one correlation ID from scan/action/mutation through audit, monitor projection, report snapshot, and evidence artifact.

**Gate status:** BLOCKED

### UDF-007 — Existing final/journey contract probes are not sufficient proof of real browser flow
**Severity:** HIGH  
**Evidence:** `mtaUnifiedFinalIntegrityGate` and related contract functions construct synthetic clones/probes and directly manipulate probe state. The repository documentation itself states that source-level PASS is not runtime PASS and requires deployed browser journey evidence.

**Risk:** A detached synthetic probe can certify an implementation assumption while the actual browser entrypoint remains on a bypass path.

**Required remediation:** Add browser acceptance tests that start from actual UI entrypoints and assert the same canonical state, mutation, audit, monitor, report, and evidence objects.

**Gate status:** BLOCKED

### UDF-008 — Persistence fallback paths remain in browser modules
**Severity:** MEDIUM  
**Evidence:** Several modules contain fallback `localStorage` read/write paths when the State Kernel is unavailable.

**Risk:** Standalone/module load-order conditions can reintroduce divergent persistence and audit semantics.

**Required remediation:** For authenticated runtime, make the State Kernel mandatory for mutation-capable modules; retain standalone behavior only where explicitly classified as non-operational preview code.

**Gate status:** OPEN — requires classification and hardening

## 4. Audit decision

**Unified Data Flow Audit: NOT CERTIFIED**

Reason: multiple real browser entrypoints still have evidence of parallel mutation/resolution paths, and runtime proof of one continuous correlation/evidence chain has not yet been established.

This is a source/runtime audit finding, not a production incident.

## 5. Required remediation order

1. Canonical temporary-exit mutation/return boundary.
2. Canonical QR Resolve boundary for camera/manual/legacy surfaces.
3. Canonical QR Action boundary.
4. Canonical Movement mutation boundary.
5. Authorization-at-mutation-boundary verification.
6. Correlation propagation into Monitor → Report → Evidence.
7. Real browser journey tests against actual entrypoints.
8. Remove/classify operational persistence fallbacks.
9. Run complete CI and controlled preview browser evidence.
10. Re-run this audit and certify only when all critical findings are PASS.

## 6. Governance locks

- Production DB: LOCKED
- Production migration/schema change: LOCKED
- Production deployment: LOCKED
- AI activation: LOCKED
- Real detainee data: LOCKED
- External/durable publication: LOCKED

## 7. Exit criteria

Unified Data Flow Audit can only become **CERTIFIED** when:

- every operational entrypoint resolves to one canonical state;
- every mutation-sensitive action crosses authorization and validation;
- each domain has one authoritative mutation boundary;
- QR Scan → Resolve → Context → Action is one path;
- Mutation → Audit uses the same correlation ID;
- Audit → Monitor → Report → Evidence preserves that correlation;
- offline/replay does not create duplicate mutations;
- browser tests execute the actual entrypoints;
- all mandatory CI gates are GREEN on the certification commit;
- evidence is produced from the certified commit itself.

**Current decision: NO-GO for Unified Data Flow Certification.**
