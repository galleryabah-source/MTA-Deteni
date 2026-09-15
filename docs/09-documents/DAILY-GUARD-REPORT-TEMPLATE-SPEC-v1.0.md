# MTA DETENI — Daily Guard Report Template Specification v1.0

## 1. Purpose

MTA DETENI shall support automatic generation of the Daily Guard Team Report (Laporan Harian Regu Jaga) from structured operational records. The generated report must preserve the approved visual/document structure of the reference report supplied by the process owner while keeping operational data separate from the template.

Reference analyzed for this contract: an 11-page Daily Guard Team Report for Rumah Detensi Imigrasi Pontianak, Piket Pagi Regu Bravo, 11 September 2026, 07.00–14.00 WIB.

The reference contains a cover, addressee page, team handover, detainee-block checking/control, guard-post readiness, detainee activity supervision, special escort activity, meal distribution, end-of-shift handover, closing/signature page, and a closing/thank-you page.

This specification is a functional contract. It does not authorize publication of the reference PDF or real detainee data into the repository.

## 2. Document Identity

- Document type: `DAILY_GUARD_REPORT`
- Output: PDF
- Primary grouping: duty team/regu + shift + duty date
- Example filename: `Laporan_Harian_Regu_Jaga_2026-09-11_Bravo_Pagi.pdf`
- Template is versioned and effective-dated.
- Generated reports retain the template version used at generation time.

## 3. Report Structure

The baseline template contains 11 pages. Page count is configurable because optional activities may be omitted or additional approved activity pages may be inserted under controlled template rules.

| Page | Baseline section | Required data |
|---|---|---|
| 1 | Cover | office identity, report title, regu, shift, date, duty time, approved cover image |
| 2 | Addressee | approved recipient list/text |
| 3 | Team handover | outgoing/incoming regu, commander, members, security/support, attendance status, handover time, key notes |
| 4 | Detainee block checking/control | time, officers/teams involved, headcount, nationality/status aggregation, custody/placement notes, photos |
| 5 | Guard-post readiness | CCTV/post activity, security condition, results, photos |
| 6 | Detainee activity supervision | activity description, result, time/location, photos |
| 7 | Special escort/activity | detainee count, nationality/status where authorized, destination/purpose, escort activity, photos |
| 8 | Meal distribution/other scheduled service | inspection time, condition/result, distribution status, photos |
| 9 | End-of-shift handover | time, incoming team, joint control, condition, outstanding issues, photos |
| 10 | Closing and signatures | closing statement, place/date, commander, supervisor/approver, NIP/identifier where authorized, signatures |
| 11 | Closing page | approved institutional closing artwork/text and regu/shift identifier |

## 4. Visual Fidelity Contract

The report engine shall treat the approved template as a controlled visual asset, not as a generic HTML printout.

The template contract covers:

- page dimensions and orientation;
- header and institutional identity;
- official logos/artwork supplied by the process owner;
- background image/watermark treatment;
- section title placement;
- typography and text hierarchy;
- photo frame dimensions and placement;
- spacing, margins and separators;
- signature blocks;
- footer/closing artwork;
- page ordering.

The implementation shall use deterministic rendering so the same source record + template version produces the same report content and layout, subject only to renderer-level nondeterminism explicitly tested and accepted.

"Same format" means structural and visual conformity to the approved template. Exact pixel identity is an acceptance target for the approved production renderer and must be validated using rendered-page regression tests.

## 5. Structured Report Data Contract

A report is generated from structured records rather than manually composed text.

```text
GuardReport
├── report_id
├── report_date
├── office_id
├── regu_id
├── shift_id
├── start_at
├── end_at
├── status
├── template_version
├── addressees[]
├── handover
├── block_control[]
├── guard_post[]
├── detainee_activity[]
├── escort_activity[]
├── meal_distribution[]
├── end_handover
├── signatories[]
├── photos[]
├── generated_by
├── generated_at
└── integrity_hash
```

The report engine must not infer critical operational facts from free-form narrative when a structured field exists. Narrative text may be generated from verified structured data using deterministic templates.

## 6. Dynamic Narrative Rules

The engine may assemble natural-language report paragraphs from approved phrase templates and verified fields.

Example pattern:

```text
Pukul {{time}} WIB, {{team}} melaksanakan {{activity}}.
Hasil kegiatan: {{result}}.
```

Rules:

1. Missing mandatory facts cause validation failure rather than fabricated content.
2. Counts and nationality/status summaries must be calculated from the authorized source record.
3. No AI-generated statement may be treated as an operational fact without human verification.
4. The engine must preserve terminology approved by the process owner.
5. Generated narrative must retain provenance to the source activity records.

## 7. Photo Contract

Each activity may have zero or more approved photographs.

Photo metadata shall include at minimum:

