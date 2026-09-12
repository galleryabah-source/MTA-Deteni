# MTA DETENI — Super Admin RBAC Console Specification v1.0

## 1. Tujuan

MTA DETENI menyediakan **Super Admin RBAC Console** untuk mengelola kewenangan pengguna/role secara terkontrol melalui antarmuka checklist/checkbox.

Fitur ini bukan sekadar pengaturan menu. Setiap checkbox merepresentasikan permission yang dapat dievaluasi pada level **role × domain × action × scope × workflow state**.

Super Admin dapat menambah atau mengurangi kewenangan dengan check/uncheck, kemudian menyimpan perubahan melalui tombol **Simpan Pengaturan**.

## 2. Prinsip Keamanan

- Deny-by-default.
- Least privilege.
- Separation of duties.
- Tidak boleh ada privilege escalation melalui UI.
- Permission kritis memiliki guardrail dan dapat memerlukan second approval.
- Setiap perubahan RBAC menghasilkan audit event immutable.
- Tidak ada perubahan permission tanpa actor, waktu, alasan, dan before/after snapshot.
- `SYSTEM_ADMIN` tidak otomatis menjadi `SUPER_ADMIN`.
- `HEAD_RUDENIM` tetap berbeda dari `SUPER_ADMIN`: Kepala Rudenim adalah oversight substantif; Super Admin adalah administrasi akses sistem.
- Super Admin tidak memperoleh akses substantif ke data sensitif hanya karena dapat mengelola RBAC.

## 3. Super Admin Capabilities

### A. Role Management

- melihat daftar role;
- membuat role baru bila policy mengizinkan;
- mengaktifkan/menonaktifkan role;
- memberi deskripsi role;
- melihat jumlah user per role;
- melihat permission aktif/nonaktif.

### B. Permission Management

- check permission untuk menambahkan kewenangan;
- uncheck permission untuk mengurangi kewenangan;
- filter berdasarkan domain;
- filter berdasarkan action;
- pencarian permission;
- Select All pada kelompok non-kritis;
- Clear All pada kelompok non-kritis;
- melihat permission inherited/explicit;
- melihat permission yang diblokir policy.

### C. Save & Versioning

Tombol utama:

**Simpan Pengaturan**

Sebelum penyimpanan sistem menampilkan:

1. role yang diubah;
2. jumlah permission ditambahkan;
3. jumlah permission dicabut;
4. permission kritis yang terdampak;
5. perubahan before → after;
6. alasan perubahan wajib;
7. konfirmasi ulang.

Setelah berhasil:

- membuat RBAC policy version baru;
- mencatat audit event;
- mencatat actor Super Admin;
- mencatat timestamp;
- menyimpan hash/snapshot perubahan;
- menerapkan policy sesuai mekanisme cache invalidation/session policy;
- menampilkan status berhasil.

## 4. Permission Taxonomy

Permission tidak hanya berbentuk `view` dan `edit`.

### Standard actions

- `VIEW`
- `CREATE`
- `EDIT`
- `DELETE` — default disabled dan sangat dibatasi
- `VERIFY`
- `APPROVE`
- `REJECT`
- `GENERATE`
- `DOWNLOAD`
- `PRINT`
- `DISTRIBUTE`
- `ARCHIVE`
- `EXPORT`
- `IMPORT`
- `ASSIGN`
- `EXECUTE`
- `COMMENT`
- `RECOMMEND`
- `DIRECT`
- `DISPOSE`
- `AUDIT_VIEW`
- `RBAC_MANAGE`

## 5. Domain Permission Groups

### Master Data Deteni

- View identity
- Create administrative record
- Edit administrative record
- Verify administrative record
- Archive record
- View history

### Dokumen Deteni

- View documents
- Upload document
- Replace/revise document
- Generate document
- Download document
- Print document
- Archive document

### Placement

- View block
- View room
- View bed
- Assign placement
- Change placement
- Verify placement

### Movement & Headcount

- View movement
- Create movement
- Verify movement
- Execute movement
- Headcount
- Correct movement with controlled workflow

### Izin Keluar Sementara

- View request
- Create request
- Edit draft
- Verify request
- Approve request
- Reject request
- Generate Surat Izin Keluar Sementara
- Download Surat Izin Keluar Sementara
- Record departure
- Record return
- Close process

### Pengawalan

- View escort
- Create escort request
- Assign escort members
- Execute escort
- Record escort result
- View escort history

### Surat Tugas Pengawalan

- Receive TU task
- Verify administrative completeness
- Generate Surat Tugas
- Number/register document
- Download Surat Tugas
- Distribute document
- Archive document

### PERKES / Health

Health permissions are separately scoped:

- View minimum operational health flag
- View restricted health detail
- Create health record
- Edit health record
- Verify health record
- View health history
- Create medical recommendation

A Super Admin checkbox must **not** automatically expose health detail to the Super Admin itself.

### Leadership

