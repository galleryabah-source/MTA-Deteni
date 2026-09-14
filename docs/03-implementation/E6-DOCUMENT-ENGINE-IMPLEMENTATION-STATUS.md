# E6 — Document Engine Implementation Status

Status: INTEGRATION KERNEL — PARTIAL

## Implemented
- Typed Document Contract model.
- Mandatory contracts for Surat Izin Keluar Sementara and Surat Tugas Pengawalan.
- Deterministic placeholder extraction and merge.
- Required-field, unknown-field and placeholder validation.
- Immutable TemplateVersion contract with effective dates and content hash.
- In-memory Template Registry with exact version lookup and historical effective-date resolution.
- Template-to-contract compatibility guard.
- Deterministic renderer adapter contract with AI-independent reference renderer.
- Document generation orchestration: exact template binding → validation → deterministic merge → render → SHA-256 integrity.
- Document lifecycle transition guard.
- Numbering/register contract.
- Document approval gate with fail-closed lifecycle, authorization, approval and self-approval controls.
- Security-aware document authorization adapter connected to the existing D2 AuthorizationEngine and policy guardrails.
- Authorization correlation identity is checked before approval proceeds.
- Document security domain is derived from document kind: temporary-exit documents use TEMPORARY_EXIT and escort documents use ESCORT.
- Document artifact integrity now verifies SHA-256 against the actual stored bytes, not only hash format.
- Persistence-neutral immutable DocumentArtifactStore contract with an in-memory reference implementation.
- Artifact retrieval returns defensive byte copies and rejects duplicate artifact IDs rather than overwriting history.
- Persistence-neutral append-only DocumentAuditRepository contract with sequence numbers and a tamper-evident SHA-256 event chain.
- Audit repository rejects duplicate event IDs and exposes chain integrity verification.
- Persistence-neutral immutable DocumentBinding contract connecting document identity to exact contract/template/artifact identity and hash.
- Binding repository rejects duplicate document IDs and prevents one artifact from being bound to multiple documents.
- Unit tests for contract presence, deterministic merge, lifecycle ordering, integrity, template immutability, historical resolution, generation, authorization integration, artifact immutability, audit-chain integrity and document binding.

## Security invariants
- Document generation is deterministic and does not require AI.
- AI is not in the critical path and cannot be used to silently alter a document.
- Explicit generation requires an exact template ID + version; no implicit fallback is allowed.
- Template versions are immutable; duplicate version registration fails closed.
- Historical generation can bind to the template version effective for the selected time.
- Template/contract identity and version must match before generation.
- Missing/unknown fields and missing placeholders fail closed.
- Archived documents cannot transition back into active states.
- Generated/stored content integrity is represented by SHA-256 and is verified against artifact bytes.
- Sensitive field markers remain part of the contract; authorization belongs to the security control plane.
- Document approval does not trust client-supplied authorization state; the authorization result is derived server-side from AuthorizationEngine.
- Authorization decisions must retain and validate the same correlation ID as the document approval request.
- Policy guardrails are evaluated after the authorization decision and before the document approval gate.
- Security domain is derived from the document kind rather than accepted from the client.
- Artifact IDs are immutable; no overwrite operation exists in the storage contract.
- Document bindings are immutable; corrections require a new document/artifact identity.
- Binding requires exact contract, template and artifact hash identity.
- Audit events are append-only; duplicate event IDs are rejected.
- Audit integrity can be independently verified from the persisted sequence/hash chain.
- No real detainee data, credentials or production secrets are included.
- No database schema or migration is introduced by E6.

## Remaining integration work
- Align production permission definitions with the official authority matrix and approved RBAC catalog.
- Binary DOCX rendering adapter using an approved server-side library.
- Persistent template registry and private object storage.
- Atomic document numbering persistence and register uniqueness.
- Approval/signature workflow integration and authorization gates.
- Download/distribution/archive audit event persistence.
- Final document artifact persistence, retrieval and retention controls.

The persistence contracts introduced in this phase are deliberately database-neutral. PostgreSQL/object-storage adapters must be added only after the domain model, authorization model, retention policy and deployment boundary are approved.

These steps must not bypass authorization, workflow, data-governance or audit-integrity controls.
