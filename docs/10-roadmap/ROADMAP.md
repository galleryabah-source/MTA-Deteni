# MTA DETENI — Master Roadmap v1.2

## Roadmap Strategy

**Governance → Process → Data → Authority → Security → Document → Architecture → Implementation → Test → Audit → Pilot → Release → Institutionalization**

MTA DETENI adalah inovasi tata kelola; MTA DETENI Digital adalah instrumen pendukung. Setiap fase menghasilkan evidence untuk PKP dan operasional.

---

# D0 — Governance & Discovery

- validasi positioning PKP;
- AS-IS interview RAP, PERKES, KAMTIB, Subbag TU, pimpinan;
- pemetaan registrasi, kesehatan, keamanan/ketertiban, izin keluar, pengawalan, surat tugas, pelaporan, arsip;
- baseline KPI;
- authority/responsibility matrix;
- dasar hukum/SOP internal;
- klasifikasi data/dokumen;
- stakeholder dan process owner.

**Gate D0:** masalah, kewenangan, baseline KPI, AS-IS, scope/non-goals tervalidasi.

---

# D1 — Process, Data & Document Contract Foundation

- TO-BE BPMN/process map;
- SOP/control points, handoff, exception dan escalation;
- data dictionary, logical model, classification, lifecycle, provenance, retention;
- authority matrix sampai action/field/domain/context;
- separation of duties, approval authority, break-glass;
- workflow state machine;
- **Document Contract** untuk Surat Izin Keluar Sementara dan Surat Tugas Pengawalan;
- field mapping, placeholders, signature block, numbering/register, template owner/version/effective date/archive;
- **RBAC Permission Catalog**: domain, action, scope, risk level, mandatory/optional, dependency, incompatible permissions;
- **Super Admin RBAC policy**: siapa boleh mengubah permission, batas perubahan, second approval untuk permission kritis, rollback/versioning.

**Gate D1:** process, data, authority, workflow, document contract, dan RBAC catalog disetujui.

---

# D2 — Architecture & Security Foundation

- target architecture dan trust boundary;
- threat model;
- RBAC/ABAC enforcement design;
- **Super Admin RBAC Console architecture**;
- authorization decision point/policy enforcement point;
- restricted PERKES/health-data boundary;
- RLS strategy bila relevan;
- authentication/session;
- CSRF/CORS/rate limiting;
- encryption;
- object-storage security;
- audit/event integrity;
- backup/restore dan disaster recovery;
- logging/observability;
- secret/dependency scanning;
- CI security gates;
- synthetic test-data strategy.

**Gate D2:** architecture/security/audit/backup design approved.

---

# D3 — Core Administration

- authentication;
- users/roles/permissions;
- master data deteni;
- document registry;
- block/room/bed;
- status history;
- detainee timeline foundation;
- provenance;
- completeness/verification;
- restricted-domain boundary.

**Acceptance:** CRUD, field restrictions, history, validation, synthetic fixtures pass.

---

# D4 — Movement, Identification, Headcount & Temporary Exit

- movement ledger;
- placement transfer;
- headcount;
- barcode/QR;
- block/room operational list;
- temporary exit request;
- configurable exit purpose;
- approval prerequisite;
- escort planning;
- departure/return;
- operational alerts;
- exception handling.

Core flow:

`Request → Validation → Authorization/Approval → Exit Letter → Escort Assignment → Execution → Return → Result/Event`

---

# D5 — Document Engine — CORE MVP OUTPUT

Mandatory:

1. **Surat Izin Keluar Sementara — DOCX**
2. **Surat Tugas Pengawalan — DOCX**

Includes:
- controlled templates;
- data merge;
- template versioning/effective date;
- placeholder validation;
- numbering/register;
- approval/signature metadata;
- document ID;
- SHA-256 integrity;
- download audit;
- distribution/archive;
- historical template binding.

Access:
- KAMTIB: generate/review/download Surat Izin Keluar sesuai status;
- SUBBAG_TU: administer/register/generate/download Surat Tugas sesuai status;
- approver: approve/issue;
- auditor: read/audit;
- Head Rudenim: oversight/read-only + direction.

---

# D6 — Workflow, Approval, Leadership & RBAC Administration

## A. Workflow/Approval
- task inbox;
- review/reject/revise;
- signature/authorization metadata;
- issue/distribution/archive;
- audit events.

## B. Leadership Direction
- PETUNJUK;
- ARAHAN;
- REKOMENDASI;
- DISPOSISI;
- acknowledgement;
- action;
- response;
- closure;
- monitoring.

## C. Super Admin RBAC Console — NEW PRIORITY

Route target:

`/admin/security/rbac`

### UI
- role selector;
- permission search;
- domain/action filters;
- checklist/checkbox permission matrix;
- checked = granted;
- unchecked = denied;
- locked = policy-mandated or protected;
- warning = high-risk permission;
- pending-change indicator;
- before/after comparison;
- **Simpan Pengaturan**;
- Reset Perubahan.

### Capability
Super Admin dapat:
- menambah kewenangan dengan check;
- mengurangi kewenangan dengan uncheck;
- mengelola role sesuai policy;
- melihat permission inherited/explicit;
- melihat dependency/incompatible permission;
- melihat perubahan yang belum disimpan;
- menyimpan policy baru sebagai versioned configuration;
- membandingkan versi;
- rollback secara terkontrol.

### Save Control

`Edit → Validate → Detect Escalation → Reason → Re-authentication bila perlu → Second Approval bila kritis → Atomic Save → Audit → Cache Invalidation → Confirmation`

Perubahan tidak aktif sebelum **Simpan Pengaturan**.

### Guardrails

