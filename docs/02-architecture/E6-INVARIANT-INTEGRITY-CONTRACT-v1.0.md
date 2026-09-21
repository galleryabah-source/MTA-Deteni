# E6 — Document Invariant & Integrity Contract v1.0

## Purpose

Provide a deterministic, read-only consistency checker for the complete document-engine chain.

## Chain

`Document → Contract → Template → Artifact → Binding → Lifecycle → Approval/Audit → Idempotency → Outbox`

## Core invariants

1. A document must have an immutable binding before it is treated as a complete generated artifact.
2. Binding contract ID/version must equal the document contract identity.
3. Binding template ID/version must equal the document template identity.
4. Binding lifecycle must equal the authoritative lifecycle supplied to the checker.
5. Binding artifact ID/hash must equal the artifact identity/hash.
6. Audit events must reference the same document aggregate.
7. Audit lifecycle evidence must not contradict authoritative lifecycle.
8. Idempotency keys must be unique in the durable store.
9. Outbox events must reference the intended document aggregate.

## Severity

Critical findings invalidate trust in the affected document chain until reconciled. Warning findings indicate an operational inconsistency that does not automatically invalidate the committed domain state.

## Safety rule

The invariant checker is read-only. It never repairs, deletes, overwrites, reissues, re-numbers, or replays a document. Repairs require an explicit authorized workflow and new audit evidence.

## Operational use

The checker can run during deployment verification, scheduled integrity checks, incident response, and pre-issuance validation. It must be safe to execute repeatedly.

## Production extension

A durable implementation should add checks for numbering/register uniqueness, complete lifecycle/audit continuity, approval authorization evidence, template content hash, artifact byte hash, outbox transaction linkage and retention state.

No schema or migration is introduced by this contract.
