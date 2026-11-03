# MTA DETENI — P9.3 RLS & Authorization Inventory 01
**Tanggal:** 2026-11-03  
**Basis pemeriksaan:** 26 file SQL pada `supabase/migrations/` di branch `audit/p93-auth-session-forensic-2026-11-03`.  
**Jenis audit:** static source forensic; bukan inspeksi database live, bukan bukti migration history telah diterapkan, dan bukan penetration test.

## 1. Tujuan dan batasan

Inventaris ini memetakan policy RLS, helper otorisasi, scope membership, serta Storage policy yang menjadi batas keamanan database. Fokus P9.3 adalah memastikan status autentikasi dan lifecycle kredensial tidak dapat dilewati melalui akses langsung PostgREST/RLS.

Pemeriksaan hanya membaca sumber repository. Tidak ada query atau perubahan ke database Supabase, tidak ada migration baru, tidak ada perubahan runtime, dan tidak ada deployment.

## 2. Ringkasan hasil

| Area | Hasil source inspection | Penilaian |
|---|---|---|
| Role helper | `private.mta_current_role()` membaca role profile aktif; SECURITY DEFINER | Ada helper terpusat, tetapi belum memasukkan forced-password-change atau session validity |
| Forced password change | Tidak ditemukan pemeriksaan `must_change_password` pada helper role database | **P0/P1 security gap**: API route guard tidak cukup untuk direct PostgREST |
| Scope membership | Diterapkan pada detainees, placements, movements, leaves, QR untuk EDITOR; OWNER/ADMIN dan AUDITOR memiliki bypass lintas-scope di beberapa policy | Kebijakan global bypass belum disepakati owner |
| Profile scopes | Pengguna dapat membaca membership sendiri; OWNER/ADMIN/AUDITOR dapat membaca seluruh membership | Admin/auditor read global; tidak ada policy write authenticated pada migration yang diperiksa |
| Documents | SELECT dibatasi berdasarkan role dan `created_by` untuk EDITOR/REVIEWER; write policy awal berbasis role tetap ada | Scope, classification, ownership untuk operasi tulis belum konsisten |
| Storage objects | Bucket dibatasi ke `mta-deteni-private`, tetapi role dapat membaca/menulis berdasarkan role saja | **High risk**: object ownership/scope/classification tidak ditegakkan pada object policy |
| Activity/health records | RLS diaktifkan, tidak ditemukan CREATE POLICY pada migration yang diperiksa | Fail-closed untuk authenticated, tetapi belum ada kontrak akses yang terbukti |
| Audit chain epochs | RLS diaktifkan, tidak ditemukan policy dalam migration yang diperiksa | Fail-closed bagi role biasa; akses operasional perlu diverifikasi melalui grants/service role |
| Blocks/rooms | SELECT bagi authenticated; write OWNER/ADMIN tanpa scope membership | Bypass scope lintas-scope |
| AI jobs | Policy `mta_ai_jobs_deny_all` untuk authenticated | Konsisten dengan AI_ENABLED=FALSE |

## 3. Helper otorisasi database

### 3.1 `private.mta_current_role()`

Migration awal mendefinisikan `public.mta_current_role()` sebagai SQL SECURITY DEFINER dengan `search_path = pg_catalog, public`, mengambil `role` dari `public.mta_profiles` untuk `id = auth.uid()` dan `active = true`. Migration berikutnya memindahkannya ke schema `private`, mengosongkan search_path, mencabut hak PUBLIC/anon/authenticated lalu memberikan EXECUTE kepada authenticated.

Konsekuensi:
- Helper hanya mengembalikan role aktif atau NULL.
- Tidak terlihat memeriksa `must_change_password`.
- Tidak terlihat memeriksa validitas `auth.sessions` / session_id.
- Helper ini tidak setara dengan policy P9.4 lengkap (permission, duty, scope, resource, state, policy).
- SECURITY DEFINER memerlukan audit ketat terhadap owner, privilege, search_path, grants dan semua objek yang disentuh.

### 3.2 Profile dan bootstrap

`mta_profiles` mempunyai role enum-like check: OWNER, ADMIN, EDITOR, REVIEWER, AUDITOR, VIEWER; default VIEWER; status active. Trigger `mta_bootstrap_profile` membuat profile saat Auth user dibuat. SELECT mengizinkan self atau OWNER/ADMIN/AUDITOR; UPDATE hanya OWNER/ADMIN.