- photo ID;
- source/activity ID;
- captured_at where available;
- uploader;
- storage/object reference;
- integrity checksum;
- approval/status;
- template placement target.

The renderer shall support fixed photo slots, configurable crops, and deterministic ordering. Photos must not be exposed outside the authorized report scope.

## 8. Regu/Shift Download Contract

Authorized users shall be able to filter and download reports by:

- duty date;
- regu/team;
- shift;
- office;
- report status.

Minimum user flow:

```text
Select Date → Select Regu → Select Shift → Validate Completeness → Preview → Generate → Review/Approve → Download
```

Suggested download naming:

```text
Laporan_Harian_Regu_Jaga_{YYYY-MM-DD}_{REGU}_{SHIFT}.pdf
```

Bulk download may produce a controlled ZIP for authorized users, with each report retaining its own document ID and integrity hash.

## 9. Workflow States

```text
DRAFT
  ↓
READY_FOR_GENERATION
  ↓
GENERATED
  ↓
REVIEW
  ├── REVISION_REQUIRED → DRAFT
  ↓
APPROVED
  ↓
FINAL
  ↓
ARCHIVED
```

A finalized report must not be silently overwritten. Corrections create a controlled revision and audit event.

## 10. Signature and Approval

The report may contain the duty commander and supervisory/approving signature blocks when required by the approved template and authority matrix.

Signature data must come from authorized master data or an approved signature mechanism. The system shall not fabricate signatures. If a visual signature asset is used, its authorization, version and integrity must be controlled.

## 11. Document Integrity and Audit

Every generated report stores:

- `document_id`;
- report ID;
- template ID/version;
- source record IDs;
- generated_by;
- generated_at;
- status;
- SHA-256 hash;
- renderer/version metadata;
- approval/issue events;
- download events.

Audit events are required for generation, preview where policy requires it, approval, revision, finalization, download and archive.

## 12. Access and Data Minimization

The report engine enforces the same authorization boundary as the underlying operational records.

- KAMTIB may create/review/generate/download reports within its authorized operational scope.
- Supervisors/authorized approvers may review and approve according to mandate.
- Head Rudenim receives oversight visibility according to the leadership authority model.
- AUDITOR receives read/audit access according to audit scope.
- Technical administrators do not automatically gain substantive detainee access merely because they administer the system.

Only fields necessary for the report may be rendered. Health, biometric and other restricted data must not be included unless separately authorized and required.

## 13. Template Registry

Each daily-report template must have:

- `template_id`;
- `document_type`;
- `version`;
- `effective_from`;
- `effective_until`;
- `status` (`DRAFT`, `ACTIVE`, `RETIRED`);
- owner;
- authority/reference;
- asset/object reference;
- checksum;
- required data fields;
- page definitions;
- renderer contract;
- metadata.

Historical reports remain bound to their original template version.

## 14. Validation and Completeness

Before generation, MTA validates:

- regu and shift exist and are authorized;
- duty date/time is valid;
- attendance/handover data is complete;
- mandatory activity sections are satisfied;
- counts reconcile with the authorized operational source;
- required photos are present where the template requires them;
- signatory authority is valid;
- required placeholders have values;
- restricted fields are excluded unless authorized;
- template version is active for the report date;
- report ID is unique.

A failed validation must produce actionable errors and must not create a misleading final PDF.

## 15. Rendering and Regression Test Contract

The implementation shall maintain synthetic fixtures representing at least:

1. complete 11-page report;
2. no special activity;
3. multiple activities;
4. incomplete handover;
5. missing mandatory photo;
6. unauthorized field attempt;
7. revised/finalized report;
8. historical template version.

Tests must cover:

- page count and ordering;
- required headings;
- text overflow/clipping;
- photo placement;
- signature block placement;
- date/time formatting;
- filename contract;
- template version binding;
- hash generation;
- authorization;
- audit events;
- deterministic rendering where supported.

## 16. Acceptance Criteria

The feature is accepted only when:

1. An authorized user can select a date, regu and shift and generate the corresponding report.
2. The generated report follows the approved 11-page baseline structure for the reference case.
3. Dynamic sections are populated from structured MTA records.
4. Activity photos are placed according to the approved template.
5. Missing mandatory data blocks final generation.
6. Unauthorized data cannot be merged into the report.
7. Final reports retain template version and source-record provenance.
8. Download is restricted by authority and creates an audit event.
9. Historical reports remain reproducible against their historical template version.
10. A generated report has a verifiable SHA-256 integrity hash.
11. Revision of a finalized report is controlled and auditable.
12. No real detainee data or operational report is committed to GitHub.

## 17. Implementation Boundary

This specification defines the report/document contract first. Database schema, storage implementation, renderer library and deployment choices remain implementation decisions and must follow the project's existing governance, security and migration gates.

No production migration is implied by this specification.
