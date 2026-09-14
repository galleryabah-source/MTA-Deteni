# E6 — Outbox & Post-Commit Side-Effect Contract v1.0

## Objective

Prevent successful document issuance from becoming operationally ambiguous when notifications, distribution, archive synchronization or external integrations fail after the database transaction commits.

## Rule

Domain state is committed first. Side effects are represented by durable outbox events and processed after commit.

`ATOMIC DOMAIN COMMIT → OUTBOX EVENT → DISPATCH → DELIVERED`

## Event invariants

- Event ID is immutable.
- Aggregate/document identity is explicit.
- An idempotency key identifies the intended side effect.
- Payload is represented by a fingerprint rather than sensitive raw payload in the event contract.
- Delivery attempts are counted.
- Successful delivery is terminal.
- Failure is observable and retryable by policy.
- Re-dispatch of an already delivered event is a no-op.

## Failure isolation

A failed notification or integration must not roll back an already committed document issuance. Conversely, an outbox event must never be treated as proof that the underlying document transaction committed unless the event itself was durably created in the same transaction.

## Security

Outbox records must not contain unnecessary detainee PII or restricted health information. Handlers retrieve authorized data through normal application authorization rather than receiving unrestricted sensitive payloads.

## Production implementation

The durable adapter must persist the outbox event in the same database transaction as the domain state. Dispatcher workers use claim/lease semantics appropriate to the deployment model and handler-specific idempotency.

No schema or migration is introduced by this contract.
