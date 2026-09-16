# Changelog

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

## P13.11641–11760 — Local Adapter Failure-Injection & Recovery Matrix

- Added a deterministic five-scenario synthetic matrix covering malformed request, expired handshake, session scope drift, idempotency conflict and reconciliation-required state.
- Bound each scenario to a stable failure class, rejected response, retry policy and operator-review requirement.
- Preserved fail-closed scenario/class consistency and synthetic-only operation.

## P13.11521–11640 — Local Runtime Failure Certification

- Composed failure evidence, failure observation and request-boundary validation into one synthetic certification chain.
- Preserved stable evidence, observation, failure, request, session and execution identities.
- Certification rejects inconsistent evidence and remains synthetic-only.

## P13.11401–11520 — Local Runtime Failure Observability

- Added deterministic `LOCAL_ADAPTER_FAILURE` observations derived from failure evidence.
- Bound failure observations to evidence, failure class, actor, session, execution, device, installation and network identities.
- Observation/evidence drift fails closed.
- Preserved synthetic-only observability with no production telemetry.

## P13.11281–11400 — Local Adapter Failure Evidence

- Added deterministic failure evidence for rejected local adapter executions.
- Added stable failure classes for request, handshake, session-scope and execution rejection boundaries.
- Preserved actor/session/execution/device/install/network/request/idempotency identity binding.
- Request/response, execution and device-scope drift fail closed.
- Preserved synthetic/in-memory operation only.
