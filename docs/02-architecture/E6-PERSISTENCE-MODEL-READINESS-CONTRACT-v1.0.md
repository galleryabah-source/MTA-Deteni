# E6 — Persistence Model Readiness Contract v1.0

## Purpose

Define the mandatory boundary between the immutable document-engine domain contracts and a future PostgreSQL persistence implementation.

This contract does **not** authorize schema creation or migrations. It defines the evidence that must exist before production persistence is designed.

## Persistence chain

`Document → Contract → Template → Artifact → Binding → Lifecycle → Approval/Authorization → Audit → Numbering → Idempotency → Outbox`

## Mandatory production properties

1. Document identity is immutable and uniquely addressable.
2. Contract identity includes contract ID and version.
3. Template identity includes template ID and version; historical versions are immutable.
4. Artifact bytes are integrity-verifiable by SHA-256.
5. Binding is immutable and points to the exact artifact, contract, and template versions.
6. Lifecycle transitions are validated server-side and cannot silently move backward.
7. Approval and issue actions require authorization evidence and separation-of-duties controls.
8. Numbering reservation and committed register entries are transactionally consistent and uniquely constrained.
9. Idempotency keys are unique and cannot be reused with a different request fingerprint.
10. Audit events are append-only and integrity-verifiable.
11. Outbox events are linked to the same business transaction as the state change they publish.
12. Reconciliation can identify ambiguous, orphaned, stuck, or contradictory state without destructive repair.
13. Restricted data boundaries remain enforceable independently of the persistence adapter.

## Current readiness gate

The E6 persistence-readiness evaluator is deterministic and read-only. A candidate is blocked when artifact/binding identity or numbering consistency is invalid. An empty audit attachment is currently a warning because some persistence operations may be non-terminal preparation operations.

## Explicitly deferred

- PostgreSQL tables and migrations.
- ORM-specific models.
- SQL locking implementation.
- RLS policies.
- durable idempotency leases.
- durable outbox leases and retry workers.
- production object storage.
- production numbering sequence implementation.

These are implementation concerns to be designed only after the contract boundary is approved.

## Gate to E6.14

E6.14 may proceed to PostgreSQL persistence design only after the following are reviewed:

- identifier semantics;
- lifecycle terminal states and rejection/void semantics;
- authorization evidence persistence;
- audit-chain transaction linkage;
- numbering uniqueness and allocation scope;
- idempotency crash recovery and lease semantics;
- outbox transaction linkage and lease semantics;
- RLS/tenant or unit isolation requirements;
- retention and restricted-domain enforcement.

No production migration is implied by this document.
