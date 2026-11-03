# MTA DETENI — P9.3 Live Authorization Evidence 01
**Tanggal pemeriksaan:** 2026-11-03  
**Project:** MTA DETENI — `tmmhxqgzelgrsrxbbfzh`  
**Environment:** Supabase project aktif; pemeriksaan katalog dan konfigurasi read-only  
**Jenis evidence:** live database metadata, migration history, Security Advisor. Tidak termasuk pengujian request PostgREST memakai JWT per-role.

## 1. Safety boundary

Seluruh operasi pada sesi pemeriksaan ini adalah read-only:
- Membaca project metadata, migration history, table inventory, PostgreSQL catalogs, grants, function definitions, dan Security Advisor.
- Tidak menjalankan DDL/DML.
- Tidak mengubah Auth settings, Storage, RLS, policies, grants, atau data.
- Tidak melakukan deployment.

Status governance tetap:
- `MIGRATION_FREEZE = TRUE`
- `AI_ENABLED = FALSE`
- Production write gate = OFF
- Migration/apply = NOT AUTHORIZED

## 2. Project metadata

Project `tmmhxqgzelgrsrxbbfzh`:
- Name: MTA DETENI
- Status: `ACTIVE_HEALTHY`
- PostgreSQL: 17.6.1.166
- Region: `ap-southeast-1`

## 3. Migration history reconciliation

Supabase migration history mengembalikan **44 migration entries**. Pemeriksaan source repository pada branch audit sebelumnya menemukan **26 SQL migration files** di `supabase/migrations/`.

Ini adalah perbedaan jumlah 18 entry. Pencocokan nama normalisasi awal menemukan 23 live entries yang memiliki pasangan nama file di repository, 21 live entries tanpa pasangan nama file, dan 3 file repository tanpa pasangan nama live. Pencocokan nama bukan pembuktian kesamaan SQL; beberapa file repository memiliki timestamp berbeda dari versi migration live. Ini adalah provenance gap yang wajib direkonsiliasi sebelum source repository dianggap merepresentasikan seluruh schema history live.

Beberapa live migration yang tercatat tidak tampak pada daftar source SQL yang sebelumnya diperiksa, termasuk:
- QR resolver active/expiry hardening
- authenticated domain table grants
- QR resolver invoker hardening
- QR registry policy performance hardening
- audit events authenticated read grant
- durable idempotency boundary v1–v3
- outbox event identity/dispatcher
- document storage read hardening v2
- audit hash chain v2
- direct-write containment dan privileged movement execute containment
- audit service-role grants
- initial OWNER/ADMIN NIP assignment dan audit assignment

**Required action:** build exact version/name/file reconciliation matrix dari seluruh 44 live entries terhadap repository history. Jangan membuat migration baru atau mengubah migration history untuk menutup selisih.

### 3.1 Hasil pencocokan nama awal

**23/44** live entries mempunyai pasangan nama file berdasarkan normalisasi nama. **21 live entries** belum memiliki pasangan nama file yang cocok, antara lain QR resolver hardening, authenticated grants, P9.7/P9.8 idempotency/outbox, document storage hardening v2, audit hash chain v2, privileged movement containment, audit service-role grants, serta dua migration initial OWNER/ADMIN NIP assignment. **3 file repository** belum mempunyai pasangan nama live berdasarkan normalisasi: `mta_document_storage_read_hardening.sql`, `mta_audit_hash_chain_v1.sql`, dan `mta_scope_metadata_admin_config_v1.sql`.

Hasil ini hanya pencocokan nama, bukan penilaian isi SQL atau status commit. Tahap berikutnya harus membandingkan SQL effects dan commit history sebelum mengklasifikasikan source missing atau reconstructed equivalent.

## 4. Live table/RLS evidence

Supabase table inventory mengonfirmasi RLS aktif pada tabel utama berikut:
- `mta_detainees`
- `mta_placements`
- `mta_movements`
- `mta_leaves`
- `mta_documents`
- `mta_audit_events`
- `mta_storage_objects`
- `mta_profiles`
- `mta_scopes`
- `mta_profile_scopes`
- `mta_qr_registry`
- `mta_blocks`
- `mta_rooms`
- `mta_ai_jobs`
- `mta_ai_config`
- `mta_audit_chain_epochs`
- `mta_detainee_activity_notes`
- `mta_detainee_health_records`

Katalog PostgreSQL menunjukkan tabel yang diperiksa dimiliki role `postgres`; `relrowsecurity=true` dan `relforcerowsecurity=false` untuk seluruh tabel target yang dikembalikan. Artinya RLS diaktifkan tetapi tidak dipaksa terhadap table owner. Ini lazim untuk owner-level maintenance, namun service-role/owner bypass harus tetap dibatasi melalui jalur aplikasi dan diuji terpisah.

