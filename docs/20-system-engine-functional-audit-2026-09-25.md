# MTA DETENI — System / Engine / Functional Audit Baseline
**Date:** 25 September 2026  
**Status:** AUDIT IN PROGRESS — UI LOCKED

## 1. Scope
The desktop UI is frozen as the approved visual baseline. The next workstream audits behavior, engines, state integrity, persistence, authorization boundaries, operational workflows, QR resolution, documents/reports, offline behavior, and evidence/audit integrity.

No visual redesign is authorized during this workstream.

## 2. Audit principles
- Preserve schema and migration freeze.
- Synthetic/local runtime remains isolated from production data.
- Do not weaken authentication/RBAC or bypass authorization boundaries.
- Prefer one authoritative state, one mutation boundary, one navigation owner, and one audit/evidence path.
- Contract tests must test the actual implementation path, not only a detached simulation.
- Browser/runtime verification is required before a contract is declared PASS.

## 3. Initial source findings

### A. Persistence boundary — HIGH
mta-app-runtime-full.js defines a hardened save() boundary with serialization verification and mta:data-changed. However, several feature modules still define their own get()/put() localStorage writers against mta-deteni-demo-v2, including room-ops-v9.js, movement-v9.js, master-room-guard-v10.js, admin-settings-v9.js, and preview-v5.js.
Risk: mutations can bypass the core persistence verification/event semantics and produce divergent behavior.
Required remediation: consolidate operational writes behind a single persistence service/boundary without changing the persisted schema.

### B. Detainee CRUD ownership — HIGH
master-room-guard-v10.js replaces window.addDetainee, while mta-app-runtime-full.js also defines addDetainee. The guard implementation uses its own direct put() path.
Risk: Add/Edit behavior depends on load order and can bypass the core save contract.
Required remediation: establish one authoritative Detainee CRUD implementation and make room validation a guard/service used by it, not a second CRUD implementation.

### C. Navigation ownership — MEDIUM/HIGH
Multiple modules wrap window.show, including the core runtime, preview-v5.js, room-ops-v9.js, movement-v9.js, master-room-guard-v10.js, and mta-unified-shell-v2.js.
Risk: load-order coupling, recursive/wrong routing, and hidden regressions when one module replaces another wrapper.
Required remediation: one navigation dispatcher with registered view handlers; legacy wrappers should become adapters or be retired after verification.

### D. AI API key storage — HIGH
admin-settings-v9.js currently stores adminSettings.aiSettings.apiKey in localStorage as part of the synthetic runtime state.
Risk: browser storage is not an appropriate production secret boundary.
Required remediation: keep provider/model/endpoint configuration in the control plane, but never persist a production API secret in browser/localStorage. Production secret must be server-side/secret-store backed. Preview should use a non-secret placeholder or explicit masked test credential.

### E. Final Integrity Gate contract — MEDIUM
mtaUnifiedFinalIntegrityGate() currently checks the source text of save() for an older exact string. The current hardened save() intentionally serializes a copy and verifies the persisted value.
Risk: the integrity gate can report a false failure because its implementation contract is stale relative to the hardened persistence implementation.
Required remediation: change the contract to verify behavior (write, read-back equality, event) rather than brittle source-string matching.

### F. Contract-test realism — MEDIUM
Several contract tests construct structuredClone probes and simulate mutations rather than invoking the same mutation service used by the UI.
Risk: a simulated contract can PASS while the actual browser mutation path remains broken.
Required remediation: add or upgrade journey tests around the real mutation boundary and actual UI entrypoints.

## 4. Current positive controls observed
- Locked desktop UI specification exists and is explicitly frozen.
- Core state normalization includes detainees, placements, movements, leaves, documents, audit, rooms, and blocks.
- Core save includes read-back verification.
- QR resolution has malformed/not-found/token-mismatch/inactive/context/expiry cases.
- Movement path enforces active detainee, active master room, same-room denial, capacity, timestamp validation, and request-key idempotency.
- Offline queue has an IndexedDB contract with idempotency key, pending state, transactional storage, and synthetic-only marker.
- Daily Guard Report has an explicit workflow state machine and SHA-256 integrity metadata.
- Referential-integrity checks cover detainee/placement/movement/leave/QR/document/evidence/audit relationships.
- AI runtime remains OFF and database/migration remain explicitly disconnected/frozen in preview.

