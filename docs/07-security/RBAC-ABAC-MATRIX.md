# MTA DETENI — RBAC & ABAC Authority Matrix v1.0

## 1. Purpose

Dokumen ini menetapkan baseline kewenangan MTA DETENI berdasarkan fungsi organisasi, bukan sekadar akses menu. Setiap permission dievaluasi terhadap role, domain data, aksi, konteks, dan status workflow.

Prinsip: deny-by-default, least privilege, separation of duties, purpose limitation, data minimization, dan auditability.

## 2. Core Roles

- `HEAD_RUDENIM` — oversight pimpinan; melihat keseluruhan data/timeline, read-only terhadap record operasional, dapat memberi petunjuk, arahan, rekomendasi, dan disposisi.
- `RAP` — registrasi, administrasi, dan pelaporan.
- `PERKES` — perawatan dan kesehatan.
- `KAMTIB_OPERATOR` — operasi keamanan dan ketertiban sesuai kewenangan.
- `KAMTIB_ADMIN` — administrasi/operasional KAMTIB dengan hak edit yang lebih tinggi sesuai policy.
- `SUBBAG_TU` — penatausahaan administrasi surat, termasuk surat tugas pengawalan.
- `PEJABAT_APPROVER` — persetujuan formal sesuai mandat.
- `AUDITOR` — akses audit/read-only sesuai penugasan.
- `SYSTEM_ADMIN` — administrasi teknis; tidak otomatis memperoleh akses substantif ke data sensitif.

## 3. RAP

### Allowed
- Input data awal deteni.
- Upload dan pengelolaan lampiran/berkas administrasi.
- Melihat data deteni sesuai kewenangan.
- Checklist kelengkapan dan status verifikasi administrasi.
- Request deportasi.
- Request izin keluar sementara.
- Notifikasi administrasi.
- Pengelolaan administrasi barang deteni.
- Pemutakhiran data administratif sesuai kewenangan.
- Document-expiry monitoring.
- Pelaporan administrasi.
- Memberikan catatan, petunjuk internal, atau rekomendasi administratif.

### Not allowed by default
- Mengedit data kesehatan.
- Mengubah penempatan operasional KAMTIB.
- Menyetujui keputusan final yang menjadi kewenangan pejabat lain.
- Mengubah audit trail.

## 4. PERKES

### Allowed
- Input pemeriksaan awal.
- Input/edit data kesehatan sesuai kewenangan profesional.
- Timeline/history kesehatan.
- Jadwal pemeriksaan dan follow-up.
- Notifikasi kesehatan.
- Rujukan/rekomendasi medis.
- Input kebutuhan bahan makanan khusus.
- Input kebutuhan barang yang berkaitan dengan kebutuhan kesehatan.
- Memberikan rekomendasi medis untuk proses operasional yang memerlukan informasi tersebut.

### Restricted
Data kesehatan harus berada pada restricted health domain. Unit lain hanya menerima informasi minimum yang diperlukan untuk menjalankan tugas.

### Not allowed by default
- Mengubah data identitas administratif RAP.
- Mengubah penempatan/blok/kamar.
- Mengubah audit trail.

## 5. KAMTIB

### KAMTIB_OPERATOR
- Melihat data yang diperlukan untuk operasi.
- Melihat timeline operasional.
- Mengelola movement sesuai kewenangan.
- Mengelola penempatan bila diberikan permission.
- Headcount/check-in/check-out.
- Mengelola izin keluar sesuai workflow.
- Menyiapkan kebutuhan pengawalan.
- Melihat notifikasi operasional.
- Membuat catatan kejadian.
- Generate barcode/QR akses sesuai policy.
- Generate daftar deteni per blok/kamar sesuai kebutuhan operasional.
- Memberikan rekomendasi operasional.

### KAMTIB_ADMIN
Selain kewenangan operator, dapat memiliki hak edit terhadap record operasional yang ditetapkan policy, dengan audit trail penuh.

### Restricted
KAMTIB tidak memperoleh akses penuh ke detail rekam medis hanya karena dapat melihat data deteni secara luas. Health access harus field/domain-scoped.

## 6. SUBBAGIAN TATA USAHA

### Allowed
- Menerima workflow penatausahaan surat tugas.
- Memeriksa kelengkapan administratif surat tugas.
- Menyiapkan dan meneruskan surat tugas petugas Rudenim untuk pengawalan izin keluar sementara.
- Generate surat tugas dari template terkendali.
- Penomoran/register sesuai tata naskah yang berlaku.
- Mencatat dasar, tanggal, kegiatan, petugas, dan periode tugas.
- Mengelola status dokumen: Draft → Diajukan → Diverifikasi → Ditandatangani → Diterbitkan → Disampaikan → Diarsipkan.
- Distribusi dokumen kepada pihak yang berwenang.
- Upload dokumen final.
- Pengarsipan dan pencarian surat tugas.
- Rekap surat tugas.
- Notifikasi status administrasi surat.
- Memberikan catatan/rekomendasi administratif.

### Not allowed by default
- Menyetujui izin keluar.
- Mengubah data kesehatan.
- Mengubah status deteni.
- Mengubah penempatan deteni.
- Menetapkan keputusan deportasi.
- Mengubah hasil pelaksanaan pengawalan.

## 7. KEPALA RUDENIM

`HEAD_RUDENIM` memiliki prinsip **Full Visibility — Read Only — Leadership Direction**.

### Allowed
- Melihat keseluruhan data deteni sesuai kewenangan pimpinan.
- Melihat keseluruhan timeline.
- Melihat status administrasi, kesehatan dalam batas akses yang sah, penempatan, movement, izin, pengawalan, dan dokumen.
- Melihat dashboard lintas seksi.
- Melihat rekomendasi dari unit.
- Melihat audit trail sesuai kewenangan.
- Memberikan petunjuk.
- Memberikan arahan.
- Memberikan rekomendasi.
- Memberikan disposisi kepada unit/pihak yang berwenang.
- Memantau tindak lanjut.

### Explicit restriction
Kepala Rudenim tidak mengedit record operasional secara langsung melalui fungsi oversight. Perubahan dilakukan oleh unit pelaksana yang berwenang sehingga provenance dan separation of duties tetap terjaga.

## 8. Leadership & Unit Direction Layer

MTA DETENI menyediakan objek terpisah untuk:

- `PETUNJUK`
- `ARAHAN`
- `REKOMENDASI`
- `DISPOSISI`

Minimum metadata:

`author, source_unit, target_unit, target_user, related_deteni, related_process, priority, content, created_at, due_at, status, acknowledged_at, completed_at, response, audit_reference`.

## 9. Approval Separation

Requestor/inputter tidak otomatis menjadi approver. Untuk proses kritis, minimal terdapat pemisahan antara:

`INPUT → VERIFICATION → APPROVAL → EXECUTION → CLOSURE`.

## 10. Break-Glass

Akses darurat hanya dapat diberikan bila policy mengizinkan, harus:

- memiliki alasan wajib;
- time-limited;
- tercatat dalam audit trail;
- membatasi scope;
- menghasilkan post-review task.

## 11. Audit

Setiap aksi sensitif minimal mencatat actor, role, action, object, timestamp, purpose/context, result, source IP/session reference bila diperbolehkan policy, dan correlation ID.

Tidak ada role yang boleh menghapus atau memodifikasi audit trail secara langsung.

## 12. Principle of Least Privilege

Role yang lebih tinggi secara struktural tidak otomatis berarti unrestricted edit. Visibility, edit, approval, export, dan administrative control adalah permission yang terpisah.
