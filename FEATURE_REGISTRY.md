# MTA DETENI — FEATURE REGISTRY

> **Single source of truth untuk seluruh penambahan fitur MTA DETENI.**
>
> Setiap fitur baru WAJIB dicatat di sini. Status hanya boleh menjadi **VERIFIED (☑)** setelah implementasi benar-benar terdeteksi/terverifikasi pada repository dan, bila relevan, runtime/CI. Jangan mencentang fitur hanya karena desain atau percakapan.

## Status

- ☐ **PLANNED** — fitur dicatat, belum dikerjakan.
- ◐ **IN_PROGRESS** — implementasi sedang dikerjakan.
- ☑ **IMPLEMENTED** — implementasi sudah diterapkan di repository dan acceptance criteria utama sudah diwujudkan.
- ☑ **VERIFIED** — implementasi sudah diterapkan dan bukti repository + test/CI + runtime yang relevan tersedia.
- ⚠ **BLOCKED** — implementasi tertahan oleh blocker.
- ↺ **REGRESSION** — sebelumnya verified tetapi verifikasi terakhir menemukan regresi.

## Aturan Pencatatan

1. Setiap permintaan/penambahan fitur baru mendapat **Feature ID** unik: `MTA-F-YYYYMMDD-NNN`.
2. Satu Feature ID = satu perubahan/fitur yang dapat diverifikasi.
3. Setiap entry wajib memuat:
   - tanggal;
   - nama fitur;
   - area/module;
   - status;
   - acceptance criteria;
   - bukti implementasi (file/commit/CI/runtime bila tersedia);
   - catatan regresi jika ada.
4. **Tidak boleh mengubah status menjadi ☑ VERIFIED berdasarkan rencana, desain, atau klaim percakapan saja.**
5. Setelah implementasi selesai, lakukan verifikasi repository → test/CI → runtime bila diperlukan. Jika seluruh bukti memenuhi acceptance criteria, status menjadi ☑.
6. Jika fitur yang sudah ☑ kemudian rusak, ubah menjadi ↺ REGRESSION dan catat bukti.
7. Fitur baru tidak boleh menghapus/mengubah checkpoint P13/P9/F5 tanpa hubungan yang terdokumentasi.
8. Feature Registry ini berjalan berdampingan dengan `PROJECT_STATUS.md`, `CHANGELOG.md`, dan checkpoint phase; registry ini khusus untuk **fitur**.

## Dashboard Ringkas

| Metric | Nilai |
|---|---:|
| Total feature | 22 |
| ☑ VERIFIED | 2 |
| ◐ IN_PROGRESS | 1 |
| ☐ PLANNED | 1 |
| ⚠ BLOCKED | 0 |
| ☑ IMPLEMENTED | 18 |
| ↺ REGRESSION | 0 |
## Feature List

