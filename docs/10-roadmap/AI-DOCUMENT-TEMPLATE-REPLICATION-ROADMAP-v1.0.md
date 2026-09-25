# MTA DETENI — AI Document Template Intelligence & Replication Roadmap v1.0

## Status

**LOCKED ROADMAP ADDENDUM — 25 September 2026**

This roadmap is subordinate to the Master Roadmap and must follow the existing governance, migration freeze, security gates, runtime certification, and AI failure-resilience controls.

## AI-DOC-01 — Contract

Define the canonical reference-document, template, field, image-slot, mapping, fidelity and generated-document contracts.

**Exit:** contracts documented and reviewed.

## AI-DOC-02 — Reference Intake

Implement governed upload/storage of reference documents without exposing production-sensitive files to the repository.

**Exit:** authorized source document can be stored and referenced with provenance/hash.

## AI-DOC-03 — Document Analysis

Implement provider-abstracted analysis for supported reference formats.

Analysis must identify structure, sections, fields, tables, images, layout metadata and candidate mappings.

**Exit:** deterministic normalized template proposal is produced from a synthetic reference fixture.

## AI-DOC-04 — Human Review

Provide a review surface where proposed fields, mappings, image slots and uncertain elements can be corrected.

**Exit:** no proposed template becomes ACTIVE without approval.

## AI-DOC-05 — Template Registry

Bind approved templates to version, owner, authority, effective date, status and source-document identity.

**Exit:** ACTIVE templates are immutable/versioned.

## AI-DOC-06 — Deterministic Generator

Extend the existing Document Engine to populate approved templates with current MTA DETENI data and current images.

**Exit:** generated output is bound to exact template version and output hash.

## AI-DOC-07 — Fidelity Engine

Add structural and visual regression checks for representative templates.

Priority fixture: **Laporan Harian** with tables, multiple pages and photographs.

**Exit:** material template drift is detected and reported.

## AI-DOC-08 — Workflow Integration

Integrate generated documents with existing review, approval, issue, download, distribution and archive lifecycle.

**Exit:** generated document cannot bypass workflow.

## AI-DOC-09 — Audit & Provenance

Record template source/version, actor, timestamps, data/image references, generator version, output hash and relevant audit events.

**Exit:** complete source-to-output evidence chain.

## AI-DOC-10 — Failure Resilience

Test AI timeout, provider outage, invalid credential, rate limit, malformed analysis, renderer failure and recovery.

**Exit:** AI failure cannot break core MTA DETENI workflows; approved deterministic templates remain usable.

## AI-DOC-11 — Controlled Non-Production

Run synthetic end-to-end journeys:

```
Upload example
→ Analyze
→ Review
→ Approve
→ Activate version
→ Enter current data/images
→ Generate
→ Validate
→ Review
→ Finalize
→ Download
→ Audit
```

**Exit:** executable evidence is observed and verified.

## AI-DOC-12 — Production Gate

Production enablement requires all existing governance gates plus:

- security approval;
- data-egress approval;
- secret-boundary verification;
- RLS/storage verification where applicable;
- fidelity evidence;
- failure-resilience evidence;
- browser journey evidence;
- audit/evidence certification.

**AI remains OFF until the existing production authorization gate explicitly clears it.**

## Priority implementation order

1. Laporan Harian reference/template replication.
2. Surat Perintah.
3. Surat Tugas Pengawalan.
4. Surat Izin Keluar Sementara.
5. Other approved operational reports/documents.

The priority is based on proving the general engine with a complex report containing text, tables and images; it is not a ranking of operational importance.

## Definition of Done

The capability is complete only when an authorized user can upload an approved synthetic reference document, have its structure analyzed, review and approve the proposed template, generate a new document using current synthetic data/images, verify template fidelity, complete the existing workflow, and obtain an auditable final output without making core MTA DETENI dependent on external AI.
