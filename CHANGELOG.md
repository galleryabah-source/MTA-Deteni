# Changelog

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

## P13.12481–12600 — Integrated Local Runtime Recovery Certification

- Added integrated recovery certification composing the safety envelope with the recovery continuity gate.
- Preserved deterministic five-scenario recovery states and explicit admission boundaries.
- Blocked operator-review and reconciliation-required states from being represented as admitted recovery.
- Preserved synthetic-only execution.

## P13.12361–12480 — Local Runtime Recovery Continuity Gate

- Added deterministic continuity states for corrective retry, handshake reauthentication, scope reopening, operator review and reconciliation.
- Preserved the safety envelope as the mandatory input to recovery admission.
- Blocked operator-review and reconciliation-required recovery from automatic admission.

## P13.12241–12360 — Local Runtime Recovery Action Gate

- Added deterministic recovery actions derived from the certified safety envelope.
- Mapped each failure scenario to an explicit bounded action.
- Prevented operator-review and reconciliation actions from automatic admission.

## P13.12121–12240 — Local Runtime Safety Regression Matrix

- Added regression coverage for all five local adapter failure scenarios through the evidence → observation → certification → disposition → safety-envelope chain.
- Added fail-closed coverage for retry-policy, operator-review and synthetic-only drift.
- Preserved synthetic/in-memory operation only.

## P13.12001–12120 — Local Runtime Safety Certification Envelope

- Added a final safety envelope binding the failure-recovery journey, failure certification and recovery disposition.
- Exposed deterministic retry safety and operator-review requirements.
- Prevented automatic retry when operator review is required.
- Preserved synthetic-only certification with no production transport or persistence.

## P13.11881–12000 — Integrated Local Failure-Recovery Journey

- Composed failure evidence, failure observation, failure certification and recovery disposition into one synthetic journey.
- Preserved evidence/disposition/certification identity continuity.
- Rejected scenario drift and disposition drift before a recovery journey can be certified.

## P13.11761–11880 — Local Runtime Recovery Disposition Contract

- Added deterministic recovery dispositions bound to certified failure evidence.
- Distinguished corrective retry, reauthentication, valid-session reopening, operator review and reconciliation-before-retry.
- Prevented automatic retry for idempotency conflicts and reconciliation-required states.
