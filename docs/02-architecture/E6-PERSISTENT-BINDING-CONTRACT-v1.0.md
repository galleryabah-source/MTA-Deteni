# E6 — Persistent Document Binding Contract v1.0

## Purpose

Define the persistence-neutral contract that binds a generated document instance to its exact artifact, document contract, and immutable template version.

## Binding invariant

A document is not considered durably bound unless all of the following identities match exactly:

`Document ID → Document Kind → Contract ID/Version → Template ID/Version → Artifact ID → Artifact SHA-256`

## Immutability

- A document ID may be bound only once.
- An artifact ID may be bound only once.
- Existing bindings cannot be overwritten.
- Corrections produce a new document/artifact identity rather than mutating historical records.
- Historical documents retain their original contract and template versions.

## Persistence boundary

The application layer exposes `DocumentBindingRepository` and does not assume PostgreSQL, object storage, or a specific ORM. A future adapter may persist the contract only after the domain model, security model, and authority matrix are approved.

## Retrieval integrity

Artifact retrieval must verify the stored SHA-256 before returning bytes. A mismatch is a hard integrity failure, not a warning.

## Security

Binding does not grant authorization. Authorization remains enforced by the D2 security control plane. Restricted data must remain behind the applicable authorization boundary.

## Database policy

This contract introduces no schema and no migration. PostgreSQL persistence is intentionally deferred until the persistence model is approved.

## Synthetic testing

All repository fixtures must remain synthetic and contain no real detainee data, PII, health data, credentials, or production examples.