- deny-by-default;
- tidak boleh privilege escalation yang melanggar policy;
- user tidak boleh menaikkan privilege dirinya secara tidak terkendali;
- permission audit tampering selalu protected;
- restricted health access mendapat guardrail khusus;
- sensitive export mendapat guardrail;
- critical approval/RBAC permissions dapat membutuhkan second approval;
- tidak ada partial save;
- rollback harus diaudit.

### Super Admin vs Head Rudenim

`SUPER_ADMIN` = system access governance.

`HEAD_RUDENIM` = substantive leadership oversight.

Keduanya **tidak boleh disamakan**. Kepala Rudenim tidak otomatis menjadi Super Admin, dan Super Admin tidak otomatis memperoleh akses substantif ke data deteni sensitif.

### Audit
Setiap perubahan RBAC minimal menyimpan:

`actor, role_changed, before_policy_hash, after_policy_hash, permissions_added, permissions_removed, reason, second_approver, timestamp, correlation_id, result`.

### Acceptance
- checkbox changes pending state;
- Save persists atomically;
- unauthorized change rejected;
- privilege escalation blocked;
- critical change requires required controls;
- audit before/after exists;
- policy version increments;
- rollback works and is audited;
- authorization cache/session policy is refreshed;
- sensitive domain remains protected.

---

# D7 — Intelligent Intake

- OCR;
- authorized official message intake;
- transcript extraction;
- structured draft;
- confidence score;
- validation queue;
- human verification;
- source/provenance;
- quarantine/raw vault.

No direct OCR/message/transcript → approved operational record.

---

# D8 — Reporting & Operational Intelligence

- executive dashboard;
- RAP dashboard;
- restricted PERKES dashboard;
- KAMTIB dashboard;
- TU document dashboard;
- Head Rudenim dashboard;
- KPI;
- briefing;
- document turnaround;
- completeness;
- exception analysis;
- trend analysis;
- recommendation/disposition follow-up.

Analytics assist decisions; they do not replace authority.

---

# D9 — Pilot, Security Hardening & UAT

- controlled pilot;
- synthetic tests before sensitive pilot;
- SOP alignment;
- user training;
- unit/integration/E2E tests;
- authorization regression;
- **RBAC mutation regression**;
- privilege-escalation tests;
- security regression;
- performance/load;
- backup/restore drill;
- audit integrity;
- DOCX rendering regression;
- accessibility/usability where appropriate.

UAT actors: RAP, PERKES, KAMTIB, SUBBAG_TU, PEJABAT_APPROVER, HEAD_RUDENIM, AUDITOR, and authorized Super Admin.

**Gate D9:** UAT + security + RBAC + backup/restore + SOP readiness PASS.

---

# D10 — Production & Institutionalization

- authorized infrastructure;
- secure deployment;
- migration only after approved schema/data contract;
- monitoring;
- backup;
- incident response;
- access review;
- periodic RBAC recertification;
- policy version review;
- role/permission change control;
- operational training;
- KPI review;
- periodic audit;
- continuous improvement.

---

# Cross-Phase Workstreams

## Governance
Legal/SOP alignment, authority review, privacy, change control D0–D10.

## Security
Threat model, secure coding, authorization testing, audit, backup, incident readiness D2–D10.

## RBAC/ABAC
Permission catalog → policy → enforcement → Super Admin Console → audit → recertification D1–D10.

## Document Governance
Template owner/version/effective date/approval/archive/retention/integrity D1–D10.

## KPI/PKP Evidence
Baseline D0 → target D1 → pilot D9 → before/after D10.

## Data Quality
Completeness → validation → verification → correction/versioning → monitoring.

---

# Dependency Order

```text
D0 Governance
   ↓
D1 Process + Data + Authority + Document + RBAC Contract
   ↓
D2 Architecture + Security + Authorization Enforcement
   ↓
D3 Core Data
   ↓
D4 Movement + Temporary Exit
   ↓
D5 Document Engine
   ↓
D6 Approval + Leadership + Super Admin RBAC Console
   ↓
D7 Intelligent Intake
   ↓
D8 Reporting/Intelligence
   ↓
D9 Pilot/UAT/Hardening
   ↓
D10 Production/Institutionalization
```

**D5 tetap prioritas MVP. D6 RBAC Console dapat mulai dibangun setelah RBAC catalog dan security enforcement contract D1/D2 selesai.**

---

# Hard Gates

Setiap gate membutuhkan evidence: governance approval, process acceptance, data contract, authority/security acceptance, document contract/template acceptance, RBAC policy acceptance, tests, audit evidence, UAT evidence, dan backup/restore evidence bila relevan.

## Non-Negotiable Rules

1. Tidak ada real detainee data di GitHub.
2. Tidak ada secret/credential di repository.
3. Tidak ada direct WhatsApp/OCR/transcript → production record.
4. Tidak ada autonomous AI decision-making.
5. Tidak ada bypass authorization.
6. Tidak ada silent overwrite critical records.
7. Tidak ada migration sebelum model dan controls disetujui.
8. Kepala Rudenim bukan `SUPER_ADMIN`; visibility/leadership direction dipisahkan dari operational editing.
9. KAMTIB tidak mengambil alih administrasi Surat Tugas milik TU.
10. TU tidak mengambil alih keputusan substantif izin/pengawalan.
11. Template resmi harus versioned dan historical documents tetap terikat pada versi yang digunakan.
12. DOCX Surat Izin Keluar Sementara dan Surat Tugas Pengawalan adalah output inti MVP.
13. Super Admin hanya mengelola authorization policy sesuai governance; tidak otomatis memperoleh akses substantif ke seluruh data.
14. Setiap perubahan RBAC harus versioned, atomic, auditable, dan dapat direview/rollback secara terkontrol.
