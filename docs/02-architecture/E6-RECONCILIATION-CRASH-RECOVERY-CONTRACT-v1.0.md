# E6 — Reconciliation & Crash Recovery Contract v1.0

## Purpose

Detect ambiguous or inconsistent document-engine state after process failure, restart, timeout or partial external delivery.

## Findings

The reconciliation kernel can detect:

- stale idempotency reservations
- orphan artifacts
- bindings referencing missing artifacts
- binding/artifact hash mismatch
- stuck outbox processing
- failed outbox delivery

## Severity

`CRITICAL` means the state cannot be treated as trustworthy and requires controlled reconciliation before normal continuation. `WARNING` means the state is operationally incomplete but does not by itself invalidate committed domain state.

## Recovery principle

The reconciliation engine diagnoses. It does not silently mutate critical records.

Any repair must be an explicit, authorized, auditable operation with a new event/correlation ID. No automatic deletion or overwrite of documents, artifacts, bindings, numbering records or audit history is permitted merely because a reconciliation finding exists.

## Idempotency recovery

A stale `IN_PROGRESS` reservation is evidence of an interrupted operation, not evidence of failure or success. A durable implementation must reconcile it against the transaction outcome before releasing or finalizing the reservation.

## Numbering recovery

Reserved-but-uncommitted numbers require reconciliation against the durable register and issuance record. The system must never reuse a number merely because a process crashed.

## Artifact recovery

Orphan artifacts are retained until an authorized retention/reconciliation policy determines their disposition. Immediate deletion is prohibited by this contract.

## Outbox recovery

`PROCESSING` events beyond the recovery window require lease/retry reconciliation. `FAILED` events remain observable and retryable according to policy. A delivered event is terminal and must not be redelivered as a new event.

## Production requirement

The durable adapter must expose enough state to prove whether the domain transaction committed. Reconciliation must be safe to run repeatedly and must not itself create duplicate business side effects.

No schema or migration is introduced by this contract.
