# Changelog

## P13.13201–13320 — Local Runtime Recovery Decision Execution Evidence

- Added execution evidence binding runtime execution to decision, request, certification, audit and envelope identities.
- Added fail-closed fingerprint and identity checks.
- Preserved admitted and synthetic-only execution boundaries.

## P13.13081–13200 — Local Runtime Recovery Decision Execution Boundary

- Added a runtime admission boundary requiring certified recovery decision, replay, audit and safety identities.
- Blocked conflicted, replayed, non-admitted and non-synthetic recovery execution.
- Hardened the request boundary with the canonical local runtime request assertion.

## P13.12961–13080 — Integrated Local Runtime Recovery Decision Certification

- Added integrated certification composing decision integrity, recovery certification and decision audit evidence.
- Preserved exact decision/envelope/audit identity continuity.
- Rejected cross-chain substitution and blocked recovery admission tampering.
- Preserved synthetic-only execution.

## P13.12841–12960 — Local Runtime Recovery Decision Audit Evidence

- Added deterministic audit evidence bound to the exact recovery decision identity and fingerprint.
- Preserved scenario, action and admission semantics in audit evidence.
- Audit evidence field drift and non-synthetic state fail closed.

## P13.12721–12840 — Local Runtime Recovery Decision Replay Guard

- Added deterministic in-memory ADMIT/REPLAY/CONFLICT semantics for recovery decisions.
- Replayed identical decision identity/fingerprint without creating a second admission effect.
- Same decision identity with a different fingerprint becomes a conflict requiring review.

## P13.12601–12720 — Local Runtime Recovery Decision Integrity

- Added deterministic recovery decision binding across envelope, journey, certification, evidence, disposition, scenario, continuity state and action.
- Added decision fingerprint continuity for tamper detection.
- Rejected stale/cross-scenario/non-synthetic decision state and blocked continuity admission tampering.