Tidak ditemukan bukti dalam migration yang diperiksa bahwa profile helper memuat flag forced-password-change. P93-A01 tetap valid sebagai temuan source-level.

## 4. Inventaris policy berdasarkan resource

### 4.1 Identity dan scope

| Table | RLS | Policy / rule yang ditemukan | Catatan |
|---|---|---|---|
| `public.mta_profiles` | Enabled | SELECT self atau OWNER/ADMIN/AUDITOR; UPDATE OWNER/ADMIN | Role helper tidak memeriksa must_change_password |
| `public.mta_scopes` | Enabled | SELECT OWNER/ADMIN/AUDITOR atau membership aktif pada scope | Admin/auditor global read |
| `public.mta_profile_scopes` | Enabled | SELECT self atau OWNER/ADMIN/AUDITOR | Tidak ada policy write authenticated yang ditemukan pada 26 migration |
| `public.mta_qr_registry` | Enabled | SELECT global OWNER/ADMIN/AUDITOR atau scope detainee; ALL OWNER/ADMIN atau EDITOR dengan membership aktif | OWNER/ADMIN bypass membership |

### 4.2 Data operasional

| Table | RLS | SELECT | INSERT / UPDATE | DELETE |
|---|---|---|---|---|
| `mta_detainees` | Enabled | OWNER/ADMIN/AUDITOR global; lainnya membership aktif pada scope detainee | OWNER/ADMIN global; EDITOR wajib membership aktif | OWNER/ADMIN; policy expression mengandung kondisi scope tambahan yang redundan karena role telah membatasi OWNER/ADMIN |
| `mta_placements` | Enabled pada migration foundation | OWNER/ADMIN/AUDITOR global; lainnya membership scope detainee terkait | OWNER/ADMIN global; EDITOR wajib membership | OWNER/ADMIN |
| `mta_movements` | Enabled pada migration foundation | OWNER/ADMIN/AUDITOR global; lainnya membership scope detainee terkait | OWNER/ADMIN global; EDITOR wajib membership | OWNER/ADMIN |
| `mta_leaves` | Enabled pada migration foundation | OWNER/ADMIN/AUDITOR global; lainnya membership scope detainee terkait | OWNER/ADMIN global; EDITOR wajib membership | OWNER/ADMIN |
| `mta_documents` | Enabled dari foundation | Policy SELECT terbaru: OWNER/ADMIN/AUDITOR global; EDITOR/REVIEWER hanya jika created_by = auth.uid() | Policy awal OWNER/ADMIN/EDITOR masih ada pada migration source | Policy awal OWNER/ADMIN |
| `mta_blocks` | Enabled | authenticated | OWNER/ADMIN tanpa scope | OWNER/ADMIN tanpa scope |
| `mta_rooms` | Enabled | authenticated | OWNER/ADMIN tanpa scope | OWNER/ADMIN tanpa scope |

**Catatan RLS enablement:** policy yang didefinisikan tidak otomatis membuktikan RLS aktif pada tabel. Migration scope-hardening yang diperiksa tidak memuat `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` untuk placements, movements, dan leaves. Status live harus diverifikasi dari katalog PostgreSQL sebelum menyatakan proteksi database efektif.

### 4.3 Audit dan storage

