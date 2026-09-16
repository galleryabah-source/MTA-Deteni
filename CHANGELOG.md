# Changelog

## P13.17521–17640 — Dispatch Authorization Decision Envelope

- Added deterministic non-granting authorization decision envelope over certified dispatch authorization.
- Preserved authorization, candidate, request, publication and decision fingerprint identity.
- Decision remains `REVIEW_REQUIRED` with `authorizationGranted=false` and `dispatchApproved=false`.
- External transport and dispatch execution remain explicitly false.
- Added regression coverage for non-granting, replay and drift invariants.

## P13.17641–17760 — Dispatch Authorization Decision Replay Guard

- Added deterministic ADMIT/REPLAY/CONFLICT semantics for authorization decisions.
- Same decision/authorization identity and fingerprint replays without duplicate admission; changed fingerprint becomes CONFLICT.
- Replay remains in-memory and has no external side effect.

## P13.17761–17880 — Integrated Dispatch Authorization Decision Certification

- Added integrated certification composing authorization decision validation and replay protection.
- Preserved authorization, candidate, request, publication and decision fingerprint continuity.
- Certification fails closed on conflict, identity drift or attempted authorization grant/dispatch.
- Synthetic-only, review-required and transport-free invariants remain enforced.

## P13.17161–17280 — Dispatch Authorization Review Boundary

- Added deterministic review-only dispatch authorization envelope over the certified dispatch candidate.
- Preserved candidate, request certification, request, publication certification, publication and decision fingerprint identity.
- Authorization remains `READY_FOR_AUTHORIZATION_REVIEW` with `authorizationGranted=false`.
- External transport and dispatch execution remain explicitly false.
- Added regression coverage for review-only and synthetic-only invariants.

## P13.17281–17400 — Dispatch Authorization Replay Guard

- Added deterministic ADMIT/REPLAY/CONFLICT semantics for dispatch authorization review.
- Same authorization/candidate identity and fingerprint replays without duplicate admission; changed fingerprint becomes CONFLICT.
- Replay remains in-memory with no external side effect.

## P13.17401–17520 — Integrated Dispatch Authorization Certification

- Added integrated certification composing dispatch authorization validation and replay protection.
- Preserved candidate, request, publication and decision fingerprint continuity.
- Certification fails closed on conflict, drift, attempted authorization grant, attempted execution or external transport.
- Synthetic-only and review-only invariants remain enforced.

## P13.16681–16800 — Integrated Publication Request Certification

- Added deterministic integrated certification composing publication request admission and replay protection.
- Preserved request, publication certification, publication, evidence, audit, closure, continuity, receipt, execution, dispatch, acknowledgement and decision fingerprint identity.
- Certification fails closed on replay conflict, identity drift, incomplete or non-synthetic state.
- External transport remains explicitly disabled.

## P13.16801–16920 — Publication Dispatch Candidate Boundary

- Added a review-only dispatch candidate over a certified publication request.
- Candidate preserves request certification and publication identity/fingerprint continuity.
- Candidate is `READY_FOR_DISPATCH_REVIEW` only; `dispatchExecuted` and `externalTransportRequested` remain false.
- Added regression coverage for transport-free operation and identity drift.

## P13.16921–17040 — Publication Dispatch Candidate Replay Guard

- Added deterministic ADMIT/REPLAY/CONFLICT semantics for dispatch candidates.
- Same candidate/request identity and fingerprint replays without duplicate admission; a different valid fingerprint becomes CONFLICT.
- Replay remains in-memory and has no external side effect.

## P13.17041–17160 — Publication Dispatch Candidate Certification

- Added integrated certification composing dispatch-candidate validation and replay protection.
- Preserved candidate, request certification, publication and decision fingerprint identity.
- Certification fails closed on conflict, drift or attempted dispatch execution.
- External transport remains explicitly disabled and synthetic-only constraints remain enforced.

## P13.16081–16440 — Operational Audit Publication Readiness

- Added deterministic operational audit publication-readiness envelope over the certified operational audit projection.
- Preserved complete projection, evidence certification, audit, closure, continuity, receipt, execution, dispatch, acknowledgement and fingerprint identity.
- Added explicit `READY_FOR_PUBLICATION` state while keeping external publication disabled.
- Added deterministic publication replay guard with ADMIT/REPLAY/CONFLICT semantics and no external side effect.
- Added integrated publication certification composing readiness and replay boundaries.
- Publication readiness/certification fails closed on incomplete, conflicted, identity-drifted or non-synthetic state.
- Added regression coverage for readiness, replay, conflict, certification, drift and the no-external-publication invariant.
- No production transport, durable publication, schema migration, live database execution or AI activation.
