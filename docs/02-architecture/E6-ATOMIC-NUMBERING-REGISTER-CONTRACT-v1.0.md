# E6 — Atomic Numbering & Register Contract v1.0

## Objective

Guarantee that issued documents cannot receive duplicate document numbers under concurrent requests or retries.

## Number identity

A numbering identity is scoped by `prefix + year + sequence` and represented by a deterministic register key.

Example:

`SIP:2026:1 → SIP/0001/2026`

## Required invariants

1. Sequence allocation is atomic in the durable implementation.
2. A committed register key is immutable.
3. A document number can belong to only one issued document.
4. Retry of the same issuance operation must reuse its idempotent result, not allocate another number.
5. A failed transaction must not leave an apparently issued number without reconciliation.
6. Different prefixes/years have independent sequences unless an approved numbering policy says otherwise.

## Persistence boundary

The repository exposes `reserveNext()` and `commit()` without prescribing PostgreSQL schema. The production adapter must use a durable atomic mechanism, unique constraints and transaction isolation.

## Reservation vs issuance

Reservation is not issuance. The number becomes authoritative only when the issuance/register operation commits successfully.

## No schema migration

This implementation adds only a persistence-neutral contract and in-memory reference adapter. Database schema changes remain blocked until the domain and persistence model are formally approved.
