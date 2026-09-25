# MTA DETENI — Master Blueprint v1.1

## 1. Identitas, Positioning, dan Tujuan Inovasi

**MTA DETENI — Manajemen Terpadu Administrasi Deteni** adalah model tata kelola administrasi deteni yang mengintegrasikan standardisasi data, proses lintas-seksi, pengendalian dokumen, penelusuran kronologis, kewenangan, dan akuntabilitas.

**MTA DETENI Digital** adalah instrumen pendukung digital (enabler), bukan substansi inovasi. Untuk konteks PKP, perubahan yang ditonjolkan adalah perubahan tata kelola, mekanisme kerja, SOP, kontrol, dan hasil organisasi; sistem digital digunakan untuk memperkuat dan menjaga perubahan tersebut.

### Tujuan strategis
1. Mewujudkan satu sumber data administratif deteni yang tervalidasi.
2. Mengintegrasikan RAP, PERKES, KAMTIB, Subbagian Tata Usaha, dan pimpinan sesuai kewenangan masing-masing.
3. Menjamin setiap perubahan/status/peristiwa penting mempunyai riwayat kronologis dan provenance.
4. Mempercepat dan menstandarkan pembuatan dokumen administratif.
5. Menjadikan **Surat Izin Keluar Sementara** dan **Surat Tugas Pengawalan** sebagai output inti yang dapat dibuat dalam **Word (.docx)** menggunakan template resmi/terkendali.
6. Memperkuat approval, audit trail, register, distribusi, dan arsip dokumen.
7. Menyediakan dashboard, laporan, alert, dan rekomendasi operasional yang dapat ditindaklanjuti.
8. Menyiapkan fondasi intake OCR, pesan resmi, transcript extraction, dan AI-assisted administration secara aman dan human-in-the-loop.

---

## 2. Prinsip Dasar

- **Governance first** — proses dan kewenangan ditetapkan sebelum fitur.
- **Purpose limitation** — data hanya digunakan untuk tujuan dan kewenangan yang sah.
- **Data minimization** — hanya data yang diperlukan diproses/ditampilkan.
- **Least privilege** — akses minimum sesuai fungsi.
- **Deny by default** — tidak ada akses hanya karena seseorang memiliki jabatan tinggi.
- **Separation of duties** — input, verifikasi, administrasi surat, pelaksanaan, dan approval dipisahkan sesuai mandat.
- **Field/domain-level authorization** — hak akses dapat berbeda sampai tingkat field/domain.
- **Provenance** — sumber, aktor, waktu, metode, confidence, dan verification status dicatat.
- **Immutable history** — kejadian penting dicatat sebagai event/version, bukan menimpa sejarah.
- **Human accountability** — manusia tetap bertanggung jawab atas keputusan administratif.
- **Restricted-data isolation** — data kesehatan dan data pribadi berisiko tinggi dipisahkan dari tampilan operasional umum.
- **Template governance** — template dokumen resmi memiliki owner, versi, tanggal berlaku, status, dan jejak penggunaan.
- **No silent overwrite** — koreksi menghasilkan versi/event yang dapat diaudit.
- **No real sensitive data in repository** — GitHub hanya berisi dokumentasi, kode, dan synthetic fixtures.

---

## 3. Aktor, Peran, dan Batas Kewenangan

### 3.1 Seksi RAP — Registrasi, Administrasi dan Pelaporan

Fungsi utama:
- registrasi/input data awal deteni;
- upload dan pengelolaan dokumen administratif;
- melihat data deteni sesuai kewenangan;
- mengajukan proses deportasi sesuai mandat;
- mengajukan permohonan izin keluar sementara sesuai alur;
- menerima/mengelola notifikasi administratif;
- penatausahaan barang/kepemilikan deteni;
- checklist kelengkapan administrasi;
- verifikasi status data administratif;
- permintaan pembaruan data administratif;
- laporan dan rekomendasi administratif.

Tidak berwenang mengubah data kesehatan, placement operasional, audit trail, atau keputusan final di luar mandat.

### 3.2 Seksi PERKES — Perawatan dan Kesehatan

Fungsi utama:
- input pemeriksaan awal;
- data dan riwayat kesehatan;
- jadwal pemeriksaan dan notifikasi;
- tindak lanjut/referral sesuai kewenangan;
- rekomendasi medis/administratif terkait kesehatan;
- kebutuhan makanan dan barang yang terkait kondisi/kebutuhan deteni.

Data kesehatan adalah **restricted domain**. Unit lain hanya menerima informasi minimum yang diperlukan untuk menjalankan tugas.

