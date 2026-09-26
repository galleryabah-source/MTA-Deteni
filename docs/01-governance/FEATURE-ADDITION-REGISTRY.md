# MTA DETENI — Feature Addition Registry

## Purpose

Registry ini menjadi **catatan canonical setiap penambahan fitur, perubahan fungsi, perubahan kewenangan, dan keputusan fitur** pada MTA DETENI.

Setiap pekerjaan baru yang menambah atau mengubah kemampuan aplikasi wajib dicatat di registry ini sebelum pekerjaan dianggap terdokumentasi.

## Governance

- Setiap fitur mendapat ID registry yang unik.
- Catatan minimal: tanggal, nama fitur, jenis perubahan, ruang lingkup, status, branch/PR bila ada, dan catatan integrasi.
- Penambahan fitur tidak otomatis berarti fitur sudah production-ready.
- Status implementasi dan status certification harus dibedakan.
- Perubahan schema/migration tetap mengikuti governance database dan tidak boleh dilakukan hanya karena fitur dicatat.
- Fitur harus tetap terintegrasi dengan canonical flow: **Scan → Data → Action → Mutation → Audit → Monitor → Report → Evidence** bila relevan.
- Untuk authorization, canonical domain role adalah role blueprint MTA DETENI; role teknis lama tidak boleh menjadi domain role canonical.

## Status

- PROPOSED — sudah dicatat, belum diimplementasikan.
- IN_PROGRESS — sedang dikerjakan.
- IMPLEMENTED — implementasi tersedia.
- VERIFIED — implementasi telah diverifikasi dengan evidence.
- CERTIFIED — telah melewati gate/certification yang relevan.
- DEFERRED — ditunda.
- REJECTED — tidak dilanjutkan.

---

## Registry

| ID | Tanggal | Fitur / Perubahan | Jenis | Status | Catatan |
|---|---|---|---|---|---|
| FAR-2026-09-26-001 | 2026-09-26 | **User Management + RBAC Permission Checklist** pada Pengaturan Admin | Feature / Authorization | IN_PROGRESS | Mencakup tambah/edit user, role, checklist kewenangan, active/disabled. Implementasi sebelumnya berada pada PR #211 dan belum boleh dianggap authorization-complete sebelum canonical permission enforcement diterapkan. |
| FAR-2026-09-26-002 | 2026-09-26 | **Canonical Domain Role MTA DETENI** | Architecture / RBAC | PROPOSED | Role domain ditetapkan menggunakan blueprint, bukan OWNER/ADMIN/EDITOR/REVIEWER/VIEWER. |
| FAR-2026-09-26-003 | 2026-09-26 | **PETUGAS_PIKET** | Domain Role | PROPOSED | Role domain baru untuk fungsi petugas piket. Hak akses harus ditentukan melalui permission catalog canonical. |
| FAR-2026-09-26-004 | 2026-09-26 | **PETUGAS_LAYANAN_PENERIMAAN_DETENI** | Domain Role | PROPOSED | Role domain baru untuk fungsi layanan penerimaan deteni. Hak akses harus ditentukan melalui permission catalog canonical. |
| FAR-2026-09-26-005 | 2026-09-26 | **PETUGAS_ADMINISTRASI** | Domain Role | PROPOSED | Role domain baru untuk fungsi administrasi. Hak akses harus ditentukan melalui permission catalog canonical. |

## Canonical Domain Role Baseline

Role domain MTA DETENI yang menjadi baseline:

1. RAP
2. PERKES
3. KAMTIB_OPERATOR
4. KAMTIB_ADMIN
5. SUBBAG_TU
6. PEJABAT_APPROVER
7. HEAD_RUDENIM
8. AUDITOR
9. SYSTEM_ADMIN
10. SUPER_ADMIN
11. PETUGAS_PIKET
12. PETUGAS_LAYANAN_PENERIMAAN_DETENI
13. PETUGAS_ADMINISTRASI

### Authorization rule

Canonical authorization harus mengikuti:

**JWT → Subject → Domain Role → Permission → Scope → Policy → Workflow → Mutation → Audit**

OWNER, ADMIN, EDITOR, REVIEWER, dan VIEWER tidak menjadi canonical domain role MTA DETENI.

## Ongoing Rule

Mulai dari registry ini, **setiap kali user meminta atau menyetujui penambahan fitur baru**, pekerjaan tersebut harus:

1. mendapatkan ID FAR-YYYY-MM-DD-NNN;
2. dicatat di registry;
3. ditautkan ke branch/PR/commit bila sudah ada;
4. diberi status implementasi;
5. diverifikasi sebelum status VERIFIED;
6. tidak disebut production-ready sebelum gate yang relevan terpenuhi.
