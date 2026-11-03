# P9.3 Authentication & Session — Forensic Audit 01

**Date:** 2026-11-03  
**Repository baseline:** `main` after PR #336 (P9.2 Configuration Kernel)  
**Audit mode:** Source-level inspection only  
**Production changes:** None  
**Database migrations:** None  
**Production deployment:** Not performed by this audit  
**Status:** FINDINGS OPEN — NOT CERTIFIED

## 1. Executive result

P9.2 is merged and its post-merge commit checks were verified green (9/9) on commit `0f8b79855955b40d4ef1e78b6cdf290c289fcf5f`.

P9.3 is not ready for certification. Source inspection identified gaps in forced-password-change enforcement at the database boundary, administrative password-reset session revocation, login abuse controls, and audit durability. This document records findings and acceptance criteria; it does not implement fixes.

## 2. Scope and inspected sources

- `supabase/functions/mta-login/index.ts`
- `supabase/functions/mta-api/index.ts`
- `supabase/migrations/20260921070000_mta_production_auth_rbac_v1.sql`
- `supabase/migrations/20260921061400_mta_production_auth_rbac_v1_2_private_helper.sql`
- `supabase/migrations/20260928113000_mta_identity_credential_hardening_v1.sql`
- `supabase/migrations/20260928114500_mta_identity_credential_bootstrap_v1.sql`

No live Supabase project was queried. Findings describe repository source and must not be interpreted as proof of a live production exploit or live session state.

## 3. Findings

### P93-A01 — Forced password change is not enforced by the database role helper

**Evidence**
- The Edge Function `mta-api` reads `must_change_password` and returns HTTP 428 for protected routes after allowing the `/me` self-service branch.
- The original `mta_current_role()` helper selects only `role` from `mta_profiles` where the profile is active.
- The helper is moved into the `private` schema by the v1.2 migration, but the repository does not show it being replaced with a check for `must_change_password`.

**Risk**
Direct authenticated PostgREST/RLS access may continue to receive role-based authorization while `must_change_password=true`, bypassing the Edge Function gate on any table whose RLS policy relies on this helper.

**Required remediation design**
- Replace the private role helper or introduce a canonical authorization helper that denies protected operational access while `must_change_password=true`.
- Keep the minimum self-service password-change path available without creating a general-purpose bypass.
- Ensure SECURITY DEFINER ownership, fixed search_path, grants, and schema exposure are explicitly reviewed.

**Acceptance tests**
1. User with `must_change_password=true` cannot SELECT protected operational rows directly through PostgREST.
2. Same user cannot INSERT/UPDATE/DELETE protected resources directly through PostgREST.
3. Same user can reach only the explicitly allowed credential-change path.
4. User with `must_change_password=false` and valid role/scope retains intended access.
5. Inactive profile remains denied.
6. Anonymous role cannot execute private helper.

**Classification:** P0 authorization boundary. Requires migration; blocked by migration freeze.

### P93-A02 — Administrative password reset claims session revocation without performing it

**Evidence**
- The `POST /admin-users/:id/password-reset` handler calls `admin.auth.admin.updateUserById(id,{password:temporaryPassword})`.
- It updates `must_change_password=true` and reset metadata.
- It writes an audit event, but does not call an explicit target-user global session revocation operation in the inspected handler.
- The response returns `sessionRevoked:true`.

**Risk**
The API response overstates the verified outcome. Existing target sessions may remain valid depending on Supabase Auth behavior and token/session revocation semantics.

**Required remediation design**
- Define a reset saga with explicit states: credential changed, profile forced-change flag persisted, session revocation requested/verified, audit committed, reset result released to operator.
- Never return `sessionRevoked:true` until the revocation operation has succeeded and its semantics are verified.
- If Auth mutation and database/audit cannot be atomic, persist a durable operation record and reconcile partial failures.
- Do not expose temporary credentials before all required postconditions are satisfied.

**Acceptance tests**
1. Reset revokes all target sessions, including sessions established before reset.
2. Previously issued access token is rejected by protected routes after the documented revocation boundary.
3. A revocation failure cannot produce a success response claiming revocation.
4. Partial failure is observable and recoverable without issuing a second unrelated reset.
5. Reset action has one durable audit correlation and no duplicate success audit on replay.

**Classification:** P0 credential lifecycle. Cross-system saga; code and integration evidence required.

### P93-A03 — Login endpoint has no visible application-level throttling or durable login audit

**Evidence**
- `mta-login` validates an 18-digit NIP and password, resolves the profile, and delegates credential verification to Supabase Auth.
- Invalid format, missing/inactive profile, and bad credentials return the same generic `INVALID_LOGIN` response.
- The inspected function does not implement an application-level rate limiter or write durable `LOGIN_SUCCESS` / `LOGIN_FAILURE` events.
- No external Cloudflare rate-limit configuration was verified during this source audit.