### 3.3 Seksi KAMTIB — Keamanan dan Ketertiban

Fungsi utama:
- melihat data operasional yang diperlukan;
- pengelolaan penempatan blok/ruang/bed;
- movement ledger dan mutasi;
- headcount;
- kontrol keamanan/ketertiban dan incident record;
- proses izin keluar sementara;
- pelaksanaan/pengelolaan pengawalan;
- generate barcode/QR individual sesuai kebijakan;
- generate daftar deteni per blok/ruang untuk kebutuhan operasional yang sah;
- menerima notifikasi operasional;
- membuat/menghasilkan **Surat Izin Keluar Sementara** dalam Word setelah data dan workflow memenuhi syarat;
- memberikan rekomendasi operasional.

**KAMTIB tidak mengambil alih penatausahaan surat tugas yang menjadi kewenangan TU.**

### 3.4 Subbagian Tata Usaha — SUBBAG_TU

Fungsi utama:
- menerima/menangani administrasi Surat Tugas pengawalan petugas Rudenim;
- memeriksa kelengkapan administrasi;
- menyiapkan/menatausahakan Surat Tugas;
- penomoran/register sesuai ketentuan yang berlaku;
- menggunakan template resmi dan versi yang berlaku;
- generate/download **Surat Tugas Pengawalan dalam Word (.docx)**;
- mengelola alur tanda tangan/otorisasi administratif;
- distribusi dokumen;
- upload final copy dan pengarsipan;
- pencarian riwayat dokumen;
- notifikasi dan rekomendasi administratif.

TU tidak berwenang menyetujui substansi izin keluar, mengubah data kesehatan, mengubah placement, atau menentukan hasil pelaksanaan pengawalan.

### 3.5 Kepala Rudenim — HEAD_RUDENIM

Kepala Rudenim memiliki **overall visibility** sesuai kewenangan, termasuk timeline deteni dan status proses, tetapi **read-only terhadap operational records**.

Kewenangan kepemimpinan:
- melihat keseluruhan dashboard/data/timeline yang sah;
- melihat status dokumen dan proses lintas-seksi;
- melihat audit trail sesuai otorisasi;
- memberikan **PETUNJUK, ARAHAN, REKOMENDASI, dan DISPOSISI**;
- memonitor tindak lanjut dan penyelesaian.

Jabatan tertinggi tidak otomatis berarti hak edit tertinggi. Fungsi oversight dipisahkan dari fungsi operasional.

### 3.6 Peran pendukung

- `KAMTIB_OPERATOR` — operasi harian.
- `KAMTIB_ADMIN` — administrasi KAMTIB dengan hak edit yang lebih tinggi dalam domainnya.
- `PEJABAT_APPROVER` — approval sesuai kewenangan formal.
- `AUDITOR` — read-only/audit sesuai scope.
- `SYSTEM_ADMIN` — administrasi teknis; tidak otomatis memperoleh akses substantif ke data sensitif.

---

## 4. Model Kewenangan

Authorization dipisahkan menjadi:

1. **Visibility** — boleh melihat apa.
2. **Create** — boleh membuat record.
3. **Edit** — boleh mengubah field/domain tertentu.
4. **Verify** — boleh memverifikasi.
5. **Approve** — boleh menyetujui.
6. **Issue** — boleh menerbitkan dokumen.
7. **Download/Export** — boleh mengunduh/mengekspor.
8. **Distribute** — boleh mendistribusikan.
9. **Archive** — boleh mengarsipkan.
10. **Technical administration** — konfigurasi teknis.

RBAC menjadi baseline, sedangkan ABAC/context dapat mempertimbangkan unit, domain, status workflow, ownership, purpose, dan kondisi khusus.

---

## 5. Domain Fungsional Utama

1. Master Data Deteni
2. Dokumen Deteni
3. Status dan riwayat
4. Blok/Ruang/Bed
5. Movement Ledger
6. Headcount
7. KAMTIB
8. RAP
9. PERKES
10. Izin Keluar Sementara
11. Pengawalan
12. Surat Tugas Pengawalan
13. Document Engine
14. Template Management
15. Approval Workflow
16. Barcode/QR
17. Detainee Timeline
18. Leadership Direction Layer
19. Notification/Alert
20. Dashboard/Reporting
21. Intake/OCR/Transcript
22. Audit Trail
23. RBAC/ABAC
24. Data Governance/Security
25. Document Register/Distribution/Archive

---

## 6. Alur Tata Kelola Inti

