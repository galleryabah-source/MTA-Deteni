# MTA DETENI — AS-IS → TO-BE Process Blueprint v1.0

## 1. Target Operating Model

MTA DETENI mengubah administrasi berbasis dokumen/komunikasi terpisah menjadi proses terintegrasi yang memiliki pemilik proses, status, rekomendasi, arahan, approval, tindak lanjut, timeline, dan audit trail.

## 2. Core Flow

```text
Data/Request
  → Validation
  → Recommendation
  → Direction/Disposition (bila diperlukan)
  → Approval
  → Execution
  → Result
  → Timeline
  → Audit
```

## 3. RAP Flow

1. Registrasi/input data awal.
2. Lampiran berkas dan dokumen.
3. Checklist kelengkapan.
4. Verifikasi administrasi.
5. Menetapkan status kesiapan data.
6. Request deportasi atau izin keluar bila diperlukan.
7. Pengelolaan administrasi barang deteni.
8. Memberikan catatan/rekomendasi administratif.
9. Menerima arahan/disposisi dan mencatat tindak lanjut.

## 4. PERKES Flow

1. Pemeriksaan awal.
2. Pencatatan data kesehatan sesuai kewenangan.
3. Jadwal pemeriksaan/follow-up.
4. Timeline kesehatan.
5. Rekomendasi medis atau rujukan bila diperlukan.
6. Input kebutuhan makanan/barang terkait kebutuhan kesehatan.
7. Menerima arahan/disposisi yang relevan.
8. Data kesehatan tetap berada pada restricted domain.

## 5. KAMTIB Flow

1. Melihat informasi yang diperlukan untuk operasi.
2. Menentukan/kelola penempatan sesuai kewenangan.
3. Headcount dan movement.
4. Menerima request izin keluar.
5. Verifikasi tujuan, jadwal, kebutuhan, dan pengawalan.
6. Menggunakan rekomendasi PERKES bila izin berkaitan dengan kesehatan.
7. Menetapkan kebutuhan pengawalan sesuai kewenangan.
8. Menyiapkan surat izin keluar.
9. Menghasilkan barcode/QR dan daftar blok/kamar.
10. Mengajukan/menjalankan workflow surat tugas.
11. Mencatat keberangkatan, pelaksanaan, dan kembali.
12. Menutup kegiatan dan menghasilkan event timeline.

## 6. Subbagian Tata Usaha Flow

1. Menerima permintaan penatausahaan surat tugas.
2. Memeriksa kelengkapan administrasi.
3. Menyiapkan surat tugas petugas Rudenim.
4. Register/penomoran sesuai ketentuan tata naskah yang berlaku.
5. Workflow tanda tangan/otorisasi.
6. Menerbitkan dan mendistribusikan surat.
7. Mengunggah dokumen final.
8. Mengarsipkan.
9. Memantau status dan memberikan notifikasi.
10. Memberikan catatan/rekomendasi administratif.

TU tidak mengambil keputusan substantif yang menjadi kewenangan KAMTIB atau pejabat berwenang.

## 7. Head Rudenim Oversight Flow

Kepala Rudenim memiliki visibilitas menyeluruh untuk oversight:

```text
Dashboard
  → Detainee
  → Timeline
  → Process status
  → Unit recommendations
  → Pending actions
  → Audit
```

Kepala Rudenim dapat memberikan `PETUNJUK`, `ARAHAN`, `REKOMENDASI`, dan `DISPOSISI`, tetapi tidak mengedit record operasional melalui fungsi oversight.

## 8. Cross-Unit Recommendation Loop

Setiap seksi dapat memberikan rekomendasi yang terkait dengan tugasnya. Rekomendasi menjadi objek yang dapat ditindaklanjuti, bukan sekadar catatan bebas.

```text
Unit → Recommendation → Target → Acknowledgement → Action → Response → Closure
```

## 9. Temporary Exit Workflow

```text
RAP / KAMTIB / sumber yang sah
        ↓
Request Izin Keluar
        ↓
PERKES Recommendation (jika kesehatan)
        ↓
KAMTIB Verification
        ↓
Pejabat Berwenang / Approval
        ↓
KAMTIB menyiapkan pelaksanaan & pengawalan
        ↓
SUBBAG TU menatausahakan Surat Tugas
        ↓
Surat diterbitkan/distribusikan
        ↓
Pelaksanaan Pengawalan
        ↓
Catat Keluar
        ↓
Catat Kembali
        ↓
Closure + Timeline + Audit
```

## 10. Detainee Timeline

Timeline menjadi agregator read model dari event yang sah, misalnya:

- registrasi;
- dokumen;
- status;
- penempatan;
- movement;
- pemeriksaan kesehatan yang boleh ditampilkan berdasarkan policy;
- request;
- approval;
- arahan/disposisi;
- izin keluar;
- surat tugas;
- keberangkatan/kembali;
- incident;
- closure.

Timeline bukan tempat untuk mengedit event masa lalu.

## 11. KPI Target

Baseline dan target harus diukur pada pilot:

- waktu registrasi;
- persentase data lengkap;
- waktu request → approval;
- waktu approval → surat tugas terbit;
- waktu pencarian dokumen;
- jumlah koreksi data;
- jumlah proses tanpa audit trail;
- kepatuhan SOP;
- ketepatan pencatatan keluar/kembali;
- persentase tindak lanjut arahan tepat waktu.