- View cross-section dashboard
- View full detainee timeline
- View recommendations
- Create PETUNJUK
- Create ARAHAN
- Create REKOMENDASI
- Create DISPOSISI
- View follow-up

These permissions do not convert `HEAD_RUDENIM` into an operational editor.

### Audit

- View audit log
- Search audit log
- Export audit evidence where policy permits
- Verify audit integrity

Audit modification/deletion is prohibited.

## 6. UI Layout

Recommended route:

`/admin/security/rbac`

### Header

**Pengaturan Hak Akses & RBAC**

Controls:

- Role selector
- Search permission
- Domain filter
- Action filter
- Reset unsaved changes
- **Simpan Pengaturan**

### Permission table

| Domain | Permission | Aktif | Scope | Status |
|---|---|---:|---|---|
| Deteni | View identity | ☑ | RAP | Active |
| Deteni | Edit identity | ☐ | RAP | Disabled |
| Izin Keluar | Generate letter | ☑ | KAMTIB | Active |
| Surat Tugas | Generate document | ☑ | TU | Active |
| Health | View restricted detail | ☐ | PERKES | Restricted |

Checkbox states:

- checked = granted;
- unchecked = denied;
- locked = policy-mandated and cannot be changed by this administrator;
- warning = high-risk permission requiring additional confirmation.

## 7. Critical Permission Guardrails

Permission berikut tidak boleh diberikan hanya melalui satu checkbox tanpa guardrail:

- `RBAC_MANAGE`
- `APPROVE` untuk keputusan kritis;
- `EXPORT` data sensitif;
- `VIEW_RESTRICTED_HEALTH`;
- `AUDIT_ADMIN` bila ada;
- technical impersonation/break-glass;
- perubahan policy keamanan inti.

Untuk permission kritis sistem dapat meminta:

`Reason → Re-authentication → Confirmation → Second Approval → Save`

Implementasi second approval mengikuti policy organisasi.

## 8. Save Transaction

Perubahan permission harus bersifat atomic.

Konsep transaksi:

```text
Open current policy
      ↓
Edit checkbox state
      ↓
Validate policy constraints
      ↓
Detect privilege escalation
      ↓
Require reason
      ↓
Optional second approval
      ↓
Commit new policy version
      ↓
Write immutable audit event
      ↓
Invalidate authorization cache
      ↓
Confirm result
```

Jika validasi gagal, **tidak boleh ada sebagian permission yang tersimpan**.

## 9. Privilege Escalation Protection

Sistem wajib memeriksa:

- apakah perubahan membuat role memperoleh akses yang dilarang;
- apakah operator memperoleh approval tanpa segregation;
- apakah user dapat mengubah role yang mengatur dirinya sendiri secara berbahaya;
- apakah perubahan membuka restricted health domain;
- apakah perubahan memungkinkan audit tampering;
- apakah perubahan memungkinkan export data sensitif;
- apakah perubahan melanggar policy minimum/mandatory permissions.

## 10. User-Level Override

RBAC role adalah baseline.

Jika diperlukan, ABAC dapat membatasi berdasarkan:

- unit/seksi;
- lokasi/Rudenim;
- domain data;
- classification;
- purpose;
- workflow state;
- ownership/context;
- waktu;
- break-glass state.

User-level permission override tidak boleh menjadi jalan pintas untuk melewati role restrictions.

## 11. Audit Record

Setiap Save minimal menghasilkan:

```text
rbac_change_id
actor_user_id
actor_role
role_changed
before_policy_hash
after_policy_hash
permissions_added
permissions_removed
reason
second_approver_id (nullable)
created_at
source_session
correlation_id
result
```

Audit event tidak boleh diedit atau dihapus melalui console.

## 12. Emergency Recovery

Harus tersedia mekanisme recovery bila Super Admin salah mencabut akses penting:

- policy version history;
- compare versions;
- rollback ke policy version sebelumnya;
- rollback tetap melalui authorization + audit;
- tidak ada silent rollback.

## 13. Acceptance Criteria

1. Super Admin dapat memilih role.
2. Permission ditampilkan sebagai checklist.
3. Check menambah permission pada pending state.
4. Uncheck mengurangi permission pada pending state.
5. Perubahan belum aktif sebelum Save.
6. Save melakukan validasi policy.
7. Save bersifat atomic.
8. Alasan perubahan wajib untuk perubahan sensitif.
9. Privilege escalation ditolak.
10. Perubahan berhasil menghasilkan policy version baru.
11. Audit before/after tercatat.
12. Authorization cache/session policy diperbarui sesuai desain.
13. Rollback tersedia dan diaudit.
14. Super Admin tidak otomatis mendapat akses health/restricted data.
15. Kepala Rudenim tetap read-only terhadap operational records meskipun role lain dapat diubah.
16. User tidak dapat memodifikasi audit trail.

## 14. Implementation Boundary

Dokumen ini adalah spesifikasi desain. **Belum merupakan izin untuk melakukan schema migration atau perubahan production authorization.** Implementasi harus mengikuti data contract, threat model, security review, dan acceptance test yang telah disetujui.
