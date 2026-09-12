# MTA DETENI — Document Contract & Template Specification v1.0

## 1. Status

Dokumen ini menjadi kontrak fungsional untuk Document Engine MTA DETENI. Implementasi DOCX tidak boleh mengubah substansi template tanpa persetujuan pemilik proses/otoritas yang berwenang.

## 2. Core Documents

### DOC-01 — Surat Izin Keluar Sementara
- Owner proses: KAMTIB sesuai kewenangan.
- Output wajib: `.docx`.
- Sumber data: approved/verified detainee + temporary-exit record + authorization.
- Final issuance mengikuti workflow dan pejabat berwenang.

### DOC-02 — Surat Tugas Pengawalan
- Owner administrasi dokumen: SUBBAG_TU.
- Output wajib: `.docx`.
- Sumber data: approved temporary-exit/escort record + escort members + assignment metadata.
- Final issuance mengikuti workflow dan pejabat berwenang.

## 3. Template Registry

Setiap template memiliki:
- `template_id`;
- `document_type`;
- `version`;
- `effective_from`;
- `effective_until` bila ada;
- `status` (`DRAFT`, `ACTIVE`, `RETIRED`);
- owner;
- authority/reference;
- file/object reference;
- checksum;
- required placeholders;
- metadata.

Historical generated documents tetap menunjuk template version yang digunakan saat diterbitkan.

## 4. Placeholder Contract

Setiap placeholder harus terdaftar dan dipetakan secara eksplisit. Contoh kelompok field:

### Letter metadata
- nomor surat;
- tanggal surat;
- document ID;
- reference/basis;
- classification/handling label bila berlaku.

### Detainee
- nama;
- nationality;
- date of birth hanya jika diperlukan dan diizinkan;
- identity/reference number hanya jika diperlukan dan diizinkan.

### Temporary exit
- purpose;
- destination;
- departure date/time;
- expected return date/time;
- actual return date/time hanya pada hasil/final record yang relevan;
- authorization reference.

### Escort
- officer name;
- personnel identifier/rank/position hanya bila diperlukan;
- assignment date/time;
- destination;
- escort composition;
- task/reference.

### Authorization/signature
- approving official;
- signature block;
- approval date;
- signature/authorization reference sesuai mekanisme yang sah.

## 5. Sensitive Field Rule

Ketersediaan field di database tidak berarti field boleh masuk dokumen. Field mapping harus melewati policy/authorization check dan prinsip data minimization.

Data kesehatan, biometrik, dan data sensitif lain tidak dimasukkan ke dokumen operasional umum kecuali ada dasar, kebutuhan, dan kewenangan yang sesuai.

## 6. Generation Pipeline

```text
Workflow Record
   ↓
Authorization Check
   ↓
Field Contract Validation
   ↓
Template Version Resolution
   ↓
Data Merge
   ↓
DOCX Generation
   ↓
Document Validation
   ↓
Review
   ↓
Approval
   ↓
Issue
   ↓
Download/Distribution
   ↓
Archive + Audit
```

## 7. Document Integrity

Generated document menyimpan minimal:
- document ID;
- document type;
- template version;
- source record IDs;
- generated_by;
- generated_at;
- status;
- SHA-256 hash;
- audit/event references.

## 8. Access Contract

| Actor | Surat Izin Keluar | Surat Tugas | Template Admin |
|---|---|---|---|
| KAMTIB | create/review/generate/download sesuai status | view terkait | no |
| SUBBAG_TU | view administratif sesuai scope | administer/generate/download sesuai status | manage sesuai authority |
| PEJABAT_APPROVER | approve/issue sesuai mandat | approve/issue sesuai mandat | no |
| HEAD_RUDENIM | oversight/read-only | oversight/read-only | no operational edit |
| AUDITOR | read/audit | read/audit | read/audit |
| SYSTEM_ADMIN | technical only | technical only | technical controls, no automatic substantive access |

## 9. Revision Rules

- Draft dapat direvisi sesuai kewenangan.
- Dokumen yang sudah issued tidak boleh silent overwrite.
- Perubahan substansial menghasilkan revision/version baru dan audit event.
- Template retired tidak boleh dipakai untuk dokumen baru kecuali controlled exception yang diaudit.

## 10. Acceptance Tests

1. Template active dapat dipilih secara deterministic.
2. Placeholder wajib yang hilang menyebabkan generation gagal secara aman.
3. Field unauthorized tidak dapat di-merge.
4. DOCX dapat dibuka dan memiliki layout yang valid.
5. Document ID unik.
6. Template version tersimpan.
7. Hash tersimpan dan dapat diverifikasi.
8. Approval/issue mengikuti authority matrix.
9. Download menghasilkan audit event.
10. Historical document tetap terkait template version lama.
11. KAMTIB dan SUBBAG_TU hanya melihat/mengunduh dokumen sesuai workflow state.
12. Repository tidak mengandung dokumen operasional atau data deteni nyata.

## 11. Template Input Requirement

Untuk implementasi final, pemilik proses perlu menyediakan salah satu dari:
- template Word resmi yang telah disanitasi; atau
- template contoh non-rahasia yang merepresentasikan format resmi.

Template akan dianalisis untuk field mapping tanpa memasukkan data deteni nyata ke repository.
