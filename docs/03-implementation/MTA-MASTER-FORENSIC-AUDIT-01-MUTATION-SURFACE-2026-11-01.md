# MTA DETENI — Master Forensic Audit 01: Mutation Surface

- Audit date: 2026-11-01
- Repository: `galleryabah-source/MTA-Deteni`
- Baseline branch: `main`
- Baseline commit: `4ce5a330ec89f90dac9bc7f8f87d1fabdc6ae866`
- Audit branch: `audit/master-forensic-mutation-surface-2026-11-01`
- Status: **FORENSIC FINDINGS RECORDED — MUT-001/MUT-002 REMEDIATED; REMAINING FINDINGS OPEN**
- Remediation PR: [#334](https://github.com/galleryabah-source/MTA-Deteni/pull/334), merged 2026-11-01 as `5105d57760d8b6c89150cabf1671e8f8cf98ad3c`.
- Production writes: remain fail-closed. Do not change `MTA_PRODUCTION_WRITES_ENABLED`.
- Migration freeze: remains in force. No migration or production deployment is authorized by this report.

## 1. Executive conclusion

The repository has a substantial canonical mutation foundation: server-side authentication, role checks, scoped authorization, idempotency keys, transaction RPCs, audit events, outbox events, and immutable audit history are present in multiple paths.

The remaining risk is unevenness between mutation paths. Core domain commands (notably movement and detainee notes) use database transaction functions that write domain state, audit, outbox, and idempotency state together. Several administrative and identity paths still perform separate Supabase Auth / table / audit operations. Backup and restore contracts are also inconsistent with the newer activity/health domains and immutable audit ledger.

This is a **source-level forensic audit**. It does not prove production runtime state, deployed Edge Function version, production schema state, or live data integrity.

## 2. Scope and evidence inspected

- `supabase/functions/mta-api/index.ts`
- `supabase/functions/mta-login/index.ts`
- `supabase/migrations/20260921070000_mta_production_auth_rbac_v1.sql`
- `supabase/migrations/20260923041000_mta_audit_hash_chain_v1.sql`
- `supabase/migrations/20260927123000_mta_transactional_movement_v1.sql`
- `supabase/migrations/20261002040000_mta_audit_sequence_v1.sql`
- `supabase/migrations/20261013090000_mta_detainee_activity_health_records_v1.sql`
- `supabase/migrations/20260923040000_mta_document_storage_read_hardening.sql`
- `docs/03-implementation/P9.9-PRIVATE-STORAGE-KERNEL-v1.0.md`
- `src/application/private-storage-contract.ts`
- `docs/03-implementation/P9.7-recovered-migration-sources/20260922220754_mta_p97_durable_idempotency_transaction_boundary_v3.sql`
- `docs/03-implementation/P9.7-recovered-migration-sources/20260922220814_mta_p97_durable_idempotency_rpc_wrapper_v1.sql`
- `supabase/operations/mta_backup_restore_transaction_v1.sql`
- `test/p1-authorization-kernel-regression.test.mjs`
- `test/p9.7-canonical-boundary-regression.test.mjs`
- `test/production-auth-rbac-api.test.mjs`
- `test/user-management-feature.test.mjs`
- `FEATURE_INVENTORY.md`

Related release state at audit time:
- PR #332 is open and not merged. Its scope is release metadata / deployment-gate truthfulness, not mutation remediation.
- PR #331 is merged. Its description explicitly says the activity/health migration and API were not yet applied to Supabase production and must remain behind their release gates.

## 3. Findings

### MUT-001 — Editor update of a detainee is rejected by the generic scope resolver

- Severity: **HIGH**
- Status: **REMEDIATED** in PR #334; merged commit `5105d57760d8b6c89150cabf1671e8f8cf98ad3c`. All 8 PR CI workflows passed. Static route/scope regression tests were added; isolated database role/scope integration remains required.
- Evidence: `supabase/functions/mta-api/index.ts`, `authorizeGenericMutation`.
- The resolver selects `detainee_id,scope_id` from `mta_detainees` when `resource === "detainees"`. The detainee root row is identified by `id`; it does not have the child-resource `detainee_id` column.
- For an EDITOR performing PATCH, the query can fail and the resolver returns `RESOURCE_NOT_FOUND`, even where the detainee belongs to the editor's active scope. OWNER/ADMIN bypass this branch, which can conceal the defect in owner-only tests.
- The route performs a separate scope lookup before the resolver, but that does not correct the invalid column selection inside the resolver.
- Existing P1 authorization test checks source markers and ordering; it does not exercise this editor/PATCH database-query shape.

**Required remediation**
1. Read the detainee root using `scope_id` (and its primary key) only.
2. Keep the requested/current scope comparison server-side.
3. Add positive EDITOR PATCH in-scope test, negative cross-scope PATCH test, missing-row test, and OWNER/ADMIN regression tests.
4. Verify DELETE remains OWNER/ADMIN-only.

### MUT-002 — Admin password-reset route is shadowed by the generic POST/create-user branch

- Severity: **HIGH**
- Status: **REMEDIATED** in PR #334; merged commit `5105d57760d8b6c89150cabf1671e8f8cf98ad3c`. All 8 PR CI workflows passed. Route-dispatch regression tests were added; authenticated password-reset UAT remains required.
- Evidence: `supabase/functions/mta-api/index.ts`, `resource === "admin-users"`.
- The `if (req.method === "POST")` create-user branch appears before `if (req.method === "POST" && id && routeParts[2] === "password-reset")`.
- The create-user branch returns for invalid/missing NIP, so the later password-reset branch is unreachable for the intended POST route.
- The existing user-management test checks that password reset-related code exists only indirectly; it does not assert route dispatch precedence or execute the route.

**Required remediation**
1. Dispatch the exact password-reset route before the collection POST route, or use explicit route matching.
2. Add route tests for POST collection create, POST item password-reset, PATCH item update, and unknown subroutes.
3. Assert password reset never enters NIP/create-user validation.
4. Keep temporary credentials out of logs, telemetry, and persisted browser state; define a one-time display/expiry policy.

### MUT-003 — Several identity and administrative writes are not atomic with mandatory audit

- Severity: **HIGH**
- Evidence: `supabase/functions/mta-api/index.ts`.
- `/me` PATCH updates `mta_profiles` and then attempts an audit insert; the audit result is not checked.
- `/me` password change updates the Supabase Auth password, updates profile password state, revokes sessions, and inserts audit as separate operations. A partial failure can leave Auth and profile state inconsistent, and audit failure is not treated as a failed evidence write.
- `admin-users` create writes Auth user, profile, then audit; audit failure is not checked.
- `admin-users` PATCH updates the profile, optionally revokes sessions, then inserts audit without checking the audit result.
- Password reset checks the audit error only to emit a warning, but still returns success.
- `admin-config` and `ai-config` update configuration before a separate audit insert and do not require the audit insert to succeed.
- AI secret mutation and AI configuration mutation are also separate steps; a later configuration failure can leave secret/config state divergent.

**Required remediation**
1. Classify each operation as a database-only transaction or a cross-system saga.
2. For database-only changes, use a single transactional RPC that validates, mutates, writes mandatory audit, and writes outbox/idempotency state.
3. For Supabase Auth + PostgreSQL operations, use an explicit saga/compensation design with operation state, mandatory evidence, retry/reconciliation, and safe recovery. Do not claim a distributed transaction exists.
4. Treat mandatory audit failure as a failed operation or an explicitly recoverable pending state; never silently return a fully successful result.
5. Add failure-injection tests at every boundary.

### MUT-004 — Backup export is not a proven complete, consistent snapshot

- Severity: **CRITICAL**
- Evidence: `supabase/functions/mta-api/index.ts`, `resource === "backup"`.
- The API reads each table with `select("*")` and no explicit pagination or completeness assertion.
- Reads are issued in parallel with `Promise.all`, not under one database snapshot/transaction. Concurrent writes can therefore make the exported tables represent different points in time.
- The backup response includes a payload fingerprint, but a fingerprint only proves the returned payload has not changed; it does not prove the payload is complete or transactionally consistent.
- The source does not provide evidence of a row-count reconciliation against database counts or a stable snapshot identifier.

**Required remediation**
1. Move backup extraction into a server-side database snapshot/export boundary with a consistent snapshot.
2. Include deterministic pagination or database-side aggregation with explicit maximum-size handling.
3. Record per-table row counts, schema/version, scope identity, snapshot timestamp/ID, and a complete manifest.
4. Fail closed when any table is truncated, inaccessible, or exceeds the supported export size.
5. Test datasets above API row limits and concurrent mutation during backup.

### MUT-005 — Activity notes and health records are missing from backup and restore roots

- Severity: **CRITICAL**
- Evidence:
  - `supabase/functions/mta-api/index.ts`, backup table list and restore root validation.
  - `supabase/operations/mta_backup_restore_transaction_v1.sql`, required payload roots and restore statements.
  - `supabase/migrations/20261013090000_mta_detainee_activity_health_records_v1.sql`.
- The activity/health migration creates `mta_detainee_activity_notes` and `mta_detainee_health_records`.
- The current backup API table list contains only detainees, blocks, rooms, movements, placements, leaves, documents, and audit.
- The restore SQL requires and restores the same older eight roots. It does not export or restore activity notes or health records.
- These records are sensitive operational/health data; their omission would make the backup incomplete for the current domain model.

**Required remediation**
1. Extend the backup manifest and snapshot contract to include all approved durable domains, including activity and health records.
2. Apply role/classification protections to backup generation, storage, download, and restore.
3. Restore parent/child rows in FK-safe order and verify counts/fingerprints.
4. Do not apply the activity/health migration to production as part of this remediation without separate migration approval.

### MUT-006 — Restore operation conflicts with immutable audit triggers

- Severity: **CRITICAL**
- Evidence:
  - `supabase/migrations/20260923041000_mta_audit_hash_chain_v1.sql` defines BEFORE UPDATE and BEFORE DELETE triggers that always raise `AUDIT_IMMUTABLE_HISTORY`.
  - `supabase/operations/mta_backup_restore_transaction_v1.sql` deletes from `public.mta_audit_events`.
  - The restore artifact comment states audit triggers remain enabled.
- If the immutable trigger is present, the restore statement that deletes the audit ledger raises an exception and rolls back the restore transaction.
- The restore artifact is explicitly marked as a controlled operation artifact, not automatically applied. This finding is a source-contract incompatibility; no claim is made that the function is deployed or has been executed.

**Required remediation**
1. Never truncate or delete immutable audit history as part of ordinary domain restore.
2. Design restore around a new audit epoch / signed historical anchor, preserving the existing ledger.
3. Separate domain-state restoration from audit-ledger archival/reconciliation.
4. Add a database integration test that applies the immutable triggers and executes the restore procedure against a disposable database.

### MUT-007 — Backup restore writes duplicate BACKUP_RESTORE audit events

- Severity: **HIGH**
- Evidence:
  - `supabase/operations/mta_backup_restore_transaction_v1.sql` inserts a `BACKUP_RESTORE` audit event inside the restore transaction.
  - `supabase/functions/mta-api/index.ts`, after the RPC succeeds, inserts another `BACKUP_RESTORE` event.
- A successful first restore can therefore produce two success events for one restore operation.
- The Edge Function also inserts its extra event when the RPC reports a replay, so replay attempts can add additional events.

**Required remediation**
1. Select one canonical audit writer. Prefer the transaction RPC as the owner of the restore state transition and its audit event.
2. Return the canonical audit event ID from the RPC.
3. Do not append a second success event in the Edge Function.
4. Test first execution, replay, RPC failure, and audit failure.

### AUD-001 — Audit sequence verifier can reject valid transactions after rollback

- Severity: **HIGH**
- Evidence: `supabase/migrations/20261002040000_mta_audit_sequence_v1.sql`.
- The BEFORE INSERT trigger obtains `nextval('public.mta_audit_sequence_seq')`.
- The verifier requires each active-epoch sequence to equal the running row count (`audit_sequence = v_count`) and reports `AUDIT_SEQUENCE_GAP_OR_REORDER` otherwise.
- PostgreSQL sequence increments are not rolled back when the surrounding transaction aborts. If a transaction reaches the audit trigger and subsequently rolls back, the consumed value is not reused. A later committed audit event can therefore have a gap and be rejected by the verifier even without tampering.
- This can occur in transaction paths where audit insertion is followed by another operation that may still fail, such as outbox insertion or idempotency response completion.

**Required remediation**
1. Prefer a transactional per-epoch counter row updated under the existing chain lock, so its increment rolls back with the transaction.
2. Alternatively, redefine the verifier contract to validate strict monotonicity and hash linkage rather than contiguity, if gaps are explicitly permitted. Do not weaken tamper detection without an approved design decision.
3. Add a PostgreSQL integration test: insert audit event, force a later statement failure/rollback, commit a subsequent event, then verify integrity.
4. Preserve historical epoch evidence and do not rewrite historical audit records.

### AUTH-001 — Login handler has no visible application-level rate limit or authentication audit

- Severity: **HIGH**
- Evidence: `supabase/functions/mta-login/index.ts`.
- The handler validates NIP/password and uses a generic `INVALID_LOGIN` response, which is good for reducing account enumeration.
- The inspected handler contains no application-level rate-limit / progressive delay / lockout mechanism and does not write LOGIN_SUCCESS or LOGIN_FAILURE audit events.
- A Cloudflare edge-level rate limit may exist outside this source; that must be independently verified before concluding there is no effective rate limiting.

**Required remediation**
1. Verify Cloudflare/WAF rate-limiting rules for the exact login route and deployment environment.
2. If no suitable edge control exists, add a durable, privacy-safe limiter keyed by a keyed hash of the submitted identity plus source/network signals; never persist raw passwords.
3. Record success/failure/lockout events without logging NIP, password, access token, or session payload.
4. Add burst, distributed-source, lockout recovery, and account-enumeration tests.

### GOV-001 — One global production write switch controls multiple mutation domains

- Severity: **MEDIUM**
- Evidence: `supabase/functions/mta-api/index.ts`, `MTA_PRODUCTION_WRITES_ENABLED`.
- The global gate is a useful emergency kill switch and currently fails closed.
- If enabled, it opens the common write boundary for multiple routes; authorization still applies, but the flag does not express separate release approval for detainee, placement, movement, leave, notes, user administration, AI configuration, and restore operations.
- The activity/health route has an additional explicit write check, but there is no consistent resource-level release-gate contract across all routes.

**Required remediation**
1. Keep the global switch as an unconditional emergency kill switch.
2. Add independent resource/action gates beneath it, default OFF.
3. Require an explicit release record and acceptance evidence for each production mutation domain.
4. Test that enabling one domain cannot enable another.

### STO-001 — Private bucket binary access is broader than metadata authorization and ignores classification

- Severity: **CRITICAL**
- Evidence:
  - `supabase/migrations/20260921070000_mta_production_auth_rbac_v1.sql` creates `mta_storage_read_authenticated` on `storage.objects` for every authenticated OWNER, ADMIN, EDITOR, REVIEWER, and AUDITOR in bucket `mta-deteni-private`.
  - The same migration's storage insert/update/delete policies are also role/bucket-based rather than object/scope/classification-based.
  - `supabase/migrations/20260923040000_mta_document_storage_read_hardening.sql` tightens `mta_storage_objects` metadata reads for EDITOR/REVIEWER to documents created by the current user, but it does not replace the broader `storage.objects` binary-read policy.
  - The `mta_storage_objects.classification` column is not consulted by the bucket access policy.
  - `docs/03-implementation/P9.9-PRIVATE-STORAGE-KERNEL-v1.0.md` requires server-side authorization, scope, classification, object-state checks, and time-limited download grants; the document marks implementation as not verified.
- Consequence: if the policy is applied as written and protected objects exist in the bucket, a user in one role can access binary objects beyond the narrower metadata visibility rule. The bucket being private does not by itself provide per-object authorization.
- This is a source-policy finding. Actual deployed Supabase Storage policy and object contents have not been queried or verified in this audit.

**Required remediation**
1. Remove broad authenticated binary-read access from `storage.objects`; keep the bucket private.
2. Route download through a server-authorized object-ID boundary that checks actor, active scope, document ownership/resource, classification, object state, and purpose.
3. Issue short-lived, object-specific download grants only after authorization; never log signed URLs.
4. Restrict direct upload to a server-controlled quarantine/validation flow; enforce MIME, size, checksum, classification, and audit.
5. Add disposable-Supabase tests proving cross-scope and cross-classification reads are denied for EDITOR, REVIEWER, AUDITOR, and other non-authorized roles.

## 4. Positive controls confirmed

The audit also confirmed several important protections that should be preserved:

- `mta-api` validates the bearer session with Supabase Auth and rejects missing/invalid sessions.
- Inactive/missing profiles are denied.
- A forced password-change profile is blocked from normal API use, with `/me` self-service kept available.
- Operational writes are fail-closed when the global production write gate is OFF.
- Generic mutation requires an `Idempotency-Key`.
- Generic mutation authorizes before calling the durable mutation RPC.
- The P9.7 SQL function enforces a service-role boundary, operation allowlist, explicit domain-table allowlist, primary-key predicate for update/delete, and mandatory success audit inside the mutation transaction.
- Movement has a dedicated transactional function that validates actor role, active detainee, scope, room status/capacity, and writes movement, placement, audit, outbox, and idempotency state in one transaction.
- Detainee activity/health writes use a dedicated RPC with actor, scope, role, idempotency, audit, and outbox checks in one transaction.
- Audit history has immutable update/delete triggers and a hash-chain verifier.
- The production runtime health metadata correction in PR #332 is separate from this mutation audit and must retain its own release gate.

## 5. Remediation order

| Order | Work package | Required evidence | Release impact |
|---:|---|---|---|
| 1 | MUT-001 and MUT-002 — completed in PR #334 | 8/8 PR CI workflows PASS; authenticated role/scope UAT remains | API source correction complete; runtime UAT open |
| 2 | Fix MUT-003 | Failure-injection tests; atomic DB RPC / saga evidence | Identity/admin integrity |
| 3 | Redesign MUT-004/005/006/007 and STO-001 | Snapshot, completeness, restore, immutability, replay, private-object authorization tests | Recovery and storage certification |
| 4 | Fix AUD-001 | PostgreSQL rollback/sequence integration test | Audit certification |
| 5 | Fix AUTH-001 | Edge policy evidence + login security tests | Authentication hardening |
| 6 | Implement GOV-001 | Per-resource release gate tests | Controlled production activation |
| 7 | Full regression | `npm test`, `npm run typecheck`, SQL integration, browser UAT | Re-certification |

## 6. Explicit non-actions

This audit branch does **not**:
- enable production writes;
- deploy Cloudflare Worker or Supabase Edge Functions;
- apply migrations or SQL operation artifacts;
- alter existing detainee or health data;
- change AI from OFF;
- authorize production access;
- merge PR #332 or any other open PR;
- mark any capability VERIFIED based only on source inspection.

## 7. Exit criteria for this audit track

The mutation surface is not certified until:
1. Every mutation route is enumerated and mapped to one authorization policy.
2. Every critical mutation has a defined atomic transaction or explicit cross-system saga.
3. Every successful critical mutation has exactly one canonical audit event and required outbox event.
4. Every mutation has idempotency and concurrency evidence where applicable.
5. Backup and restore cover the approved domain model and pass disposable-PostgreSQL integration tests.
6. Private storage binary access enforces object-level scope/classification and passes negative role/scope tests.
7. Audit integrity remains valid across commit, rollback, retry, replay, and restore scenarios.
8. Negative authorization tests prove cross-scope and role bypass attempts are denied.
9. CI, runtime, and release evidence are recorded separately.

**Final status: FINDINGS RECORDED / REMEDIATION REQUIRED / PRODUCTION NO-GO UNCHANGED.**
