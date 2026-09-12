# MTA DETENI — Master Roadmap v1.1

## Roadmap Strategy

Roadmap ini mengikuti prinsip:

**Governance → Process → Data → Authority → Security → Document → Architecture → Implementation → Test → Audit → Pilot → Release → Institutionalization**

MTA DETENI adalah inovasi tata kelola; MTA DETENI Digital adalah instrumen pendukung. Setiap fase harus menghasilkan evidence yang dapat digunakan untuk PKP dan operasional.

---

# D0 — Governance & Discovery

## Tujuan
Menetapkan masalah, kewenangan, ruang lingkup, baseline, dan arah perubahan.

## Workstream
- validasi positioning PKP;
- AS-IS interview RAP, PERKES, KAMTIB, Subbag TU, dan pimpinan;
- pemetaan alur registrasi, kesehatan, keamanan/ketertiban, izin keluar, pengawalan, surat tugas, pelaporan, dan arsip;
- identifikasi bottleneck, duplikasi input, keterlambatan, dan risiko kehilangan dokumen;
- baseline KPI;
- authority/responsibility matrix;
- scope/non-goals;
- identifikasi dasar hukum/SOP internal yang berlaku;
- identifikasi klasifikasi data dan dokumen;
- daftar stakeholder dan owner proses.

## Gate D0
- masalah prioritas tervalidasi;
- kewenangan tervalidasi;
- baseline KPI tersedia;
- AS-IS map disetujui;
- scope dan non-goals disetujui.

---

# D1 — Process, Data & Document Contract Foundation

## Tujuan
Mengunci desain proses, data, workflow, dan kontrak dokumen sebelum coding besar.

## Workstream
### Process
- TO-BE BPMN/process map;
- SOP/control points;
- handoff antar-seksi;
- exception path;
- escalation path.

### Data
- data dictionary;
- entity relationship logical model;
- data classification;
- required/optional fields;
- provenance model;
- lifecycle record;
- retention/deletion policy baseline.

### Authority
- permission matrix sampai action/field/domain/context;
- separation of duties;
- approval authority;
- break-glass policy.

### Workflow
- state machine;
- transition rules;
- required evidence per state;
- rejection/revision rules.

### Document Contract — PRIORITAS
- spesifikasi **Surat Izin Keluar Sementara**;
- spesifikasi **Surat Tugas Pengawalan**;
- field mapping;
- placeholder schema;
- signature block;
- numbering/register;
- approval chain;
- metadata;
- template ownership;
- template version/effective date;
- archive/distribution requirements.

## Gate D1
Tidak boleh lanjut ke implementation besar sebelum process, data, authority, workflow, dan document contract disetujui.

---

# D2 — Architecture & Security Foundation

## Tujuan
Membangun security-by-design dan arsitektur teknis yang dapat dipertanggungjawabkan.

## Workstream
- target architecture;
- trust boundary;
- threat model;
- RBAC/ABAC enforcement design;
- restricted PERKES/health-data boundary;
- RLS strategy bila relevan;
- authentication/session;
- CSRF/CORS/rate limiting;
- encryption;
- object-storage security;
- audit/event integrity;
- backup/restore;
- disaster recovery;
- logging/observability;
- secret/dependency scanning;
- CI security gates;
- synthetic test-data strategy.

## Gate D2
- architecture review PASS;
- threat model reviewed;
- security baseline approved;
- audit model approved;
- backup/restore design approved;
- no sensitive production data in repository.

---

# D3 — Core Administration

## Tujuan
Membangun fondasi data deteni dan penempatan.

## Modules
- authentication;
- users/roles/permissions;
- master data deteni;
- document registry dasar;
- block/room/bed;
- status history;
- detainee timeline foundation;
- provenance;
- completeness/verification status;
- restricted-domain boundary.

## Acceptance
- CRUD sesuai matrix;
- field-level restrictions tested;
- history tidak dapat silent overwrite;
- data validation berjalan;
- synthetic fixtures tersedia.

---

# D4 — Movement, Identification, Headcount & Temporary Exit

