# MTA DETENI — Deterministic Fallback Engine Contract v1.0

## Purpose
Provide a complete non-AI path for turning approved field evidence into a valid Canonical Daily Dataset.

## Pipeline
```text
Evidence → classify → normalize → map → validate → assemble → verify
```

## Deterministic rules
- Classification: controlled event taxonomy + explicit user selection.
- Identity: canonical record IDs only; no fuzzy identity resolution.
- Time: captured_at/server timestamp with explicit timezone handling.
- Numbers: strict numeric parsing and range/type validation.
- Photos: explicit evidence/event/slot references; preserve capture order.
- Captions: governed templates; never invent facts.
- Narrative: structured sentence patterns + editable human text.
- Completeness: required-field rules.
- Consistency: cross-field assertions.
- Pagination: renderer-owned deterministic rules.
- Integrity: deterministic hash of normalized dataset/output metadata.

## Failure behavior
AI timeout, 429, quota exhaustion, network failure, invalid credentials, provider outage, or gateway failure switches assistance to OFF. The core pipeline continues without waiting or retry loops.

## Prohibited
- direct dependency on provider SDKs
- blocking report generation on AI
- silently substituting AI guesses for missing authoritative data
- destructive normalization of raw evidence
- duplicate transactions after retry

## Acceptance
A synthetic fixture must generate the same approved dataset regardless of AI availability when AI is not required for supplied fields. AI-only enrichment remains optional/unverified until human verification.
