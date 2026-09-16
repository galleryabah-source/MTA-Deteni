# Changelog

## P13.17881–18000 — Authorization Decision Evidence Envelope

- Added deterministic evidence envelope binding the non-granting authorization decision certification.
- Preserved decision, authorization, candidate, request, publication and decision fingerprint identity.
- Evidence remains `READY_FOR_REVIEW` with authorization grant, dispatch approval, dispatch execution and external transport explicitly false.
- Synthetic-only invariant remains enforced.

## P13.18001–18120 — Authorization Decision Evidence Replay Guard

- Added deterministic ADMIT/REPLAY/CONFLICT semantics for authorization decision evidence.
- Same evidence/decision identity and fingerprint replays without duplicate admission; changed fingerprint becomes CONFLICT.
- Replay remains in-memory with no external side effect.

## P13.18121–18240 — Integrated Authorization Decision Evidence Certification

- Added integrated certification composing evidence validation and replay protection.
- Preserved complete decision, authorization, candidate, request, publication and fingerprint continuity.
- Certification fails closed on conflict, identity drift or attempted authorization/dispatch execution.
- No external transport, durable publication, migration, live database execution or AI activation.

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