## 5. Live policy findings

### 5.1 Forced password change — confirmed gap

Definisi live `private.mta_current_role()`:

```sql
select role
from public.mta_profiles
where id = auth.uid()
  and active = true
limit 1
```

Helper tidak memeriksa `must_change_password` dan tidak memvalidasi session_id. Kolom `must_change_password` memang ada di `mta_profiles`, tetapi tidak terintegrasi dalam helper role.

Snapshot agregat saat pemeriksaan:
- Total profiles: 2
- `must_change_password = true`: 0
- `must_change_password = false`: 2
- NULL: 0

Angka tersebut hanya snapshot metadata agregat; tidak ada identitas atau nilai kredensial yang diambil. Keberadaan dua profile dengan flag false tidak membuktikan jalur forced-change aman untuk kondisi true.

**Kesimpulan:** P93-A01 dikonfirmasi pada live database definition. Ini adalah gap authorization boundary, walaupun pada snapshot saat ini tidak ada profile yang sedang forced-change.

### 5.2 Session validity — no database predicate found

- `auth.sessions` tersedia.
- Pemeriksaan definisi function pada schema `public`, `private`, dan `mta_internal` tidak menemukan helper yang membaca `auth.sessions` atau claim `session_id`.
- `private.mta_current_role()` tidak memeriksa session validity.

**Kesimpulan:** belum ada bukti live bahwa old access JWT langsung ditolak pada database authorization boundary setelah password reset/session revocation. Ini menguatkan P93-A02/P93-A04 sebagai remediation requirement, bukan bukti bahwa seluruh session behavior Auth sudah gagal.

### 5.3 Cross-scope bypass — confirmed in live policies

Policy live mengizinkan:
- OWNER/ADMIN global access pada detainee, placement, movement, leave, QR, block dan room sesuai command policy.
- AUDITOR global SELECT pada sejumlah resource.
- EDITOR menggunakan membership aktif untuk resource scoped tertentu.

Policy `mta_blocks_select_scope` dan `mta_rooms_select_scope` secara eksplisit memberi akses OWNER/ADMIN/AUDITOR lintas scope. Write policy blocks/rooms mengizinkan OWNER/ADMIN tanpa membership.

Ini adalah perilaku aktual policy, bukan sekadar dugaan dari source. Apakah perilaku tersebut sesuai business policy masih membutuhkan keputusan owner.

### 5.4 Storage — private bucket, role-only object authorization

Bucket `mta-deteni-private`:
- `public=false`
- File size limit: 10,485,760 bytes (10 MiB)
- MIME allowlist: JPEG, PNG, WEBP, PDF

Policy live pada `storage.objects`:
- SELECT: OWNER/ADMIN/EDITOR/REVIEWER/AUDITOR
- INSERT: OWNER/ADMIN/EDITOR
- UPDATE: OWNER/ADMIN/EDITOR
- DELETE: OWNER/ADMIN
- Seluruh policy membatasi bucket ke `mta-deteni-private`, tetapi tidak mengikat object ke canonical document, creator, scope membership, atau classification.

Tabel `mta_storage_objects` memiliki kolom `document_id`, `classification`, `object_path`, `bucket_id`, hash dan metadata lainnya. SELECT policy metadata membatasi EDITOR/REVIEWER berdasarkan dokumen yang dibuat sendiri, tetapi object policy tidak mengulang hubungan tersebut.

**Kesimpulan:** bucket private tidak sama dengan per-object authorization. RLS Storage harus mengikat object path/metadata ke canonical document dan scope.

### 5.5 RLS enabled without policies — Advisor confirmed

Security Advisor menghasilkan enam temuan:
1. `mta_internal.idempotency_keys`
2. `mta_internal.outbox_events`
3. `public.mta_ai_config`
4. `public.mta_audit_chain_epochs`
5. `public.mta_detainee_activity_notes`
6. `public.mta_detainee_health_records`

Semua terdeteksi RLS enabled tanpa policy. Grant snapshot menunjukkan service_role memiliki privilege SELECT/INSERT/UPDATE/DELETE yang sesuai untuk internal idempotency/outbox; activity/health records memiliki SELECT/INSERT service_role. Untuk tabel yang tidak memiliki policy authenticated, akses client biasa diharapkan tertolak. Perlu review bahwa service-role hanya dipakai dari trusted server-side path.