| Table/resource | RLS | Policy / rule | Temuan |
|---|---|---|---|
| `mta_audit_events` | Enabled | SELECT OWNER/ADMIN/AUDITOR | Write melalui jalur internal/trigger/service role; policy SELECT bukan bukti seluruh write path |
| `mta_storage_objects` | Enabled | SELECT OWNER/ADMIN/EDITOR/REVIEWER/AUDITOR pada policy awal; policy SELECT kemudian membatasi EDITOR/REVIEWER ke dokumen yang dibuat sendiri; INSERT OWNER/ADMIN/EDITOR | Policy INSERT tidak memeriksa scope/ownership/classification |
| `storage.objects` | Dikelola Supabase Storage | SELECT pada bucket private untuk OWNER/ADMIN/EDITOR/REVIEWER/AUDITOR; INSERT/UPDATE OWNER/ADMIN/EDITOR; DELETE OWNER/ADMIN | Policy object tidak mengikat object ke `mta_storage_objects`, `mta_documents`, owner, scope, atau classification |
| `mta_ai_jobs` | Enabled | `mta_ai_jobs_deny_all` untuk authenticated | Deny-all sesuai AI disabled |
| `mta_detainee_activity_notes` | Enabled | Tidak ditemukan CREATE POLICY pada 26 migration | Authenticated tidak memiliki policy akses yang terlihat; service-role path perlu diuji |
| `mta_detainee_health_records` | Enabled | Tidak ditemukan CREATE POLICY pada 26 migration | Sama; tidak boleh diasumsikan dapat diakses |
| `mta_audit_chain_epochs` | Enabled | Tidak ditemukan CREATE POLICY pada migration epoch | Fail-closed bagi authenticated; akses internal/grants perlu diverifikasi |

## 5. Temuan prioritas

### RLS-01 — Forced password change tidak berada di database authorization boundary
**Severity: Critical / P0 untuk akses langsung.**  
`private.mta_current_role()` hanya memeriksa profile aktif dan role. Tidak ada pemeriksaan `must_change_password` maupun session validity. Karena policy banyak bergantung pada helper ini, pengguna yang diwajibkan mengganti password berpotensi tetap memenuhi RLS melalui PostgREST selama JWT valid.

**Kebutuhan remediasi:** helper/authorization predicate database harus menolak seluruh resource operasional saat forced-change aktif; hanya jalur credential-change yang sangat terbatas yang boleh lolos. Perlu tes langsung PostgREST, bukan hanya API route test.

### RLS-02 — OWNER/ADMIN mempunyai bypass lintas-scope implisit
**Severity: High; keputusan owner diperlukan.**  
Detainee, placement, movement, leave, QR, block dan room policies memberikan akses global kepada OWNER/ADMIN; beberapa SELECT juga memberikan akses global kepada AUDITOR. Ini bertentangan dengan model scope-membership wajib yang pernah diusulkan, tetapi keputusan final owner belum tercatat.

**Keputusan yang harus ditetapkan:** apakah semua akses operasional scoped wajib memiliki active membership, dan cross-scope hanya melalui permission global khusus yang diaudit. Jangan ubah policy sebelum keputusan owner.

### RLS-03 — Storage object authorization hanya role + bucket
**Severity: High.**  
Policy `storage.objects` membatasi bucket, bukan object ownership, document relationship, scope, classification, atau operation purpose. Hardening SELECT pada `mta_storage_objects` metadata tidak otomatis mengamankan row `storage.objects`.

**Remediasi desain:** object policy harus mengikat path/object ke metadata canonical dan dokumen yang sah, serta memvalidasi scope dan klasifikasi. Perlu uji download, upload, update, delete lintas user/scope.

### RLS-04 — FORCE ROW LEVEL SECURITY dan bypass privilege belum dibuktikan
**Severity: Medium / evidence gap.**  
Migration source mengaktifkan RLS pada tabel operasional utama, termasuk detainees, placements, movements, leaves, documents, audit, storage metadata dan AI jobs. Namun source yang diperiksa tidak membuktikan bahwa `FORCE ROW LEVEL SECURITY` diterapkan atau bahwa owner/service-role bypass semantics telah diuji. Ini bukan otomatis defect: service-role/internal command paths mungkin memang memerlukan bypass, tetapi harus dibatasi dan dibuktikan.

**Remediasi evidence:** query katalog read-only untuk `relrowsecurity`, `relforcerowsecurity`, owner, grants, dan `pg_policies`; uji role authenticated dan service-role path secara terpisah. Jangan menganggap source file = state live.

### RLS-05 — Activity/health records dan audit epochs fail-closed, belum punya kontrak akses
**Severity: Medium / readiness blocker.**  
RLS aktif tetapi tidak ditemukan policy pada migration source. Ini aman secara default untuk authenticated, tetapi dapat menyebabkan fitur tidak berfungsi atau bergantung pada service-role bypass yang harus dibuktikan.

**Remediasi desain:** tetapkan read/write actor, scope, classification, audit behavior dan jalur internal sebelum menambahkan policy.