## Tujuan
Mengendalikan pergerakan deteni dan proses keluar sementara.

## Modules
- movement ledger;
- placement transfer;
- headcount;
- barcode/QR individual;
- block/room operational list;
- temporary exit request;
- configurable exit purpose;
- approval prerequisite;
- escort planning;
- departure/return recording;
- operational alerts;
- exception handling.

## Core Flow

```text
Request → Validation → Authorization/Approval → Exit Letter
       → Escort Assignment → Execution → Return → Result/Event
```

## Acceptance
- izin tidak dapat diterbitkan tanpa prerequisite;
- departure/return tercatat;
- movement/headcount konsisten;
- semua event masuk timeline/audit;
- role boundary KAMTIB/RAP/PERKES/TU enforced.

---

# D5 — Document Engine — CORE MVP OUTPUT

## Tujuan
Menghasilkan dokumen Word resmi/terkendali secara konsisten, cepat, dapat diaudit, dan dapat diarsipkan.

## Mandatory Outputs
### 1. Surat Izin Keluar Sementara
- generate `.docx`;
- data merge dari record yang telah diverifikasi;
- nomor surat;
- identitas deteni sesuai policy;
- tujuan/purpose;
- tanggal/waktu keluar dan kembali;
- dasar/rujukan;
- pejabat berwenang;
- signature block;
- document ID;
- template version;
- hash.

### 2. Surat Tugas Pengawalan
- generate `.docx`;
- petugas pengawal;
- jabatan/pangkat/NIP bila memang diperlukan dan diizinkan;
- deteni terkait;
- tujuan;
- waktu/tanggal;
- dasar penugasan;
- pejabat berwenang;
- signature block;
- document ID;
- template version;
- hash.

## Template Governance
- template registry;
- versioning;
- effective date;
- ACTIVE/RETIRED status;
- required placeholder validation;
- controlled template upload;
- old document remains bound to historical template version;
- no arbitrary template modification by ordinary operators.

## Access
- KAMTIB: generate/review/download Surat Izin Keluar sesuai status;
- SUBBAG_TU: administer/register/generate/download Surat Tugas sesuai status;
- approver: approve/issue sesuai kewenangan;
- auditor: read/audit;
- Head Rudenim: oversight/read-only + direction layer.

## Acceptance
- DOCX opens correctly;
- required fields complete;
- template version recorded;
- no unauthorized field leakage;
- generated hash reproducible/verified as designed;
- download audited;
- final document archived;
- old versions remain retrievable.

---

# D6 — Workflow, Approval & Leadership Direction

## Modules
- task inbox;
- approval workflow;
- review/reject/revise;
- signature/authorization metadata;
- document issue;
- distribution;
- archive;
- leadership `PETUNJUK`;
- `ARAHAN`;
- `REKOMENDASI`;
- `DISPOSISI`;
- acknowledgement;
- action;
- response;
- closure;
- audit events.

## Recommendation Loop

`Unit → Recommendation → Target → Acknowledgement → Action → Response → Closure`

## Leadership Loop

`Data/Timeline → Petunjuk/Arahan/Rekomendasi/Disposisi → Target → Follow-up → Monitoring`

---

# D7 — Intelligent Intake

## Tujuan
Mengurangi input manual tanpa mengorbankan validitas dan keamanan.

## Modules
- OCR;
- official message intake;
- transcript extraction;
- structured draft;
- confidence score;
- validation queue;
- human verification;
- source/provenance linkage;
- quarantine/raw vault.

## Rule
Tidak ada direct path dari OCR/WhatsApp/transcript ke approved operational record.

Gunakan kanal pesan resmi yang sah; jangan menggunakan scraping WhatsApp Web sebagai mekanisme produksi.

---

# D8 — Reporting & Operational Intelligence

## Modules
- executive dashboard;
- RAP dashboard;
- PERKES restricted dashboard;
- KAMTIB dashboard;
- TU document dashboard;
- Head Rudenim dashboard;
- KPI;
- daily/periodic briefing;
- document turnaround analysis;
- completeness analysis;
- exception/anomaly suggestions;
- trend analysis;
- operational reports;
- recommendation/disposition follow-up report.

