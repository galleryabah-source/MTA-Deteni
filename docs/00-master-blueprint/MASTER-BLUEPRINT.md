# MTA DETENI — Master Blueprint v1.0

## 1. Nama dan Positioning

**MTA DETENI — Manajemen Terpadu Administrasi Deteni** adalah model tata kelola administrasi deteni untuk meningkatkan ketertiban data, konsistensi proses, kecepatan administrasi, akuntabilitas, dan keterlacakan.

**MTA DETENI Digital** adalah instrumen pendukung digital untuk menjalankan model tersebut. Fokus inovasi adalah perubahan tata kelola dan proses kerja; teknologi digunakan sebagai enabler.

## 2. Tujuan

- membangun satu sumber data administratif yang tervalidasi;
- mengintegrasikan proses RAP, PERKES, dan KAMTIB sesuai kewenangan;
- mencatat setiap peristiwa penting secara kronologis;
- mempercepat penyusunan dokumen administratif melalui template terkendali;
- memperkuat approval, audit trail, dan akuntabilitas;
- menyediakan dashboard dan laporan yang konsisten;
- menyiapkan fondasi untuk OCR, intake pesan resmi, transcript extraction, dan AI-assisted administration secara aman.

## 3. Prinsip Tata Kelola

- **Purpose limitation** — data digunakan sesuai tujuan dan kewenangan.
- **Data minimization** — hanya data yang diperlukan yang diproses.
- **Least privilege** — akses minimum sesuai tugas.
- **Deny by default** — akses ditolak kecuali diberikan secara eksplisit.
- **Separation of duties** — input, verifikasi, dan persetujuan tidak dipaksakan pada aktor yang sama.
- **Provenance** — setiap data penting memiliki sumber, aktor, waktu, metode, dan status verifikasi.
- **Immutable history** — peristiwa kritis ditambahkan sebagai event, bukan menimpa sejarah.
- **Human accountability** — sistem dan AI tidak mengambil keputusan administratif final.
- **Restricted-data isolation** — data kesehatan dan data pribadi berisiko tinggi dipisahkan dari domain operasional umum.

## 4. Domain Utama

1. Master Data Deteni
2. Dokumen Deteni
3. Status dan riwayat
4. Penempatan blok/ruang/bed
5. Movement ledger
6. Headcount
7. KAMTIB
8. RAP
9. PERKES
10. Izin Keluar Sementara
11. Surat Perintah Pengawalan
12. Document Generator
13. Approval Workflow
14. Barcode/QR
15. Intake/OCR/Transcript
16. Dashboard dan Reporting
17. Notification dan Alert
18. Audit Trail
19. RBAC/ABAC
20. Data Governance dan Security

## 5. Alur Data Terkendali

```text
Sumber resmi
   ↓
Raw / Intake Vault
   ↓
Extraction / Parsing / OCR
   ↓
Validation
   ↓
Human Verification
   ↓
Approved Operational Record
   ↓
Workflow / Document / Reporting
   ↓
Audit Trail
```

Tidak diperbolehkan alur langsung dari WhatsApp/OCR/transcript ke record operasional final.

## 6. Lifecycle Record

`DRAFT → VERIFIED → APPROVED → SUPERSEDED / VOIDED`

Record kritis tidak dihapus secara hard delete tanpa dasar kebijakan retensi dan kewenangan. Koreksi dilakukan melalui versi/event yang dapat diaudit.

## 7. Modul Digital Prioritas

### MVP
- Authentication dan session security
- Master Data Deteni
- Blok/Ruang/Bed
- Movement Ledger
- Barcode/QR
- Izin Keluar Sementara
- Surat Perintah Pengawalan
- Document Generator
- Approval Workflow
- Audit Trail
- Dashboard dasar

### Tahap berikutnya
- OCR intake
- WhatsApp Business Platform intake yang sah
- Transcript → structured data
- Timeline Deteni
- Alert dan notification
- Reporting lanjutan
- analytics operasional
- AI-assisted administration dengan human verification

## 8. Keamanan

Data produksi harus berada pada infrastruktur resmi/terotorisasi. Repository hanya memuat dokumentasi dan synthetic fixtures. Tidak boleh memasukkan PII nyata, data kesehatan, data biometrik, data perkara, export WhatsApp, credential, secret, atau dokumen operasional nyata.

Kontrol minimum: RBAC/ABAC, RLS bila relevan, encryption in transit/at rest, secure session, CSRF protection, CORS policy, rate limiting, audit integrity, backup/restore, secret scanning, dependency scanning, security regression test, dan review akses berkala.

## 9. Arsitektur Target

- Next.js App Router + TypeScript
- PostgreSQL
- Drizzle ORM
- Zod/Valibot validation
- React Hook Form
- TanStack Table/Query bila dibutuhkan
- Node.js worker/service untuk pekerjaan asynchronous
- PostgreSQL queue/pg-boss atau BullMQ + Redis sesuai kebutuhan
- S3-compatible/private object storage
- `docx` untuk dokumen DOCX
- `bwip-js`/QR library untuk barcode/QR
- PostgreSQL full-text/pg_trgm sebelum mempertimbangkan search engine terpisah
- OIDC-compatible identity provider atau secure application authentication
- OpenTelemetry-compatible observability

## 10. Governance Gate

Tidak ada implementasi besar sebelum blueprint, data dictionary, authority matrix, security baseline, dan acceptance criteria disetujui.

Urutan delivery:

**Blueprint → Architecture → Contract → Security → Implementation → Test → Audit → Release**

## 11. PKP Outcome

Output inovasi yang ditonjolkan adalah **model tata kelola dan perubahan proses**, dengan MTA DETENI Digital sebagai instrumen pendukung. Indikator keberhasilan harus mengukur perubahan nyata: waktu proses, kelengkapan data, kepatuhan SOP, kecepatan dokumen, keterlacakan, jumlah koreksi, dan kualitas pelaporan.