### RLS-06 — Documents write policy lebih luas dari SELECT policy
**Severity: High.**  
SELECT dibatasi berdasarkan role/creator, sedangkan INSERT/UPDATE/DELETE policy awal berbasis role OWNER/ADMIN/EDITOR tanpa creator/scope. Service/API layer restrictions tidak menggantikan direct PostgREST boundary.

### RLS-07 — SECURITY DEFINER dan grants perlu review terpadu
**Severity: High.**  
Fungsi seperti `private.mta_current_role`, `public.mta_resolve_qr`, mutation RPC dan audit trigger menggunakan SECURITY DEFINER. Perlu inventory owner, EXECUTE grants, fixed search_path, schema exposure, input trust, dan privilege escalation. Tidak boleh menganggap SECURITY DEFINER aman hanya karena function berada di schema private.

## 6. Keterkaitan dengan P9.3

| P9.3 control | Hasil inventaris |
|---|---|
| Active profile | Ada melalui `mta_current_role()` |
| Forced password change | Tidak ditegakkan helper database |
| Session revocation | Tidak ada session_id validity predicate pada helper/policy yang diperiksa |
| Login throttling | Tidak dapat disimpulkan dari RLS; tetap P93-A03 |
| Durable auth audit | Policy SELECT audit ada; lifecycle auth event harus dinilai pada auth runtime/outbox |
| Credential change exception | Belum ditemukan database policy contract yang membatasi hanya jalur credential-change |
| Direct PostgREST denial | Belum ada bukti test yang menutup gap forced password change |

## 7. Evidence yang masih diperlukan

Semua berikut adalah read-only evidence, harus diambil dari project/environment yang secara eksplisit ditetapkan dan diberi label. Jangan menyisipkan credential atau PII ke laporan.

1. `pg_class.relrowsecurity` dan `relforcerowsecurity` untuk seluruh tabel `public` yang disebut di atas.
2. `pg_policies` lengkap untuk `public` dan `storage`, termasuk permissive/restrictive mode, roles, cmd, qual, with_check.
3. Table/sequence/function grants untuk anon, authenticated, service_role, dan owner.
4. Function definitions, owner, SECURITY DEFINER, proconfig/search_path, EXECUTE grants.
5. Supabase migration history dan kesesuaian dengan 26 file repository.
6. Storage bucket configuration, object path conventions, dan object metadata relation.
7. Integration tests langsung menggunakan authenticated JWT dengan role/scope berbeda dan forced-change state.
8. Negative tests untuk cross-scope read/write, storage object access, dan unauthenticated access.

## 8. Keputusan dan rekomendasi

**Keputusan owner yang belum boleh diasumsikan:**
- Apakah OWNER/ADMIN/AUDITOR harus memiliki active scope membership untuk akses operasional scoped?
- Apakah cross-scope oversight diberikan melalui permission global khusus dengan audit?
- Apakah old access JWT harus langsung ditolak pada resource operasional setelah reset password, melalui session_id check?

**Rekomendasi urutan kerja:**
1. Tetapkan keputusan scope dan access-token revocation.
2. Lakukan read-only live catalog verification untuk RLS enablement/policies/grants.
3. Buat P9.3 remediation migration design (belum apply) untuk forced-password-change DB gate dan session validity.
4. Buat storage authorization contract terpisah.
5. Tambahkan integration negative tests dan failure injection.
6. Baru ajukan migration PR setelah owner approval, migration freeze dicabut secara eksplisit, dan CI/gate disetujui.

## 9. Status kontrol

- `MIGRATION_FREEZE = TRUE`
- `AI_ENABLED = FALSE`
- Production write gate: OFF
- Runtime implementation: NOT AUTHORIZED
- Database migration/apply: NOT AUTHORIZED
- Deployment: NOT AUTHORIZED
- P9.3: FORENSIC IN PROGRESS — NOT CERTIFIED

**Kesimpulan:** policy RLS saat ini menunjukkan fondasi role dan scope, tetapi belum membuktikan enforcement P9.3 secara end-to-end. Temuan paling kritis adalah forced-password-change tidak berada pada database authorization boundary, disusul bypass lintas-scope OWNER/ADMIN, Storage object policy yang tidak mengikat ownership/scope, serta bukti RLS enablement tabel operasional yang belum lengkap.