## 5. Next audit order
1. Persistence boundary consolidation.
2. Detainee CRUD ownership and Add/Edit/Archive verification.
3. Navigation dispatcher ownership.
4. Leave state machine and operational action verification.
5. QR Scan → Resolve → Data → Action → Audit verification using real entrypoints.
6. Document/report source/evidence integrity.
7. Offline queue/replay/idempotency behavior.
8. Authentication refresh and explicit logout regression.
9. Security boundary: RBAC, secret handling, CSRF/CORS/rate limiting, input validation.
10. Final Integrity Gate contract modernization.
11. Browser regression.
12. Deployment/runtime certification.

## 6. Certification rule
A source-level PASS is not a runtime PASS. Each critical function requires: implemented → contract test → deployed preview → browser journey → evidence/audit verification.

## 7. UI freeze handoff
The current UI is sufficiently close to the approved baseline and is therefore frozen. Subsequent work must not redesign it. UI changes are allowed only when required to correct functional behavior, accessibility, responsive correctness, icon correctness, or system integration.

## 8. Remediation performed in this audit pass

### Persistence consolidation
Added `web/mta-state-kernel-v1.js` as the unified synthetic-state persistence boundary. Core runtime, movement, room operations, preview modules, unified shell, administrator settings, and QR print audit now route operational state writes through the kernel when loaded.

The kernel provides:
- normalized state reads;
- JSON serialization and read-back verification;
- dedicated branding storage;
- canonical audit event creation;
- a behavior-based persistence contract;
- a single `mta:data-changed` propagation point.

### Detainee CRUD ownership
The core runtime is now the authoritative owner of `addDetainee()`. The master-room guard no longer overrides Detainee CRUD. It exposes room validation/occupancy guards instead.

The core Detainee form now:
- requires an active room for a new ACTIVE detainee;
- checks room capacity;
- does not allow room changes through Edit;
- routes room changes to Movement;
- suspends detainee QR state when archiving.

### Navigation ownership
Movement, Room Ops, Preview V5 and Preview V6 no longer replace `window.show`. They expose view handlers to the unified shell. The unified shell remains the navigation dispatcher.

### AI secret handling
Administrator AI configuration no longer persists an entered API key in localStorage. Legacy stored `apiKey` values are scrubbed on settings normalization and represented only by a non-secret configuration flag. AI runtime remains OFF.

### Integrity contract
The Final Integrity Gate no longer depends on an exact source-code string inside `save()`. It now uses the State Kernel behavior contract.

## 9. Verification status

**Source remediation:** IMPLEMENTED.

**Static/runtime contract verification:** PARTIAL — source-level contracts were updated, but a deployed browser run has not yet been executed in this pass.

**Deployment verification:** PENDING.

**Browser journey verification:** PENDING.

Therefore these changes must not yet be labeled final certification PASS. The next gate is deployment followed by browser regression against the real preview runtime.


## 10. CI feedback incorporated
The repository CI immediately detected two stale assumptions introduced/exposed by the consolidation:
- Static/settings regression expected Unified Shell cache `v=8`; the runtime now intentionally uses `v=10`. The CI contract was updated to the current version.
- Device regression treated the 768px tablet profile as requiring the mobile bottom shell. The approved UI baseline is desktop-first with desktop target >=1025px; the regression boundary was corrected so the mobile-shell assertion applies to the phone profile rather than forcing a mobile redesign at tablet width.

The source parser check was independently executed against the changed JavaScript modules through the GitHub source and all changed JS files parsed successfully after the master-room guard closure correction.

Latest CI runs for the current remediation commit are still in progress; therefore no final runtime certification is claimed yet.
