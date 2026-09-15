# Changelog

## P13.9361–9480 — Synthetic Multi-Device Continuity

- Added a synthetic multi-device handoff proof bound to session, execution, installation and network scope.
- Authorized handoff within the same installation/network scope is admissible.
- Missing authorization and network-scope drift are fail-closed.
- Added regression coverage for authorized handoff, network drift and missing authorization.

## P13.9241–9360 — Offline Interruption/Recovery Proof

- Added deterministic interrupted-session records preserving admitted-command boundaries and reconciliation boundaries.
- Added explicit reconnect authorization bound to session, execution, device, installation and network scope.
- Added queue rehydration into `SYNCING` before reconciliation.
- Added recovered-command transitions through the existing APPLY/SKIP_DUPLICATE/REVIEW_CONFLICT contract.
- Integrated the offline continuity journey now exercises deliberate interruption and authorized reconnect before clean close.
- Continuity certification now carries session/device/installation/network identity and validates backup source identity against the runtime session.
- Kept all state synthetic/in-memory with no production persistence or AI activation.

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
