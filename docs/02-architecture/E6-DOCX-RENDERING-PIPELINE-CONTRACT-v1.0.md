# E6 — Production DOCX Rendering Pipeline Contract v1.0

## Objective

Define a deterministic, server-side DOCX rendering boundary for the two mandatory MTA DETENI documents without coupling document generation to AI or persistence.

## Mandatory outputs

1. Surat Izin Keluar Sementara
2. Surat Tugas Pengawalan

## Pipeline

`Document Contract → Exact Template Version → Validate → Merge → DOCX Renderer → SHA-256 → Artifact Store → Binding → Lifecycle/Audit`

## Renderer requirements

- Server-side only.
- Deterministic for identical contract/template/data inputs.
- No external AI dependency.
- No direct database writes.
- Must preserve the exact template version used for the artifact.
- Must return the approved DOCX media type.
- Must fail closed on empty content or incomplete template binding.

## Artifact integrity

The artifact store verifies SHA-256 against the actual binary bytes before persistence. A hash mismatch is a hard failure.

## Metadata

Renderer options may include non-sensitive document metadata such as author and subject. Sensitive detainee data must not be logged as telemetry.

## Template governance

Templates are immutable versions. Historical documents remain bound to the exact template ID/version and content hash used at generation time.

## Persistence boundary

DOCX rendering is separate from object storage. The production object-storage adapter will be added only after the persistence model is approved.

## Current implementation state

The repository contains the renderer interface/adapter boundary. A concrete DOCX library adapter is intentionally deferred until the dependency, licensing, deployment runtime and approved template source are selected.

No schema or migration is introduced by this contract.
