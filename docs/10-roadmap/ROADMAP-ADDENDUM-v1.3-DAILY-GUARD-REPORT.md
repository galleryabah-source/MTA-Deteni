# MTA DETENI — Roadmap Addendum v1.3
## Daily Guard Report Automation

### Roadmap placement

The Daily Guard Report automation is formally added to the D5 Document Engine workstream and connected to D8 Reporting & Operational Intelligence.

### D5 additions

D5 now includes the following mandatory output capability:

**DOC-03 — Laporan Harian Regu Jaga**

- output: PDF;
- primary key/grouping: office + duty date + regu + shift;
- controlled template versioning;
- 11-page baseline structure based on the supplied reference;
- dynamic structured data merge;
- deterministic narrative composition;
- approved activity photographs;
- preview and completeness validation;
- review/approval/finalization;
- SHA-256 integrity;
- provenance/source-record binding;
- download audit;
- historical template binding;
- single and authorized bulk download.

### Baseline report sections

1. Cover
2. Addressee
3. Team handover
4. Detainee block checking/control
5. Guard-post readiness
6. Detainee activity supervision
7. Special escort/activity
8. Meal distribution/service activity
9. End-of-shift handover
10. Closing/signatures
11. Closing/thank-you page

### Dependency

```text
D0 Governance
  ↓
D1 Process + Data + Authority + Document Contract
  ↓
D2 Security + Authorization
  ↓
D3 Core Data
  ↓
D4 Guard-duty operational records / movement / temporary-exit dependencies
  ↓
D5 Document Engine
  ├─ DOC-01 Surat Izin Keluar Sementara
  ├─ DOC-02 Surat Tugas Pengawalan
  └─ DOC-03 Laporan Harian Regu Jaga
  ↓
D6 Approval + Leadership + RBAC Administration
  ↓
D8 Reporting & Operational Intelligence
  ↓
D9 Rendering Regression + UAT + Security Hardening
  ↓
D10 Production & Institutionalization
```

### New D5 acceptance gate

D5 Daily Guard Report is PASS only if an authorized synthetic user can:

`Select Date + Regu + Shift → Complete Activities → Attach Photos → Validate → Preview → Generate → Review/Approve → Download`

and the PDF conforms to the approved template version, preserves provenance, has a verifiable integrity hash, and records the required audit events.

### Non-negotiable controls

- no fabricated operational facts;
- no unauthorized field merge;
- no silent overwrite of finalized reports;
- no production document or real detainee data in GitHub;
- no production migration merely because the report template has been specified;
- historical reports remain tied to their historical template version.