AI config tidak memiliki policy authenticated dan Advisor mencatat RLS enabled/no policy. Ini konsisten dengan fail-closed client access, tetapi belum membuktikan seluruh AI provider execution path nonaktif. Governance `AI_ENABLED=FALSE` tetap berlaku.

### 5.6 Leaked Password Protection

Security Advisor memberi WARN: `auth_leaked_password_protection` — Leaked Password Protection Disabled. Supabase Auth tidak sedang memblokir password yang diketahui compromised melalui pemeriksaan yang ditawarkan fitur tersebut.

Ini adalah konfigurasi Auth yang perlu keputusan administrator. Tidak diubah dalam audit ini.

## 6. SECURITY DEFINER / function privilege snapshot

Live function catalog menunjukkan:
- `private.mta_current_role()`: SECURITY DEFINER, owner postgres, search_path kosong, EXECUTE diberikan kepada authenticated.
- `public.mta_execute_movement_transaction(...)`: SECURITY DEFINER, EXECUTE hanya postgres/service_role.
- `mta_internal.execute_movement_transaction(...)`: SECURITY DEFINER, EXECUTE hanya postgres/service_role.
- `public.mta_create_detainee_note_transaction(...)`: SECURITY DEFINER, EXECUTE hanya postgres/service_role.
- `public.mta_verify_audit_integrity()`: SECURITY DEFINER, EXECUTE hanya postgres/service_role.
- Beberapa trigger function audit pada schema private memiliki default PUBLIC EXECUTE ACL; schema usage dan trigger-only invocation harus ditinjau bersama sebelum menyatakan exposure. Jangan menilai function privilege hanya dari ACL tanpa schema USAGE dan effective role inheritance.

Fungsi mutation RPC sensitif tampak dibatasi ke service_role/postgres. Ini merupakan kontrol positif, tetapi perlu memastikan caller identity, actor_user_id, request correlation, dan authorization dilakukan di trusted server-side boundary; jangan menerima actor identity dari caller tanpa verifikasi.

## 7. Security Advisor summary

| Advisor | Level | Count | Interpretasi |
|---|---|---:|---|
| RLS Enabled No Policy | INFO | 6 | Fail-closed untuk client roles, tetapi akses internal dan intended ownership perlu dibuktikan |
| Leaked Password Protection Disabled | WARN | 1 | Auth configuration hardening belum aktif |

Tidak ada perubahan konfigurasi yang dilakukan.

## 8. Updated findings

| ID | Status setelah live inspection | Prioritas |
|---|---|---|
| P93-A01 / RLS-01 | CONFIRMED: role helper tidak memeriksa `must_change_password` | Critical |
| P93-A02/A04 session boundary | CONFIRMED GAP: tidak ditemukan session_id validation helper di DB | High |
| RLS-02 cross-scope | CONFIRMED POLICY BEHAVIOR; owner policy decision pending | High |
| RLS-03 Storage | CONFIRMED: bucket private, object policies role-only | High |
| RLS-04 force RLS | CONFIRMED: RLS true, FORCE false pada target tables | Evidence/architecture |
| RLS-05 records/epochs | CONFIRMED: 4 public/internal tables tanpa policy; Advisor count total 6 | Medium |
| RLS-06 document write | CONFIRMED: UPDATE/INSERT/DELETE lebih luas daripada SELECT creator restriction | High |
| Migration provenance | CONFIRMED COUNT GAP: 44 live entries vs 26 source SQL files | High |
| Auth leaked password | CONFIRMED Advisor WARN | Medium |

## 9. Remaining verification — not yet performed

- No JWT-per-role direct PostgREST negative test has been run.
- No Storage upload/download cross-scope test has been run.
- No Auth session revocation test (old access token vs refresh token) has been run.
- No owner-level/service-role bypass behavior test has been run.
- No exact 45-entry migration provenance matrix has been completed.
- No live Auth rate-limit configuration inspection has been performed.

## 10. Next controlled work package

**WP2.1 — Migration Provenance Reconciliation**
1. Retrieve all 45 live migration entries and repository migration paths.
2. Match by version, normalized name, commit history, and SQL effect.
3. Mark entries as exact match, reconstructed equivalent, source missing, or live-only.
4. No attempt to repair history or apply SQL.

**WP2.2 — Runtime Authorization Test Contract**
1. Prepare JWT role/scope test matrix.
2. Test forced-change direct PostgREST denial only in isolated staging/test environment.
3. Test cross-scope read/write and storage object isolation in staging.
4. Test refresh-session revocation vs already-issued access JWT behavior.
5. Preserve production read-only status until explicit approval.

**Overall:** P9.3 remains FORENSIC IN PROGRESS — NOT CERTIFIED.