## Rule
Analytics membantu keputusan; tidak menggantikan kewenangan pejabat.

---

# D9 — Pilot, Security Hardening & UAT

## Pilot
- controlled environment;
- synthetic test before sensitive pilot;
- limited operational scope;
- SOP alignment;
- user training.

## Tests
- unit;
- integration;
- E2E;
- authorization regression;
- security regression;
- performance/load;
- backup/restore drill;
- audit integrity;
- document rendering/DOCX regression;
- accessibility/usability where appropriate.

## UAT Actors
- RAP;
- PERKES;
- KAMTIB;
- SUBBAG_TU;
- PEJABAT_APPROVER;
- HEAD_RUDENIM;
- AUDITOR.

## Gate D9
UAT PASS + security PASS + backup/restore evidence + SOP readiness + documented known limitations.

---

# D10 — Production & Institutionalization

## Production
- authorized infrastructure;
- secure deployment;
- migration only after approved schema/data contract;
- monitoring;
- backup;
- incident response;
- access review.

## Institutionalization
- SOP/pedoman;
- role matrix;
- data dictionary;
- document template governance;
- training;
- KPI review;
- periodic audit;
- access recertification;
- continuous improvement;
- change-control board/process.

## Final Outcome
MTA DETENI menjadi mekanisme kerja yang melekat pada organisasi; MTA DETENI Digital menjadi instrumen yang menjaga konsistensi, kecepatan, traceability, dan evidence.

---

# Cross-Phase Workstreams

## A. Governance
Selalu berjalan D0–D10: legal/SOP alignment, authority review, privacy, change control.

## B. Security
Selalu berjalan D2–D10: threat model, secure coding, authorization testing, audit, backup, incident readiness.

## C. Document Governance
Dimulai D1 dan berjalan sampai D10: template owner, version, effective date, approval, archive, retention, integrity.

## D. KPI / PKP Evidence
Baseline D0 → target D1 → pilot D9 → before/after measurement D10.

## E. Data Quality
Completeness → validation → verification → correction/versioning → monitoring.

---

# Dependency Order

```text
D0 Governance
   ↓
D1 Process + Data + Authority + Document Contract
   ↓
D2 Architecture + Security
   ↓
D3 Core Data
   ↓
D4 Movement + Temporary Exit
   ↓
D5 Document Engine
   ↓
D6 Approval + Leadership
   ↓
D7 Intelligent Intake
   ↓
D8 Reporting/Intelligence
   ↓
D9 Pilot/UAT/Hardening
   ↓
D10 Production/Institutionalization
```

**Catatan:** D5 harus diperlakukan sebagai prioritas MVP dan dapat dikerjakan paralel secara terkontrol setelah contract D1/D2 tersedia. Jangan menunggu seluruh roadmap selesai untuk membuktikan output Word.

---

# Hard Gates

Tidak boleh advance hanya karena kode sudah selesai.

Setiap gate membutuhkan evidence:
- governance approval;
- process acceptance;
- data contract;
- authority/security acceptance;
- document contract/template acceptance;
- tests;
- audit evidence;
- UAT evidence;
- backup/restore evidence bila relevan.

## Non-Negotiable Rules

1. Tidak ada real detainee data di GitHub.
2. Tidak ada secret/credential di repository.
3. Tidak ada direct WhatsApp/OCR/transcript → production record.
4. Tidak ada autonomous AI decision-making.
5. Tidak ada bypass authorization.
6. Tidak ada silent overwrite terhadap critical records.
7. Tidak ada migration sebelum model dan controls disetujui.
8. Kepala Rudenim bukan `super-admin`; visibility dan leadership direction dipisahkan dari operational editing.
9. KAMTIB tidak mengambil alih administrasi Surat Tugas milik TU.
10. TU tidak mengambil alih keputusan substantif izin/pengawalan.
11. Template resmi harus versioned dan historical documents tetap terikat pada versi yang digunakan.
12. Dokumen Word untuk Surat Izin Keluar Sementara dan Surat Tugas Pengawalan adalah output inti MVP.
