# Changelog

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
