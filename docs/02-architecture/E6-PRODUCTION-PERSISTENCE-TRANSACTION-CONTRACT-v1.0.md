# E6 — Production Persistence Transaction Contract v1.0

## Purpose

Provide one persistence boundary for document issuance so document lifecycle, artifact identity, historical binding, numbering/register and audit cannot partially commit.

## Atomic unit

The durable adapter receives one `DocumentPersistenceTransaction` containing:

- document identity and lifecycle transition
- artifact identity when applicable
- immutable document binding when applicable
- numbering reservation/register when applicable
- audit event
- idempotency key
- request fingerprint

The adapter must commit the complete unit or commit nothing.

## Invariants

1. Document ID is stable and never silently overwritten.
2. Artifact ID and content hash remain immutable.
3. Binding must reference the exact artifact, contract and template identity.
4. Numbering register key must match its reservation.
5. Audit event must describe the same document and lifecycle transition.
6. Idempotency key is bound to the request fingerprint.
7. Duplicate idempotent execution must not repeat side effects.
8. Authorization is evaluated before entering this persistence boundary.
9. Restricted data is not written to logs as part of transaction diagnostics.

## Production PostgreSQL requirements

The future adapter should use a database transaction, durable unique constraints for document IDs/artifact IDs/register keys/idempotency keys, appropriate row/advisory locking for sequence allocation, and transaction isolation appropriate to the concurrency model.

The exact schema is intentionally deferred. No migration is part of E6.

## Recovery

An interrupted transaction must be recoverable from durable state. There must be no ambiguous client-visible success without a committed transaction record. Idempotency records and document registers must support reconciliation after process crashes.

## Boundary rule

No external AI call, network request, document download, notification or third-party side effect may be required to hold the database transaction open. Such effects occur after durable commit through an outbox/event mechanism in a later phase.