```text
DATA → PROSES → VERIFIKASI → DOKUMEN/KEPUTUSAN → PELAKSANAAN
  ↓         ↓          ↓               ↓              ↓
PROVENANCE  WORKFLOW   APPROVAL       REGISTER       EVENT
  └──────────────────────────────→ TIMELINE → AUDIT

UNIT → REKOMENDASI → TARGET → ACKNOWLEDGEMENT → ACTION → RESPONSE → CLOSURE

KEPALA RUDENIM:
DATA/TIMELINE → PETUNJUK/ARAHAN/REKOMENDASI/DISPOSISI → FOLLOW-UP → MONITORING
```

---

## 7. Workflow Izin Keluar Sementara dan Surat Tugas — CORE OUTPUT

### 7.1 Rantai proses

```text
Kebutuhan keluar sementara
        ↓
Permohonan / usulan
        ↓
Validasi kelengkapan & kewenangan
        ↓
Persetujuan sesuai mandat
        ↓
Surat Izin Keluar Sementara (.DOCX)
        ↓
Penugasan/pengawalan
        ↓
Administrasi Surat Tugas oleh SUBBAG_TU
        ↓
Surat Tugas Pengawalan (.DOCX)
        ↓
Pelaksanaan
        ↓
Kembali ke Rudenim
        ↓
Hasil/kejadian dicatat
        ↓
Timeline + Audit + Arsip
```

### 7.2 Kategori tujuan izin yang configurable

Minimal:
1. pemeriksaan kesehatan;
2. rawat jalan;
3. rawat inap/perawatan rumah sakit;
4. keperluan instansi/administratif/hukum yang sah;
5. repatriasi/deportasi sesuai proses;
6. kategori lain yang disahkan dan dapat dikonfigurasi.

Kategori bukan hard-coded sehingga dapat disesuaikan tanpa merombak arsitektur.

### 7.3 Aturan inti

- Surat tidak dapat diterbitkan jika field wajib belum terpenuhi.
- Dokumen final harus terkait dengan record izin dan deteni yang benar.
- Surat Tugas harus terkait dengan izin keluar/pengawalan yang relevan.
- KAMTIB mengelola substansi operasional izin/pengawalan.
- TU mengelola administrasi Surat Tugas.
- Approval hanya oleh aktor berwenang.
- Download final dicatat sebagai audit event.
- Dokumen final menyimpan `document_id`, template version, timestamp, dan integrity hash.

---

## 8. Document Engine dan Template Governance

Document Engine adalah komponen prioritas tinggi, bukan fitur tambahan.

### 8.1 Dokumen wajib MVP

1. **Surat Izin Keluar Sementara — DOCX**
2. **Surat Tugas Pengawalan — DOCX**

Output PDF dapat ditambahkan kemudian; **Word (.docx) tetap mandatory core output**.

### 8.2 Template registry

```text
Document Template
 ├─ Template ID
 ├─ Document Type
 ├─ Version
 ├─ Effective Date
 ├─ Status (DRAFT/ACTIVE/RETIRED)
 ├─ Template File
 ├─ Required Fields
 ├─ Placeholder Schema
 ├─ Owner/Authority
 └─ Metadata
```

Dokumen yang sudah diterbitkan selalu terikat pada versi template yang digunakan. Pergantian template tidak mengubah dokumen lama.

### 8.3 Field mapping

Template harus memiliki contract yang memetakan placeholder ke data sumber, misalnya:
- nomor surat;
- identitas deteni yang diizinkan;
- kewarganegaraan;
- tujuan;
- maksud/keperluan;
- tanggal dan waktu keluar/kembali;
- dasar/rujukan;
- petugas pengawal;
- pejabat berwenang;
- blok/ruang bila memang diperlukan;
- signature block.

Field sensitif tidak boleh otomatis masuk ke template hanya karena tersedia di database.

### 8.4 Lifecycle dokumen

`DRAFT → GENERATED → REVIEWED → APPROVED → ISSUED → DOWNLOADED → DISTRIBUTED → ARCHIVED`

Koreksi/revisi menghasilkan versi/event baru. Tidak boleh silent overwrite.

### 8.5 Integritas dokumen

Setiap generated document minimal memiliki:
- `document_id`;
- document type;
- template/version;
- generated_at;
- generated_by;
- status;
- SHA-256 hash;
- audit references;
- relationship ke deteni dan proses.

---

## 9. Detainee Timeline

Timeline menyatukan event yang relevan tanpa menghapus domain boundary:
- registrasi/intake;
- placement;
- status changes;
- movement;
- izin keluar;
- pengawalan;
- dokumen;
- kejadian KAMTIB;
- rekomendasi;
- petunjuk/arah/disposisi;
- hasil tindak lanjut.

