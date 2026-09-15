# MTA DETENI — Master Blueprint Addendum v1.3
## Daily Guard Report Automation

### Decision

MTA DETENI shall include a controlled Daily Guard Report automation capability. The capability converts verified guard-duty operational records into a controlled PDF report following the approved visual/document template used by the process owner.

### Why this is part of the core system

The report is not a separate office document workflow. It is the presentation/output layer of the guard-duty operational record. Therefore the system of record remains structured MTA data, while the PDF is a generated, versioned and auditable artifact.

### Baseline reference

The supplied reference report is an 11-page document for a morning Bravo duty team. Its baseline sequence is:

1. cover;
2. addressee;
3. guard-team handover;
4. detainee-block checking/control;
5. guard-post readiness;
6. detainee activity supervision;
7. special escort/activity;
8. meal distribution;
9. end-of-shift handover;
10. closing and signatures;
11. closing/thank-you page.

The production template may vary only through controlled template versioning and approved process-owner changes.

### Functional architecture

```text
Operational Records
   ├─ duty/team/shift
   ├─ attendance & handover
   ├─ headcount/control
   ├─ guard-post activity
   ├─ detainee activity
   ├─ escort activity
   ├─ meal/service activity
   ├─ end handover
   └─ approved photos
          ↓
Completeness + Authorization Validation
          ↓
Narrative/Field Mapping Contract
          ↓
Active Template Version Resolution
          ↓
Deterministic Report Renderer
          ↓
Preview
          ↓
Review / Approval
          ↓
FINAL PDF
          ↓
Hash + Audit + Archive
```

### User capability

Authorized guard personnel can:

- record duty activities;
- attach approved activity photographs;
- review report completeness;
- preview the report;
- generate the report;
- submit for review/approval;
- download the report for the selected regu/team and shift.

Authorized supervisors can review, approve, revise and finalize according to the authority matrix.

### Download dimensions

Reports must be filterable/downloadable by:

- date;
- regu/team;
- shift;
- office;
- status.

Bulk ZIP download may be enabled for authorized users without removing per-document identity, integrity and audit controls.

### Template governance

The daily report uses the same document-governance principles as other MTA documents:

- template ID and version;
- effective date;
- owner and authority/reference;
- required placeholders/data contract;
- checksum;
- historical template binding;
- no silent overwrite of finalized reports.

### Visual fidelity requirement

The implementation shall target structural and visual conformity to the approved reference, including page size, orientation, institutional header, logos/artwork, background/watermark, typography, section title placement, photo frames, separators, signature blocks and page order.

Exact pixel-level conformity is an engineering acceptance target and must be verified with rendered-page regression tests against an approved sanitized reference/template.

### Data and security boundary

The repository remains synthetic-data-only. No real detainee report, operational photograph, real signature, credential or production document is committed to GitHub.

The report renderer must enforce the same authorization and data-minimization controls as the source operational records. Technical administration does not imply substantive access to restricted detainee data.

### AI boundary

AI is not required for report generation. Deterministic templates should generate operational narratives from verified structured data. If AI is used for drafting assistance in a later phase, its output remains untrusted draft content and requires human verification before becoming a report fact.

### Phase placement

This capability is added to **D5 — Document Engine** and connected to **D8 — Reporting & Operational Intelligence**. It becomes a mandatory implementation workstream for guard-duty reporting while preserving the existing D0–D4 governance/data/authorization dependencies.

### Gate

Implementation shall not proceed to production migration merely because the template contract exists. Database and storage contracts remain subject to the project's existing approval and migration gates.