| ID | Tanggal | Fitur | Area | Status | Bukti / Acceptance |
|---|---|---|---|---|---|
| MTA-F-20260926-001 | 2026-09-26 | Feature Registry & Verification Tracking | Governance / Project Control | ☑ VERIFIED | Registry dibuat di repository; aturan pencatatan dan status verifikasi dikunci. |
| MTA-F-20260926-002 | 2026-09-26 | Detail Data Deteni + Histori + QR + Dokumen | Data Deteni / Individual Record | ☑ IMPLEMENTED | Detail individu, histori, QR canonical immutable, dokumen, download Word-compatible, dan cetak terformat. Evidence: web/detainee-detail-v1.js, test/detainee-detail-feature.test.mjs; runtime pending. |
| MTA-F-20260926-003 | 2026-09-26 | Statistik Data Deteni & Ekosistem Kegiatan | Statistics / Reporting | ☑ IMPLEMENTED | Populasi, status, kebangsaan, usia, gender, penempatan, pergerakan, izin, dokumen, tren, indikator, tabel, download, print A4. Evidence: web/detainee-statistics-v1.js, test/detainee-statistics-feature.test.mjs; runtime pending. |
| MTA-F-20260927-004 | 2026-09-27 | Dashboard Room Summary | Dashboard / Placement | ☑ IMPLEMENTED | Total Kamar, Kamar Terisi, Kapasitas dari canonical rooms + placements + detainees; no hard-coded values. Evidence: web/mta-app-runtime-full.js, web/index.html, test/room-summary-dashboard.test.mjs; runtime pending. |
| MTA-F-20260927-005 | 2026-09-27 | Data Deteni CRUD + Ownership/Placement Integrity | Core Administration | ☑ IMPLEMENTED | CRUD dan ownership/placement integrity contracts tersedia. Evidence: 46b3528e; domain/integration regression; synthetic runtime; production DB blocked. |
| MTA-F-20260927-006 | 2026-09-27 | Placement Block / Room / Bed | Placement | ☑ IMPLEMENTED | Manage block/room/bed, cegah double assignment invalid, dan preserve placement events. Evidence: e0228ca4 / 3f87faaa; synthetic runtime; live DB blocked. |
| MTA-F-20260927-007 | 2026-09-27 | Master Room Governance / Occupied Room Guard | Master Kamar | ☑ IMPLEMENTED | Master room management dan occupancy guard dengan room integrity/mobile regression evidence. Evidence: 3f87faaa / 46702d4e. |
| MTA-F-20260927-008 | 2026-09-27 | Movement Operational Actions | Movement | ☑ IMPLEMENTED | Authorized movement actions dengan movement contracts dan F3 evidence. Evidence: 8728e0da / 21c3dc15; browser journey evidence. |
| MTA-F-20260927-009 | 2026-09-27 | Headcount + Movement Consistency | Headcount / Movement | ◐ IN_PROGRESS | Contract dan operational consistency tests ada; evidence masih synthetic-only dan production boundary disabled. Evidence: 22f2828d / bd178a17. |
| MTA-F-20260927-010 | 2026-09-27 | Temporary Exit / Izin Keluar Sementara | Leave | ☑ IMPLEMENTED | Temporary leave/return workflow dengan F3 dan browser/DOM evidence; production execution governed. Evidence: 7206de11 / 8d5fc94d. |
| MTA-F-20260927-011 | 2026-09-27 | Escort / Pengawalan Service | Escort | ☑ IMPLEMENTED | Escort service contract dan operational workflow tersedia; live execution gated. Evidence: 8d9cb968 / 31af8925. |
| MTA-F-20260927-012 | 2026-09-27 | QR Camera Scanner v2 | QR Camera | ☑ IMPLEMENTED | Camera scanner, integration contracts dan device tests tersedia; latest runtime recheck diperlukan. Evidence: 8b52104d / 92c4b284. |
| MTA-F-20260927-013 | 2026-09-27 | QR Resolve → Data → Action | QR / Operational Action | ☑ IMPLEMENTED | Canonical QR resolution menuju resource context dan operational action. Evidence: 42e6ee97 / 4b648320. |
| MTA-F-20260927-014 | 2026-09-27 | QR Print / Download Clean Output | QR Documents | ☑ IMPLEMENTED | QR print/download menghasilkan clean document, bukan application/window content; runtime recheck diperlukan. Evidence: qr-print-clean-v3 lineage. |
| MTA-F-20260927-015 | 2026-09-27 | Daily Guard Report Renderer | Reporting | ☑ IMPLEMENTED | Structured daily guard report renderer, sections, integrity hash, print CSS. Evidence: d3e0fb7c / d957a0d6; browser tests. |
| MTA-F-20260927-016 | 2026-09-27 | Daily Guard Report Lifecycle / Approval | Reporting Workflow | ☑ IMPLEMENTED | DRAFT→VALIDATED→GENERATED→IN_REVIEW→CHANGES_REQUESTED→APPROVED→FINAL; lifecycle/retrieval tests. Storage/PDF boundary gated. |
| MTA-F-20260927-017 | 2026-09-27 | Mobile Field Evidence Intake Adapter | Mobile / Evidence | ☑ IMPLEMENTED | MFE intake adapter dan runtime tests; controlled/synthetic evidence only. Evidence: f4ac23dc. |
| MTA-F-20260927-018 | 2026-09-27 | MFE Evidence → Daily Dataset → Report | Evidence / Reporting | ☑ IMPLEMENTED | Evidence queue → daily dataset → report assembly dengan runtime test evidence. Evidence: f4b13cbc / 292e5f3f / ed5b591d. |
| MTA-F-20260927-019 | 2026-09-27 | Admin Settings — AI API + Web Branding | Administration | ☑ IMPLEMENTED | Admin-only settings untuk API AI dan web branding; AI OFF/config-only dan secret tidak disimpan di browser. Evidence: 1f9a861a / 1b9cd1ff. |
| MTA-F-20260927-020 | 2026-09-27 | Branding Upload / Operational-State Isolation | Administration / Branding | ☑ IMPLEMENTED | Branding assets terisolasi dari operational state; upload/data regression evidence. Evidence: 36a500a6 / 79ab9f8a. |
| MTA-F-20260927-021 | 2026-09-27 | User Management / Tambah User | Administration / Identity | ☐ PLANNED | Requested capability: admin dapat membuat/mengelola user dengan role, scope, status, dan authorization boundary. Audit source belum menemukan operational Tambah User UI/service; tidak diklaim implemented. |
| MTA-F-20260927-022 | 2026-09-27 | Detainee Detail Navigation / Lihat Data Deteni | Data Deteni | ☑ VERIFIED | Nama deteni dan tombol Lihat membuka detail individu melalui canonical `MTADetaineeDetailView.detail(id)`, dengan back navigation, histori, penempatan, pergerakan, izin, dokumen, QR, download, cetak, dan audit detail. Code/test evidence: `web/mta-app-runtime-full.js`, `web/detainee-detail-v1.js`, `web/index.html`, `test/detainee-detail-navigation.test.mjs`; runtime evidence: production `https://mta-deteni.galleryabah.workers.dev/`, `/api/health` HTTP 200, `/api/runtime` HTTP 200 pada 2026-09-27; browser evidence confirms Data Deteni → Lihat → Detail Data Deteni. Deployment/runtime gate passed; production remains SYNTHETIC_ONLY, AI OFF, migration freeze active. |
## Incoming Feature Queue