Data kesehatan hanya muncul pada level/detail yang diizinkan oleh policy dan role.

---

## 10. Data Architecture dan Provenance

Entitas kandidat:

`deteni`, `deteni_documents`, `deteni_status_history`, `blocks`, `rooms`, `beds`, `deteni_movements`, `headcounts`, `health_records`, `health_events`, `leave_requests`, `leave_approvals`, `escort_orders`, `escort_members`, `document_templates`, `generated_documents`, `document_registers`, `document_distributions`, `document_events`, `leadership_directives`, `recommendations`, `users`, `roles`, `permissions`, `intake_messages`, `extraction_results`, `ocr_documents`, `audit_logs`, `system_events`.

**Ini masih logical model. Tidak boleh dianggap sebagai perintah migration sebelum D1/D2 selesai.**

Provenance minimum:
- source;
- source reference;
- actor;
- created_at/observed_at;
- ingestion method (`MANUAL`, `OCR`, `OFFICIAL_MESSAGE`, `IMPORT`, dll.);
- confidence bila hasil extraction;
- verification status;
- verification actor/time.

---

## 11. Controlled Intake: OCR, Pesan Resmi, Transcript

```text
Official Source
   ↓
Raw/Intake Vault
   ↓
OCR/Parsing/Transcript Extraction
   ↓
Structured Draft
   ↓
Confidence + Validation
   ↓
Human Verification
   ↓
Approved Operational Record
```

Tidak boleh:
- direct WhatsApp/OCR/transcript → production record;
- scraping WhatsApp Web sebagai jalur resmi;
- memasukkan data sensitif ke layanan AI eksternal tanpa otorisasi formal.

Jika integrasi pesan digunakan, gunakan **official WhatsApp Business Platform/Cloud API** atau kanal resmi lain yang disahkan.

---

## 12. AI Policy

AI bersifat assistive dan salah satu use case resmi yang dikunci adalah **AI Document Template Intelligence & Replication**.

AI dapat digunakan untuk:
- menganalisis dokumen contoh yang diunggah;
- mengenali struktur, field, tabel, gambar, layout, typography, header/footer, caption, dan aturan pagination;
- mengusulkan placeholder dan mapping ke data MTA DETENI;
- mengusulkan image/photo slots dan mapping ke input aktual;
- membantu membuat draft template blueprint;
- membantu validasi kesesuaian data/template;
- extraction;
- classification;
- summarization;
- anomaly/exception suggestion;
- draft recommendation.

Untuk dokumen contoh yang telah disetujui, **desain, struktur, layout, tabel, gambar, dan elemen visual menjadi template contract**. Data aktual, tanggal, angka, identitas, foto, dan informasi aktual dapat berubah sesuai input terbaru tanpa mengubah identitas template yang digunakan.

AI tidak boleh menjadi pengambil keputusan administratif final, mengubah record substantif secara langsung, menerbitkan dokumen final tanpa workflow, atau mengaktifkan/mengubah template ACTIVE tanpa otorisasi. Setiap output AI yang memengaruhi record atau template harus memiliki provenance, confidence bila relevan, verification status, actor/time, dan human verification/approval sesuai policy.

### 12.1 Canonical AI document flow

```text
Reference Document (.docx/.pdf/supported format)
        ↓
AI Document Analysis
        ↓
Template Blueprint + Field/Data/Image Mapping
        ↓
Human Review / Correction
        ↓
Template Approval
        ↓
Template Registry (versioned)
        ↓
MTA DETENI Actual Data + Actual Images
        ↓
Deterministic Document Engine
        ↓
DOCX / PDF Output
        ↓
Validation → Approval → Issue → Register → Audit → Archive
```

### 12.2 Fidelity requirement

Target output is not merely semantic equivalence. The generator must preserve the approved reference template's **document identity and visual structure** as far as the selected output format/engine permits: page composition, typography, tables, borders, images, image sizing/cropping rules, captions, headers/footers, spacing, alignment, numbering, and multi-page behavior. Where exact pixel fidelity is technically impossible in a given format, the deviation must be detected/flagged and remain subject to human review.

### 12.3 Core example — Laporan Harian

An uploaded approved Laporan Harian example becomes a reusable template. Subsequent reports replace only the governed variable content: date, shift/group, operational figures, narrative entries, tables, actual photos, captions, and other approved fields. The output must retain the example's approved design and structure rather than generating a new visual design from scratch.

### 12.4 Separation of responsibilities

