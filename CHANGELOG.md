# Changelog

## P13.11641–11760 — Local Adapter Failure-Injection & Recovery Matrix

- Added a deterministic five-scenario synthetic matrix covering malformed request, expired handshake, session scope drift, idempotency conflict and reconciliation-required state.
- Bound each scenario to a stable failure class, rejected response, retry policy and operator-review requirement.
- Preserved fail-closed scenario/class consistency and synthetic-only operation.

## P13.11761–11880 — Local Runtime Recovery Disposition Contract

- Added deterministic recovery dispositions bound to certified failure evidence.
- Distinguished corrective retry, reauthentication, valid-session reopening, operator review and reconciliation-before-retry.
- Prevented automatic retry for idempotency conflicts and reconciliation-required states.

## P13.11881–12000 — Integrated Local Failure-Recovery Journey

- Composed failure evidence, failure observation, failure certification and recovery disposition into one synthetic journey.
- Preserved evidence/disposition/certification identity continuity.
- Rejected scenario drift and disposition drift before a recovery journey can be certified.

## P13.12001–12120 — Local Runtime Safety Certification Envelope

- Added a final safety envelope binding the failure-recovery journey, failure certification and recovery disposition.
- Exposed deterministic retry safety and operator-review requirements.
- Prevented automatic retry when operator review is required.
- Preserved synthetic-only certification with no production transport or persistence.

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

## P13.11161–11280 — Local Runtime Regression Certification

- Added integrated synthetic certification composing local routing, session handshake, session continuity, audit envelope and observability evidence.
- Required READY session continuity before local runtime regression can be certified.
- Reconciliation-required continuity cannot be certified as READY.

## P13.11041–11160 — Local Adapter Observability Contract

- Added deterministic `LOCAL_ADAPTER_EXECUTION` observation derived from audit evidence.
- Bound observations to evidence, actor, session, execution, device, installation, network and request identities.
- Observation/audit identity drift fails closed.
- Preserved synthetic-only observability with no production telemetry.

## P13.10921–11040 — Local Adapter Audit Envelope

- Added deterministic synthetic request/response audit evidence for local adapter execution.
- Bound audit evidence to actor, session, execution, device, installation, network, request and mutation idempotency identities.
- Request/response identity drift and scope drift fail closed.
- Preserved synthetic/in-memory execution only.

## P13.10801–10920 — Session Continuity Transition

- Added a deterministic session continuity proof bound to the local runtime handshake.
- Closed and interrupted sessions are explicitly blocked from handshake reuse.
- Reconciliation-required sessions cannot become READY merely by presenting a valid handshake.
- Preserved exact execution/device/install/network identity continuity.

## P13.10441–10560 — Local Runtime Session Handshake

- Added a synthetic local runtime session handshake bound to operational session, execution, device, installation and network identities.
- Restricted handshake creation to authenticated LAN/LOCAL runtime contexts.
- Added deterministic issued/expiry validation and fail-closed invalid windows.
- Required exact device/install/network binding for adapter requests.
