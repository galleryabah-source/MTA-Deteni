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
| Total feature | 3 |
| ☑ VERIFIED | 1 |
| ◐ IN_PROGRESS | 0 |
| ☐ PLANNED | 0 |
| ⚠ BLOCKED | 0 |
| ☑ IMPLEMENTED | 2 |
| ↺ REGRESSION | 0 |

## Feature List

| ID | Tanggal | Fitur | Area | Status | Bukti / Acceptance |
|---|---|---|---|---|---|
| MTA-F-20260926-001 | 2026-09-26 | **Feature Registry & Verification Tracking** | Governance / Project Control | ☑ VERIFIED | Registry dibuat di repository; aturan pencatatan dan status verifikasi dikunci. |
| MTA-F-20260926-003 | 2026-09-26 | **Statistik Data Deteni & Ekosistem Kegiatan** | Data & Penempatan / Operational Statistics | ☑ IMPLEMENTED | Menu dan halaman statistik yang merangkum populasi Deteni, status, kebangsaan, usia, jenis kelamin, penempatan blok/kamar, pergerakan, izin, dokumen terkait, tren input, serta indikator ekosistem. Tidak memasukkan audit trail, log, telemetry, authentication, event aplikasi, atau proses kesisteman MTA. | `web/detainee-statistics-v1.js`, `web/index.html`, `test/detainee-statistics-feature.test.mjs` |
| MTA-F-20260926-002 | 2026-09-26 | **Detail Data Deteni + Histori + QR + Dokumen** | Data Deteni / Individual Record | ☑ IMPLEMENTED | Nama deteni dapat dibuka ke halaman detail; identitas lengkap, penempatan, histori masuk→penahanan→pergerakan→deportasi bila tersedia, **QR canonical yang sama dengan QR saat input pertama dan tidak berubah**, dokumen terkait, download Word-compatible, dan cetak dokumen terformat. | `web/detainee-detail-v1.js`, `web/index.html`, `test/detainee-detail-feature.test.mjs`; Static Integration Gate PASS; browser/runtime verification masih menjadi tahap berikutnya. |

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