- **AI:** understand, extract, map, propose, validate.
- **Template Registry:** govern versions, ownership, status, effective date, approval and provenance.
- **Document Engine:** render deterministically and preserve template structure.
- **Workflow/Approval:** authorize review, issue and distribution.
- **Audit:** record source template, version, actor, time, input references, output identity and integrity hash.

---

## 13. Security Architecture

Minimum security baseline:
- secure authentication/session;
- RBAC + ABAC;
- PostgreSQL RLS bila relevan;
- deny-by-default;
- restricted health-data boundary;
- encryption in transit/at rest;
- CSRF protection;
- CORS policy;
- rate limiting;
- secure headers;
- input/schema validation;
- audit integrity/tamper evidence;
- backup/restore;
- disaster recovery plan;
- secret scanning;
- dependency scanning;
- SAST/DAST/security regression;
- periodic access review;
- break-glass access dengan alasan, batas waktu, dan audit.

System administrator tidak otomatis boleh membaca seluruh data substantif.

---

## 14. Architecture Target

### Application
- Next.js App Router + TypeScript
- React Hook Form
- TanStack Query/Table bila diperlukan
- Zod/Valibot

### Data
- PostgreSQL
- Drizzle ORM
- FTS/`pg_trgm` untuk pencarian awal

### Document
- server-side DOCX generation (`docx` atau controlled template engine yang dipilih setelah evaluasi)
- private object storage/S3-compatible storage
- SHA-256 integrity metadata

### Async/Integration
- Node.js worker/service
- pg-boss atau BullMQ + Redis sesuai kebutuhan
- official message API bila disahkan
- OCR engine private/on-prem bila diperlukan

### Identification
- barcode/QR generator seperti `bwip-js`/library setara

### Identity/Observability
- OIDC-compatible identity provider atau secure auth
- OpenTelemetry-compatible observability

---

## 15. UI / Screen Blueprint

### KAMTIB Dashboard
- active detainees;
- block/room occupancy;
- movement today;
- temporary exits today;
- escorts today;
- pending documents;
- alerts;
- document generation/download.

### RAP Dashboard
- new detainees;
- incomplete documents;
- verification queue;
- administrative requests;
- notifications;
- reports.

### PERKES Dashboard
- restricted health queue;
- examination schedule;
- follow-up/referral;
- health-related needs;
- notifications.

### TU Dashboard
- Surat Tugas queue;
- completeness check;
- numbering/register;
- template/version;
- signature/approval status;
- DOCX generate/download;
- distribution;
- archive.

### Head Rudenim Dashboard
- cross-section KPI;
- full authorized timeline;
- pending follow-ups;
- recommendations;
- petunjuk/arah/disposisi;
- document/process status;
- audit visibility.

---

## 16. KPI dan Outcome PKP

Baseline dan target harus ditentukan dari kondisi nyata.

Indikator minimum:
- waktu registrasi;
- kelengkapan data;
- waktu penyelesaian izin keluar;
- waktu pembuatan Surat Izin Keluar;
- waktu administrasi Surat Tugas;
- jumlah koreksi dokumen;
- kepatuhan SOP;
- keterlacakan event;
- kualitas/ketepatan laporan;
- jumlah dokumen hilang/tidak terarsip;
- waktu pencarian dokumen;
- completion rate tindak lanjut rekomendasi/disposisi.

Outcome PKP menekankan **perubahan organisasi yang terukur**, bukan sekadar jumlah fitur digital.

---

## 17. Delivery Architecture / Gate

Urutan wajib:

**Governance → Process → Data Contract → Authority → Security → Document Contract → Architecture → Implementation → Test → Audit → Pilot → Release → Institutionalization**

Tidak boleh melakukan large implementation atau database migration sebelum:
- authority matrix tervalidasi;
- AS-IS/TO-BE disetujui;
- data dictionary/classification selesai;
- document contract/template specification selesai;
- security baseline dan threat model selesai;
- acceptance criteria disetujui.

---

## 18. Repository Boundary

Repository `galleryabah-source/MTA-Deteni` hanya untuk MTA DETENI.

Repository **IIRE** tetap terpisah dan tidak menjadi dependency atau tempat penyimpanan dokumen MTA DETENI.

Dilarang commit:
- PII nyata;
- data kesehatan;
- biometrik;
- data perkara/operasional rahasia;
- export WhatsApp;
- credential/secret;
- dokumen resmi yang belum disanitasi.

Gunakan synthetic fixtures dan contoh template non-rahasia.

---

## 19. Roadmap Ringkas

