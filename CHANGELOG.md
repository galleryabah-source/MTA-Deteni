# Changelog

## P13.18241–18400 — Authorization Decision Evidence Closure Boundary

- Added deterministic closure boundary for authorization decision evidence.
- Closure state is `CLOSED_FOR_REVIEW` and preserves the complete decision/evidence identity and fingerprint chain.
- Explicitly prevents authorization grant, dispatch approval, dispatch execution, external transport and durable publication.

## P13.18401–18520 — Authorization Decision Evidence Closure Replay Guard

- Added deterministic ADMIT/REPLAY/CONFLICT semantics for the closed evidence boundary.
- Replay key binds closure, evidence and decision certification identities; fingerprint drift is rejected as CONFLICT.
- Replay remains in-memory and has no external side effect.

## P13.18521–18640 — Integrated Authorization Decision Evidence Closure Certification

- Added integrated closure certification composing closure validation and replay protection.
- Certification remains synthetic-only, review-only, immutable and non-executable.
- No external transport, durable publication, migration, live database execution or AI activation.

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
