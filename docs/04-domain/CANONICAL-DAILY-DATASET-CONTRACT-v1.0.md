# MTA DETENI — Canonical Daily Dataset Contract v1.0

## Status
LOCKED IMPLEMENTATION CONTRACT — AI-INDEPENDENT

The Canonical Daily Dataset is the single convergence contract between field evidence and the Document Engine. AI is optional and cannot be a prerequisite for producing this dataset.

## Contract
```text
Field Evidence → deterministic normalization → Canonical Daily Dataset → validation → human verification → approved dataset → approved template → deterministic renderer
```

Required domains: report identity/date/shift/group; operational events; people/counts and approved aggregates; narrative entries; photo evidence references; captions; completeness/validation state; provenance; verification state.

Each value must be traceable to source evidence/reference or explicit human input. AI-derived values are proposals until verified.

## Invariants
1. Same approved dataset + same template version produces deterministic report output.
2. AI failure does not invalidate an otherwise valid dataset.
3. Raw evidence remains preserved.
4. No inferred value becomes authoritative without verification.
5. Dataset state is independent of AI provider state.
6. Document Engine consumes the dataset, never an AI response directly.

## AI-OFF fallback
Use controlled event taxonomy, explicit IDs, schema/type validation, required-field checks, cross-field consistency checks, controlled caption/narrative patterns, explicit photo-slot mapping, and deterministic pagination.

## Scope
This contract does not authorize schema migration. Initial implementation uses the existing persistence boundary and synthetic fixtures until a data-contract/schema gate authorizes otherwise.
