# MTA DETENI — Authorization Control Plane v1.0

## 1. Rekomendasi Arsitektur

MTA DETENI menggunakan **Authorization Control Plane (ACP)** sebagai lapisan pengendali seluruh kewenangan.

ACP menggabungkan:

`RBAC baseline + ABAC/context + Policy Guardrails + Approval + Versioning + Audit`

Tujuannya adalah membuat kewenangan dapat dikonfigurasi melalui Super Admin Console tanpa menjadikan checkbox sebagai mekanisme bypass keamanan.

## 2. Pemisahan Tanggung Jawab

```text
SUPER_ADMIN
   │
   ├── Role & Permission Configuration
   ├── Policy Versioning
   └── Access Governance

POLICY ENGINE
   │
   ├── RBAC
   ├── ABAC
   ├── Mandatory Deny
   ├── SoD Rules
   └── Restricted Domain Rules

APPLICATION
   │
   └── Authorization Decision
          │
          ├── ALLOW
          └── DENY

AUDIT ENGINE
   └── Immutable/Tamper-evident Event
```

## 3. Authorization Decision

Setiap request sensitif harus melewati policy evaluation.

Konsep:

```text
User
 + Role
 + Permission
 + Unit
 + Domain
 + Resource
 + Action
 + Workflow State
 + Purpose/Context
 + Policy Version
       ↓
Authorization Engine
       ↓
ALLOW / DENY / STEP-UP / SECOND-APPROVAL
```

UI tidak boleh menjadi sumber keputusan authorization. UI hanya merefleksikan policy yang sudah diperiksa server.

## 4. Permission Model

Permission harus memiliki identifier stabil, misalnya:

`KAMTIB.LEAVE.GENERATE_DOCUMENT`

`TU.ESCORT_LETTER.DOWNLOAD`

`PERKES.HEALTH_RECORD.EDIT`

`DETENI.IDENTITY.VIEW`

`RBAC.POLICY.MANAGE`

Metadata permission minimal:

- permission_id;
- domain;
- action;
- description;
- risk_level;
- required_scope;
- restricted flag;
- mandatory/optional;
- approval requirement;
- version.

## 5. Guardrails

Ada tiga kelas permission:

### STANDARD
Dapat dikonfigurasi Super Admin melalui check/uncheck sesuai policy.

### RESTRICTED
Memerlukan alasan, policy validation, dan dapat memerlukan second approval.

### SYSTEM-LOCKED
Tidak dapat diubah melalui console biasa karena merupakan kontrol keamanan inti.

Contoh SYSTEM-LOCKED:
- audit tampering;
- bypass authorization;
- root credential controls;
- disable mandatory audit;
- disable security logging.

## 6. Separation of Duties

Policy engine harus dapat menolak kombinasi permission tertentu.

Contoh:

```text
CREATE_REQUEST + APPROVE_SAME_REQUEST
```

tidak otomatis boleh berada pada user yang sama untuk workflow kritis.

Contoh lain:

```text
GENERATE_FINAL_DOCUMENT + APPROVE_FINAL_DOCUMENT
```

harus mengikuti authority matrix dan SOP yang telah disahkan.

## 7. Self-Escalation Protection

Super Admin tidak boleh secara default melakukan perubahan berbahaya terhadap dirinya sendiri secara langsung.

Untuk perubahan yang meningkatkan privilege actor:

```text
Proposed Change
      ↓
Privilege Escalation Check
      ↓
Step-up Authentication
      ↓
Second Approval (policy-dependent)
      ↓
Commit
```

Sistem juga harus mendeteksi:
- grant permission baru ke actor sendiri;
- grant `RBAC.POLICY.MANAGE` ke account baru;
- pembukaan restricted health domain;
- pengaktifan export sensitif;
- pembukaan impersonation/break-glass.

## 8. Policy Versioning

Setiap perubahan menghasilkan immutable policy version.

```text
v1.0
 ↓ change-set 001
v1.1
 ↓ change-set 002
v1.2
```

Policy version menyimpan:
- effective_at;
- author;
- reason;
- change set;
- before hash;
- after hash;
- approval reference;
- status.

Tidak boleh ada perubahan permission yang tidak mempunyai version reference.

## 9. Runtime Enforcement

Permission harus diperiksa di server-side boundary:

- route handler/server action;
- service layer;
- database/RLS bila relevan;
- document generation endpoint;
- download endpoint;
- export endpoint;
- admin/security endpoints.

Hiding menu/button di frontend bukan security control.

## 10. Cache / Session