**Risk**
Brute-force resistance and authentication-event traceability are not proven. Generic errors are good anti-enumeration behavior but do not replace rate limiting or audit evidence.

**Required remediation design**
- Apply a bounded rate limit using a durable/shared store or a verified edge control; avoid in-memory per-isolate counters.
- Define key dimensions (for example normalized account identifier hash + trusted client/network signal) and escalation windows without logging NIP/password.
- Record login success/failure with actor/profile reference when known, timestamp, request/correlation ID, outcome, and safe reason code.
- Protect the audit path from credential leakage and avoid making account existence observable.

**Acceptance tests**
1. Repeated failures trigger a deterministic throttle across multiple function instances.
2. Successful login is audited without storing password, token, or raw credential material.
3. Failed login is audited without revealing whether NIP/account exists.
4. Rate-limit responses do not disclose account existence.
5. Audit storage failure follows an explicitly approved fail-safe policy.
6. Legitimate recovery/unlock behavior is tested.

**Classification:** P1 authentication controls; deployment configuration must be separately evidenced.

### P93-A04 — Self-service password change reports revocation success even if sign-out fails

**Evidence**
- `POST /me` updates the password through Admin Auth, clears `must_change_password`, then calls `supabase.auth.signOut({scope:"global"}).catch(()=>{})`.
- The result of sign-out is ignored and the response returns `sessionRevoked:true`.

**Risk**
The API cannot prove that global revocation succeeded. A swallowed failure creates false-positive session state.

**Required remediation design**
- Check and classify the sign-out/revocation result.
- Return an explicit pending/failed revocation state or fail closed; do not claim success when the operation failed.
- Reconcile password/profile state if Auth succeeds but profile or revocation step fails.
- Verify actual behavior with previously issued tokens in integration tests.

**Acceptance tests**
1. Successful global revocation is evidenced before success is returned.
2. Simulated sign-out failure never returns `sessionRevoked:true`.
3. Repeated password-change request does not create inconsistent credential/profile state.
4. Audit event accurately distinguishes credential change from revocation completion.

**Classification:** P1 credential lifecycle consistency.

### P93-A05 — Credential mutation and audit are separate, and reset audit failure is non-blocking

**Evidence**
- Password reset mutates Auth, updates profile metadata, then inserts an audit row.
- If the reset audit insert fails, the handler emits a warning and still returns success.
- Self-service password change also performs Auth/profile updates and a separate audit insert.

**Risk**
A credential change may be reported successful without durable audit evidence. Cross-system operations are not atomic.

**Required remediation design**
- Use a durable credential-operation record/outbox/saga to correlate each stage.
- Define whether credential mutation may proceed when audit storage is unavailable. For privileged reset, default recommendation is fail-safe with a recoverable pending state, not silent success.
- Prevent duplicate audit events and support idempotent replay.
- Ensure no password, temporary password, access token, or secret is written to logs/audit metadata.

**Acceptance tests**
1. Audit failure is visible and cannot be silently represented as fully completed reset.
2. Retry/replay does not duplicate completed credential operations or audit evidence.
3. Partial Auth/profile state is reconciled deterministically.
4. Audit metadata contains only safe identifiers and operation status.

**Classification:** P1 audit/transactional integrity.

## 4. P9.3 certification gate

P9.3 remains **NOT CERTIFIED** until all of the following are evidenced:

- [ ] A database-boundary forced-password-change gate is implemented and tested.
- [ ] Administrative reset revokes target sessions and verifies the outcome.
- [ ] Self-service password change reports revocation truthfully.
- [ ] Login throttling is proven across instances or a separately verified edge control is documented.
- [ ] Durable login success/failure events are present with safe metadata.
- [ ] Credential mutation/audit partial failures have a deterministic saga/recovery contract.
- [ ] Negative tests cover direct PostgREST access, old tokens, inactive users, replay, and audit failure.
- [ ] Browser/session behavior is verified on desktop, tablet, and phone.
- [ ] No secrets or credential material appear in logs, responses beyond the intended one-time credential handoff, or audit records.

## 5. Constraints and decisions

- `MIGRATION_FREEZE = TRUE`: no migration is proposed for application in this audit.
- `AI_ENABLED = FALSE`.
- Production write gate remains OFF.
- Production Readiness remains NO-GO.
- No production deployment or live database change was performed.
- P9.4–P9.6 scope authorization policy remains subject to owner decision. This P9.3 report does not choose or modify the scope-membership/global-oversight policy.

## 6. Recommended execution order

1. Approve the P9.3 remediation contract and session-revocation semantics.
2. Design (do not apply) the migration for the database-boundary forced-password-change helper.
3. Implement and test the credential reset saga in isolated test/staging conditions.
4. Add login throttle and durable authentication event tests.
5. Run direct PostgREST negative tests and old-token revocation tests.
6. Perform forensic diff, CI, and integration evidence review.
7. Certify P9.3 only after all acceptance tests pass; do not activate production writes as a side effect.