Gunakan bagian ini untuk fitur baru sebelum implementasi. Setelah implementasi dan verifikasi, pindahkan/ubah entry ke **Feature List**.

| ID | Tanggal | Fitur | Area | Status | Acceptance Criteria | Bukti |
|---|---|---|---|---|---|---|
| — | — | — | — | — | — | — |

## Verification Contract

Sebuah fitur hanya dianggap **☑ VERIFIED** bila semua kriteria yang relevan terpenuhi:

```text
REQUEST
  ↓
FEATURE ID
  ↓
IMPLEMENTATION
  ↓
STATIC / CODE VERIFICATION
  ↓
TEST / CI
  ↓
RUNTIME VERIFICATION (jika diperlukan)
  ↓
EVIDENCE
  ↓
☑ VERIFIED
```

### Minimum Evidence

- **Code evidence:** file/module/API/UI yang menerapkan fitur.
- **Behavior evidence:** test atau hasil runtime yang menunjukkan perilaku yang diminta.
- **Regression evidence:** fitur existing yang terdampak tetap berfungsi.
- **CI evidence:** gunakan hasil CI jika perubahan masuk pipeline.
- **Deployment evidence:** wajib bila fitur diklaim sudah diterapkan pada environment tertentu.

## Change Procedure

Untuk setiap permintaan fitur berikutnya:

```text
1. CATAT → buat Feature ID
2. DEFINISIKAN → acceptance criteria
3. IMPLEMENTASI → code/config/UI/domain
4. VERIFIKASI → repository + test/CI + runtime
5. CEKLIS → ☑ VERIFIED hanya jika evidence lengkap
6. UPDATE → CHANGELOG / PROJECT_STATUS bila perubahan berdampak pada phase
```

**Prinsip:** tidak ada fitur "dianggap selesai" tanpa evidence.

### QR Identity Integrity Rule

Untuk `MTA-F-20260926-002`, QR Deteni adalah **single immutable identity artifact**. QR wajib berasal dari record QR yang dibuat pada input/registrasi Deteni pertama kali. Halaman detail, cetak, download, scan, dan aksi berikutnya hanya boleh menggunakan payload/token QR yang sudah tersimpan; tidak boleh membuat token/QR identity baru. Perubahan data profil, status, penempatan, pergerakan, izin, dokumen, atau deportasi tidak boleh mengubah QR Deteni.


## Complete Capability Inventory

For repository-wide capability reconciliation beyond the explicitly registered Feature IDs, see [`FEATURE_INVENTORY.md`](FEATURE_INVENTORY.md). The inventory separates user-facing features from platform/governance capabilities and records implementation, test, runtime, phase, commit, and registration evidence.


### MTA-F-20260927-004 — Dashboard Room Summary
- [x] **IMPLEMENTED**
- Acceptance: Dashboard menampilkan Room Summary dinamis dari canonical `rooms` dan `placements` state: Total Kamar, Kamar Terisi, dan Kapasitas; tidak menggunakan angka hard-coded.
- Evidence: `web/mta-app-runtime-full.js`, `web/index.html`, `test/room-summary-dashboard.test.mjs`.
- Runtime: static regression contract added; browser/runtime deployment verification pending.