Ketika policy berubah:

1. policy version bertambah;
2. authorization cache di-invalidasi;
3. session claims lama tidak boleh tetap memberi privilege yang sudah dicabut;
4. endpoint sensitif melakukan evaluation menggunakan policy terbaru atau versi yang konsisten;
5. perubahan dicatat dalam audit.

## 11. Restricted Data

Health records, biometric data, criminal-record-related data, dan data pribadi spesifik lain harus mempunyai policy domain tersendiri.

UU 27/2022 menggolongkan data kesehatan, biometrik, genetika, catatan kejahatan, data anak, dan data keuangan pribadi sebagai data pribadi spesifik. Karena itu ACP harus mendukung domain restriction dan field-level authorization, bukan sekadar role-level menu access.

## 12. Audit

Audit untuk perubahan authorization harus mencatat:

- actor;
- actor role;
- target role/user;
- permission added;
- permission removed;
- previous policy version;
- new policy version;
- reason;
- approval reference;
- timestamp;
- result;
- correlation ID;
- request/session reference sesuai policy.

Audit event bersifat append-only/tamper-evident.

## 13. Failure-Safe Defaults

Jika authorization service/policy lookup gagal:

- default = DENY untuk tindakan sensitif;
- tidak fallback ke cached permission yang lebih permisif;
- sistem menampilkan error operasional yang tidak membocorkan policy internal;
- incident dicatat.

## 14. Super Admin Console UX

Halaman:

`/admin/security/rbac`

Panel:

1. Role selector
2. Permission search
3. Domain filter
4. Risk filter
5. Scope filter
6. Permission table
7. Pending changes summary
8. Before/after diff
9. Reason field
10. Save button
11. Policy version history
12. Compare versions
13. Controlled rollback
14. Audit link

## 15. Recommended Permission Groups

### Identity & Administration
- identity.view
- identity.create
- identity.edit
- identity.verify
- documents.view
- documents.upload
- documents.generate
- documents.download

### Placement
- placement.view
- placement.assign
- placement.edit

### Movement
- movement.view
- movement.create
- movement.verify
- movement.execute
- headcount.execute

### Temporary Exit
- leave.view
- leave.create
- leave.edit
- leave.verify
- leave.approve
- leave.generate_document
- leave.download_document
- leave.record_departure
- leave.record_return
- leave.close

### Escort
- escort.view
- escort.create
- escort.assign
- escort.execute
- escort.record_result

### TU Document Administration
- escort_letter.verify
- escort_letter.generate
- escort_letter.register
- escort_letter.download
- escort_letter.distribute
- escort_letter.archive

### Health
- health.operational_flag.view
- health.restricted.view
- health.record.create
- health.record.edit
- health.record.verify
- health.history.view
- health.recommendation.create

### Leadership
- leadership.timeline.view
- leadership.instruction.create
- leadership.direction.create
- leadership.recommendation.create
- leadership.disposition.create
- leadership.followup.view

### Security
- audit.view
- audit.integrity.verify
- rbac.policy.view
- rbac.policy.manage

## 16. Recommended Implementation Order

1. Permission catalog.
2. Role baseline.
3. Policy guardrails.
4. Server-side authorization service.
5. Audit event model.
6. Super Admin Console.
7. Policy versioning.
8. Cache/session invalidation.
9. Authorization regression tests.
10. Privilege-escalation tests.
11. Rollback tests.

Jangan membuat UI RBAC terlebih dahulu lalu mencoba menempelkan security di belakangnya.

## 17. Acceptance Gate

ACP dianggap siap jika:

- semua critical endpoint server-side protected;
- permission catalog stabil;
- role matrix teruji;
- checkbox hanya memodifikasi pending policy state;
- Save atomic;
- privilege escalation tertolak;
- self-escalation protected;
- policy version tercatat;
- audit before/after tersedia;
- rollback terkontrol dan diaudit;
- restricted health domain tetap terisolasi;
- revoked permission efektif tanpa menunggu deployment baru;
- authorization failure default DENY.

## 18. Regulatory Alignment Note

MTA DETENI harus tetap menyesuaikan authority matrix dengan mandat organisasi dan peraturan/SOP yang berlaku. Permen Imipas No. 2 Tahun 2025 tentang Pengawasan Keimigrasian dan Tindakan Administratif Keimigrasian berstatus berlaku dan mencabut Permenkumham No. 4 Tahun 2017, sehingga referensi hukum dan SOP dalam implementation contract perlu menggunakan ketentuan yang berlaku saat deployment.
