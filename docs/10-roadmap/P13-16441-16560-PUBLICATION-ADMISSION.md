# P13.16441–16560 — Synthetic Publication Request Admission

## Objective
Define a deterministic admission boundary over an already certified publication-ready projection.

## Contract
The admission layer accepts a request only when:

1. certification state is exactly `READY_FOR_PUBLICATION`;
2. certification and request are explicitly synthetic-only;
3. publication, projection, certification and source-fingerprint identities match exactly;
4. the request has not drifted from the certified material;
5. no external transport occurs;
6. no durable publication occurs.

## Decisions

- `ADMIT`: exact request admitted for the first time.
- `REPLAY`: exact same request/admission material is replayed deterministically.
- `CONFLICT`: an existing admission exists but the incoming request changes its identity/material. Conflicts are rejected rather than overwritten.
- invalid/incomplete/non-synthetic input is rejected with a deterministic error code.

## Determinism
The admission fingerprint is derived only from canonical admission material. The contract does not use current time, randomness, network state, database state, or external services to determine the fingerprint.

## Boundary
This checkpoint stops before external transport and before durable publication. It therefore does not authorize Cloudflare, storage, email, queue, database publication, or any other external side effect.

## Acceptance
The accompanying test suite covers:

- exact certified admission;
- deterministic replay;
- projection identity drift;
- non-synthetic rejection;
- readiness rejection;
- conflicting replay rejection;
- fingerprint stability.

## Governance
Migration Freeze remains TRUE. AI remains OFF. Repository fixtures remain synthetic-only. This checkpoint introduces no database migration and no production-data access.