- **D0:** Governance & Discovery
- **D1:** Process & Data Foundation
- **D2:** Architecture & Security Foundation
- **D3:** Core Administration
- **D4:** Movement, Identification & Temporary Exit
- **D5:** Document Engine + AI Template Intelligence foundation
- **D6:** Workflow & Approval + Human Template Approval
- **D7:** Intelligent Intake + AI Document Analysis/Mapping
- **D8:** Reporting & Operational Intelligence + Automated Report Generation
- **D9:** Pilot & Hardening
- **D10:** Production & Institutionalization

Document Engine diprioritaskan tinggi karena output Word dan laporan operasional merupakan kebutuhan operasional sekaligus bukti perubahan yang mudah diukur.

### 8.6 AI Document Template Intelligence & Replication — LOCKED CONCEPT

MTA DETENI menetapkan **AI Document Template Intelligence & Replication** sebagai salah satu use case resmi AI. Cakupannya tidak terbatas pada Surat Perintah atau Surat Tugas, tetapi mencakup seluruh dokumen operasional yang memiliki contoh/template yang dapat diunggah ke aplikasi, termasuk **Laporan Harian** dengan teks, tabel, gambar/foto, desain, layout, header/footer, caption, dan elemen visual lainnya.

Prinsipnya adalah **reference document → template understanding → human approval → template registry → deterministic document generation**. AI menganalisis contoh dokumen untuk mengidentifikasi struktur, field, data mapping, layout, gambar/image slots, typography, tabel, pagination rules, dan elemen visual. Hasil analisis menjadi proposed template dan wajib melalui review/approval sebelum ACTIVE.

Pada saat generasi, data dan gambar aktual diganti berdasarkan input terbaru yang sah, sementara struktur dan desain template dipertahankan. AI tidak boleh mendesain ulang secara bebas setiap kali dokumen dibuat. Rendering final dilakukan oleh Document Engine secara deterministik berdasarkan template/version yang telah disetujui.

Use case minimum meliputi: Surat Perintah, Surat Tugas Pengawalan, Surat Izin Keluar Sementara, Laporan Harian, laporan berkala, berita acara, dan dokumen operasional lain yang disahkan. Dokumen final wajib terikat pada template version, provenance, lifecycle, audit trail, dan integrity hash. AI tetap assistive dan tidak menjadi pengambil keputusan administratif final.

---

## 20. Definition of Done Tingkat Sistem

MTA DETENI belum dianggap selesai hanya karena aplikasi dapat dibuka. Sistem harus memiliki:
1. proses dan kewenangan tervalidasi;
2. data contract dan classification;
3. field/domain authorization;
4. workflow state machine;
5. dua template dokumen inti;
6. DOCX generation yang benar;
7. approval dan separation of duties;
8. audit trail yang dapat diverifikasi;
9. dashboard dan laporan;
10. security regression;
11. backup/restore evidence;
12. UAT;
13. SOP dan training;
14. KPI sebelum/sesudah;
15. pilot evidence;
16. rencana institutionalization.

**Status baseline:** blueprint adalah living document. Setiap perubahan besar terhadap proses, kewenangan, data, dokumen, atau security harus memperbarui blueprint dan roadmap terlebih dahulu.

## 21. Locked Desktop UI Blueprint — Approved 25 September 2026

The approved desktop/web visual design is now part of the MTA DETENI blueprint and is a **design freeze**.

### 21.1 Visual baseline

The approved direction is a light modern enterprise/government interface combining Modern Professional, Light Modern Minimal, and Hero + Cards characteristics.

### 21.2 Fixed desktop composition

```text
┌──────────────────────────────────────────────────────────────────────┐
│ MTA DETENI │ Global Search │ System Status │ Notification │ Profile │
├────────────┼─────────────────────────────────────────────────────────┤
│            │ HERO — MTA DETENI / RUDENIM                            │
│ UTAMA      │ KPI: Total | Dalam Detensi | Izin | Deportasi          │
│ Dashboard  │ Quick Actions: Data | Placement | Movement | Docs | QR │
│            │ Status Deteni        │ Tren Jumlah Deteni              │
│ DATA &     │ Aktivitas Terbaru    │ Deteni Terbaru                  │
│ PENEMPATAN │                                                         │
│ OPERASIONAL│                                                         │
│ MONITORING │                                                         │
│ QR &       │                                                         │
│ PEMINDAIAN │                                                         │
│ REKAM &    │                                                         │
│ KEPATUHAN  │                                                         │
│ FASILITAS  │                                                         │
│ PENGATURAN │                                                         │
└────────────┴─────────────────────────────────────────────────────────┘
```

