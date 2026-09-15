# Changelog

## P13.10441–10560 — Local Runtime Session Handshake

- Added a synthetic local runtime session handshake bound to operational session, execution, device, installation and network identities.
- Restricted handshake creation to authenticated LAN/LOCAL runtime contexts.
- Added deterministic issued/expiry validation and fail-closed invalid windows.
- Required exact device/install/network binding for adapter requests.

## P13.10561–10680 — Session Handshake Lifetime

- Added regression proving a handshake is usable only inside its declared validity window.
- Prevented expired handshakes from being accepted at the exact expiry boundary.
- Preserved synthetic/in-memory operation.

## P13.10681–10800 — Continuity-Sensitive Mutation Admission

- Added fail-closed validation for malformed handshake identity/time.
- Bound continuity-sensitive mutations to the active operational session and exact execution/device/install/network scope.
- Required certified runtime handoff and ready recovery proof before continuity-sensitive mutation admission.

## P13.10081–10200 — Local Runtime Adapter Contract

- Added a narrow synthetic LOCAL/LAN adapter contract for browser, tablet and smartphone clients.
- Required request identity, authenticated device identity, local service boundary and idempotency for mutations.
- Preserved the separation between adapter contracts and external transport/persistence.

## P13.10201–10320 — Local Runtime Routing Safety

- Rejected absolute and protocol-relative URLs from the local runtime adapter.
- Restricted adapter paths to the `/mta-local/` service boundary.
- Prevented accidental routing of local operations to external services.

## P13.10321–10440 — Synthetic Adapter Execution Boundary

- Added deterministic in-memory adapter execution returning contract-level acceptance only.
- Added regression coverage for authenticated LAN mutations, missing idempotency, external/non-local paths and unsafe authentication boundaries.
- Preserved migration freeze, synthetic-only data and no production connectivity.

## P13.9601–9720 — Unified Continuity Certification Envelope

- Added an immutable synthetic certification envelope binding continuity certification, operational session, reconciliation proof and runtime handoff evidence.
- Enforced equality across session, execution, device, installation, network and journey identities.
- Required authorized/certification-bound runtime handoff and READY backup continuity before envelope certification.
- Required complete reconciliation cardinality before clean continuity can be represented.

## P13.9721–9840 — Local/LAN Recovery Boundary

- Added deterministic LOCAL/LAN recovery proof for authenticated synthetic sessions.
- Preserved installation and network-scope trust as the minimum recovery boundary.
- Target installation/network drift fails closed before recovery can become READY.

## P13.9841–9960 — Multi-Device LAN Continuity

- Reused the installation/network trust boundary for target-device continuity.
- Kept device changes admissible only within the same trusted installation and network scope.
- Preserved synthetic-only recovery semantics without introducing external persistence.

## P13.9961–10080 — Runtime Adapter Integration Boundary

- Kept runtime integration adapter-only and isolated from database/production transport.
- Established the separation needed for a future browser/tablet/smartphone LOCAL/LAN adapter without weakening current synthetic governance controls.

## P13.9121–9240 — Integrated Offline-First Continuity Journey

- Added a deterministic contract-level composition from active operational session through local command admission, reconciliation, synchronized runtime continuity, backup continuity, unified continuity certification and clean session close.
- Preserved end-to-end identity continuity for session, execution, device, installation, network, journey, command and reconciliation receipt identifiers.
- Added regression coverage for successful integrated continuity and rejection of an empty/non-operative journey.
- Kept all state synthetic/in-memory with no production persistence or AI activation.

## P13.9001–9120 — Session Reconciliation Completion

- Added deterministic per-command reconciliation receipts bound to session, execution and command identities.
- Conflict review cannot emit a completed reconciliation receipt.
- Added complete reconciliation proof requiring one unique receipt for every admitted command; partial reconnects fail closed.
- Added explicit `RECONCILIATION_REQUIRED` session state and a guarded transition back to `ACTIVE` only after complete reconciliation proof.
- Added execution/session drift and terminated-session regression coverage.
- Preserved synthetic-only operation and all governance locks.

## P13.8881–9000 — Offline-First Operational Session

- Added a contract-only operational session lifecycle bound to execution, device, installation, network scope and runtime mode.
- Added authenticated synthetic session admission with LAN/LOCAL-only local command admission and complete command identity validation.
- Added fail-closed session scope checks for execution, runtime mode, network, device and installation drift.
- Added deterministic clean session-close evidence bound to synchronized queue state, READY runtime continuity, READY backup continuity and the unified continuity certification.
- Added explicit `INTERRUPTED` state so an interrupted local/LAN session cannot be represented as a clean operational handoff.
- Added regression coverage for active admission, scope drift, unauthenticated context, inactive/interrupted sessions, pending queues, reconciliation conflicts, clean close and fabricated close evidence.
- No database driver, schema migration, production persistence, real detainee data or AI activation.
