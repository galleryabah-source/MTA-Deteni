# E6 — Failure & Idempotency Contract v1.0

## Objective

Prevent retries or duplicated client requests from creating duplicate document transitions, artifacts, or audit effects.

## Idempotency key

Every externally initiated state-changing document operation must carry an idempotency key. The key is bound to a deterministic request fingerprint.

The same key with the same fingerprint is a retry and may return the committed result. Reusing the same key with a different fingerprint is rejected.

## Execution states

`IN_PROGRESS → COMMITTED`

An `IN_PROGRESS` reservation is not proof that the business operation committed. A future durable adapter must define recovery/expiry semantics for abandoned reservations.

## Failure semantics

- Validation failure: no transaction execution.
- Identity/binding mismatch: no transaction execution.
- Transaction failure before commit: operation remains non-committed.
- Retry after commit: return the original committed result; do not repeat side effects.
- Same key/different request: fail closed.
- Artifact, binding and audit side effects must be coordinated by the durable transaction adapter.

## Important limitation

The current in-memory implementation is a reference contract, not a distributed lock. Production concurrency guarantees require an atomic durable store with unique constraints and transaction isolation.

## Numbering

Idempotency protects the issuance workflow from repeated requests, but document-number allocation must independently be atomic and unique in the durable persistence layer.

## Database policy

No schema or migration is introduced by this contract. Durable implementation is deferred until the approved persistence model exists.