### 21.3 Locked sidebar information architecture

- **UTAMA:** Dashboard
- **DATA & PENEMPATAN:** Data Deteni, Penempatan
- **OPERASIONAL:** Pergerakan, Izin
- **MONITORING:** Operational Monitor, Operational Queue
- **QR & PEMINDAIAN:** QR Center, Scan Center, Leave QR, Camera Scan
- **REKAM & KEPATUHAN:** Dokumen, Audit Trail, Laporan
- **FASILITAS:** Room Ops
- **PENGATURAN:** Pengaturan

Sidebar requirements:
- exactly one icon per menu item;
- consistent icon family, size, stroke/fill treatment and alignment;
- no duplicate icon caused by nested wrappers, pseudo-elements, or text glyphs;
- no emoji icons;
- active item uses blue selected state;
- section labels use compact uppercase muted typography;
- normal desktop dashboard must not expose an unnecessary sidebar scrollbar.

### 21.4 Locked dashboard components

1. Hero banner with Rudenim/building visual.
2. Four KPI cards.
3. Six quick-action cards.
4. Status Deteni visualization.
5. Tren Jumlah Deteni visualization.
6. Aktivitas Terbaru.
7. Daftar Deteni Terbaru.

### 21.5 Non-negotiable system boundary

This UI decision changes presentation only. It does not authorize changes to database schema, migrations, RBAC, authentication, QR resolution, operational mutations, audit/evidence chain, or document workflow.

### 21.6 Change control

The visual direction is frozen. Future UI work may improve implementation fidelity, accessibility, responsive desktop breakpoints, icon correctness, spacing, performance, and functional integration. A new visual direction requires an explicit superseding design decision.

See: docs/18-desktop-ui-design-system-v1.0-LOCKED.md and docs/03-implementation/UI-DESIGN-DECISION-2026-09-25.md.


## 22. Current UI Implementation Review — 25 September 2026

The current implementation baseline and audit findings are recorded in `docs/19-current-ui-review-audit-2026-09-25.md`. This document is the current implementation reference for the locked desktop UI, Data Deteni table contract, QR actions, Admin Settings layout, and known persistence verification items. It does not supersede the locked design decision in Section 21.


## 23. System / Engine / Functional Audit Handoff — 25 September 2026

The approved desktop UI is now frozen as the visual baseline. The next workstream is system correctness rather than visual redesign. Source audit baseline is recorded in `docs/20-system-engine-functional-audit-2026-09-25.md`.

Priority findings currently requiring remediation are: multiple direct localStorage mutation writers, duplicate Detainee CRUD ownership, multiple `window.show` wrappers, browser-side AI API-key persistence, a stale source-string assertion in the Final Integrity Gate, and contract tests that do not always exercise the real UI mutation path.

The required direction is consolidation: one authoritative persistence boundary, one Detainee CRUD owner, one navigation dispatcher, server-side secret handling for production AI, behavior-based integrity assertions, and browser/runtime verification for every critical journey.

The UI freeze remains active. No redesign is authorized during this audit unless required to correct functional behavior, accessibility, responsive correctness, icon correctness, or system integration.


## 24. System Consolidation Remediation — 25 September 2026

The first system/engine audit remediation pass is implemented. A unified State Kernel now owns synthetic operational persistence/read-back verification and canonical audit event creation. Detainee CRUD ownership has been returned to the core runtime; Master Room Guard is a validation/occupancy guard rather than a second CRUD owner. Movement, Room Ops, Preview V5 and Preview V6 no longer override `window.show`; their views are exposed to the Unified Shell dispatcher. Browser-side AI API-key persistence has been removed, and the Final Integrity Gate now uses a behavior-based persistence contract instead of a brittle source-string assertion.

This is an implementation milestone, not final certification. Deployment and browser journey verification remain mandatory before PASS can be declared.


## 26. Locked Mobile Field Evidence Intake & Daily Report Supply — 25 September 2026

MTA DETENI menetapkan **Mobile Field Evidence Intake → Daily Report Assembly** sebagai bagian inti dari rancangan operasional dan AI Document Automation. Fitur ini harus segera diimplementasikan sebagai pemasok data aktual untuk Laporan Harian dan dokumen operasional lain yang membutuhkan evidence lapangan.

### 26.1 Prinsip

Petugas lapangan tidak dituntut menyusun laporan lengkap dari smartphone. Petugas melakukan capture sesingkat mungkin:

```
FOTO → CATAT → VOICE (opsional) → SIMPAN/SYNC
```

MTA DETENI mengubah capture tersebut menjadi evidence terstruktur, menggabungkannya ke Daily Dataset, melakukan validasi/AI assistance bila tersedia, lalu mengisi template laporan yang telah disetujui.

### 26.2 Mobile Field Capture

Mobile UI harus dirancang sebagai **field capture interface**, bukan sekadar desktop UI yang diperkecil.

Minimum capture:

- foto langsung dari kamera;
- catatan singkat;
- quick category/event type;
- waktu capture;
- actor/petugas;
- lokasi/ruang bila tersedia dan diizinkan;
- voice note/transcription assistance bila diaktifkan;
- attachment/evidence lain yang disahkan;
- status sinkronisasi.

Input harus meminimalkan typing dan menyediakan quick selection.

### 26.3 Evidence Model

Setiap capture menjadi evidence item yang memiliki konteks:

```
Evidence
 ├─ event/type
 ├─ actor
 ├─ captured_at
 ├─ location/context bila diizinkan
 ├─ raw note
 ├─ photo(s)
 ├─ voice/source bila ada
 ├─ provenance
 ├─ verification status
 └─ sync status
```

Foto adalah **first-class evidence**, bukan attachment tanpa konteks.

### 26.4 Offline-First

Field capture harus tetap dapat dilakukan ketika jaringan tidak tersedia.

```
SMARTPHONE
   ↓
LOCAL OUTBOX
   ↓
NETWORK AVAILABLE?
   ├─ NO  → retain safely
   └─ YES → SYNC API → SERVER → ACK
```

Sinkronisasi harus idempotent, dapat dilanjutkan setelah reconnect, dan tidak boleh membuat duplicate core transaction.

### 26.5 Daily Dataset

Evidence dikumpulkan menjadi dataset laporan harian:

```
Field Evidence
      ↓
Validation
      ↓
Daily Dataset
      ↓
AI Assistance (optional)
      ↓
Human Verification
      ↓
Approved Dataset
      ↓
Approved Daily Report Template
      ↓
Document Engine
      ↓
DOCX / PDF
```

AI dapat membantu pengelompokan kegiatan, normalisasi catatan, draft caption, identifikasi evidence terkait, dan mendeteksi data yang belum lengkap. Raw evidence tetap dipertahankan dan AI tidak menjadi sumber kebenaran tunggal.

### 26.6 Photo-to-Report Contract

Saat capture, petugas dapat menandai foto untuk laporan dan/atau mengaitkannya dengan event. Foto dapat memiliki:

- report inclusion flag;
- event reference;
- image slot candidate;
- caption draft;
- sequence/order;
- source reference;
- verification status.

Dengan demikian petugas tidak perlu mencari ulang foto dari galeri ketika laporan dibuat.

### 26.7 Daily Report Inbox

Mobile interface menyediakan ringkasan hari berjalan:

- jumlah evidence;
- jumlah foto;
- jumlah event;
- jumlah data;
- unsynced items;
- incomplete items;
- timeline kegiatan;
- action **Tambah Capture**;
- action **Sinkronkan**;
- action **Preview Laporan** bila role/workflow mengizinkan.

### 26.8 Separation of Concerns

```
FIELD EVIDENCE
      ↓
REPORT DATASET
      ↓
APPROVED TEMPLATE
      ↓
DOCUMENT ENGINE
```

Data aktual tidak mencampuri desain template. Template tidak menjadi tempat penyimpanan evidence mentah. Document Engine tidak mengambil keputusan substantif.

### 26.9 Implementation Priority

This capability is now a **near-term implementation priority** and must be integrated with the existing MTA DETENI runtime rather than built as a disconnected application.

Implementation must preserve:

- existing State Kernel/canonical persistence boundary;
- RBAC/ABAC;
- audit/evidence chain;
- offline/local continuity contracts;
- migration freeze until schema/data contract gates are cleared;
- AI failure isolation;
- synthetic-only controlled testing before production.

## 25. Deep Cohesion Remediation — 25 September 2026

The stabilization work continued beyond the first persistence/navigation consolidation. The application now has one authoritative Detainee CRUD owner in the core runtime, authoritative synthetic Master Room references in the seed, compatibility normalization for older synthetic local states, canonical State Kernel audit creation across operational modules, stronger kernel/system contract checks, and browser acceptance coverage for the real Detainee Add → Edit → Archive journey. UI design remains frozen. Database schema and migrations remain frozen. Final certification is still gated on CI, deployed preview, browser journey, security, evidence, F0–F5, and P13 verification.
