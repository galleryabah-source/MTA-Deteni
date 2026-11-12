# P9.3 Authentication & Session — Remediation Design & Test Contract

**Date:** 2026-11-03  
**Baseline:** P9.2 merged; PR #337 forensic audit branch  
**Status:** DESIGN ONLY — OWNER REVIEW REQUIRED  
**Migration freeze:** ON  
**Production write gate:** OFF  
**AI:** DISABLED

## 1. Objective and non-goals

This contract defines the implementation boundaries and test evidence required to close P93-A01 through P93-A05.

It is not authorization to:
- apply or deploy a database migration;
- change production Supabase Auth settings, secrets, or Edge Function configuration;
- enable production writes;
- change P9.4–P9.6 scope authorization policy;
- weaken RLS or bypass the canonical authorization path.

The design must preserve the existing Auth identity mapping `auth.users.id -> mta_profiles.id`, NIP-based login behavior, generic invalid-login response, and fail-closed protected operations.

## 2. Target architecture

### 2.1 Credential lifecycle state

Treat credential changes as a multi-system operation, not a single HTTP handler.

Canonical operation states:

| State | Meaning | Permitted next states |
|---|---|---|
| REQUESTED | Operation accepted and assigned an operation ID | AUTH_UPDATED, FAILED |
| AUTH_UPDATED | Auth credential mutation completed | PROFILE_UPDATED, RECONCILIATION_REQUIRED |
| PROFILE_UPDATED | Profile credential flags/timestamps persisted | REVOCATION_PENDING, RECONCILIATION_REQUIRED |
| REVOCATION_PENDING | Session revocation requested but not yet verified | REVOCATION_VERIFIED, RECONCILIATION_REQUIRED |
| REVOCATION_VERIFIED | Required revocation postcondition verified | AUDIT_COMMITTED |
| AUDIT_COMMITTED | Durable audit evidence committed | COMPLETED |
| COMPLETED | All required postconditions met | terminal |
| RECONCILIATION_REQUIRED | A partial failure needs deterministic recovery | a safe retry/reconciliation state |
| FAILED | Operation failed before credential mutation or was safely compensated | terminal, unless explicitly reopened by a new operation |

Rules:
- A credential operation must have a stable operation ID and correlation ID.
- Replays with the same idempotency identity must return the same operation outcome, not generate a second password or duplicate audit.
- Never store plaintext password or temporary password in operation records, audit metadata, logs, or error messages.
- A one-time temporary credential handoff, if retained, must be a separately reviewed secret-delivery mechanism with no durable plaintext persistence. The current response behavior must not be assumed safe merely because the password is random.
- Cross-system Auth and PostgreSQL changes cannot be treated as one ACID transaction. Use a durable saga/outbox-style state record and explicit reconciliation.
- Do not mark an operation COMPLETED until its required postconditions and audit evidence are confirmed.

### 2.2 Session revocation contract

The implementation must first verify the exact Supabase Auth administrative API supported by the pinned SDK/runtime and the semantics of access-token invalidation. Do not infer that changing a password or calling a client sign-out revokes all extant sessions.

Required contract:
1. Identify the target Auth user and the credential operation.
2. Perform the credential mutation.
3. Persist `must_change_password=true` for administrative reset (or false after a successful self-service change, according to the approved policy).
4. Invoke the documented server-side session revocation operation for the target user.
5. Verify revocation using a previously issued session/token against the actual protected request path. Distinguish refresh-token revocation from access-token expiry/validation semantics.
6. Record revocation outcome and evidence reference.
7. Return `sessionRevoked: true` only when the documented and tested revocation postcondition is met. Otherwise return a pending/failed state and do not claim success.

A token that remains cryptographically valid until expiry may require an application-side session/version check at the database/API boundary. This design decision must be proven by integration tests; do not assume a revocation API alone invalidates every already-issued JWT immediately.

### 2.3 Forced password change at the database boundary

The RLS boundary must not rely solely on `mta-api` checking `must_change_password`.

Design requirements:
- A canonical private authorization helper must return no operational role/permission when the authenticated profile is missing, inactive, or requires password change.
- All RLS policies using role helper functions must be inventoried, including policies in `public` and `storage`.
- The helper must use a fixed safe search path, least-privilege grants, and a reviewed SECURITY DEFINER owner.
- Do not expose a helper that accepts an arbitrary user ID and lets a caller impersonate another profile.
- Self-service credential change must remain available through the narrowly scoped credential workflow; do not grant general operational table access to achieve this.
- Test direct PostgREST access independently of the Edge Function.

No SQL migration is authorized by this design document. Migration design and application remain separate gates.

### 2.4 Login throttling and authentication audit

The login boundary must retain generic `INVALID_LOGIN` responses for invalid format, missing/inactive profile, and bad password.

Rate-limit design:
- Use a shared, durable limiter or a separately verified edge control; per-isolate memory counters are insufficient.
- Define account-key and network-key dimensions, window, threshold, cooldown, and reset behavior in a separate policy decision.
- Store only a keyed digest of normalized NIP/account identity where account-level correlation is required; never store raw password and avoid raw NIP in logs.
- Treat untrusted forwarding headers as untrusted unless the trusted proxy chain is explicitly configured.
- Avoid permanent lockout that allows an attacker to deny service to a known user.
- Return a generic throttle response that does not reveal account existence.

Authentication event contract:
- Events: `LOGIN_SUCCESS`, `LOGIN_FAILURE`, and `LOGIN_THROTTLED`.
- Fields: event ID, occurred_at, actor_user_id when known, safe account digest, request_id, correlation_id, outcome, reason_code, source/service.
- Never include password, access token, refresh token, authorization header, raw request body, or temporary credential.
- Login failure audit policy must define behavior if the audit store is unavailable. The chosen policy must not silently claim complete audit evidence.

### 2.5 Audit and operation recovery

- Credential-operation state transitions and audit evidence must be correlated by operation ID.
- Prefer a single database transaction/RPC for database-local state transition plus audit/outbox insertion.
- Auth Admin API calls remain outside PostgreSQL transaction boundaries and must be represented as saga steps.
- A failed audit write after an Auth mutation must leave a recoverable non-completed operation, not a successful response with a warning only.
- Reconciliation must be idempotent and safe to repeat.
- Do not duplicate audit rows on retry; use a stable event key/unique constraint in the future migration design.
- Audit data must contain no credential material.

## 3. Proposed implementation work packages

| Work package | Scope | Depends on | Output |
|---|---|---|---|
| P93-WP1 | Inventory all RLS policies and private helpers relying on role | Source audit | Policy inventory and migration draft |
| P93-WP2 | Forced-password-change DB gate | WP1, migration approval | SQL migration + direct PostgREST tests |
| P93-WP3 | Credential operation state machine and idempotency | Saga contract approval | Isolated operation workflow + failure injection |
| P93-WP4 | Administrative reset revocation | WP3, Supabase API semantics verified | Revocation integration tests |
| P93-WP5 | Self-service change reconciliation | WP3, WP4 | truthful response and retry behavior |
| P93-WP6 | Login throttling and event audit | Rate policy decision | shared limiter + audit tests |
| P93-WP7 | Browser/session regression | WP2–WP6 | desktop/tablet/phone evidence |
| P93-WP8 | Forensic diff and certification | all work packages | P9.3 certification packet |

## 4. Test contract

### 4.1 Database boundary tests

| ID | Scenario | Expected |
|---|---|---|
| DB-AUTH-01 | Authenticated user with `must_change_password=true` reads protected table via PostgREST | Denied / no protected rows |
| DB-AUTH-02 | Same user writes protected table via PostgREST | Denied |
| DB-AUTH-03 | User with forced-change flag accesses approved credential-change path | Allowed only for that path |
| DB-AUTH-04 | Inactive profile | Denied |
| DB-AUTH-05 | Missing profile | Denied |
| DB-AUTH-06 | Anonymous invokes private authorization helper | Denied |
| DB-AUTH-07 | Normal active user with valid role and scope | Existing intended policy preserved |
| DB-AUTH-08 | Storage object access with forced-change flag | Denied |

### 4.2 Session revocation tests

| ID | Scenario | Expected |
|---|---|---|
| SESSION-01 | Admin resets password for target with two active sessions | Both sessions meet documented revocation behavior |
| SESSION-02 | Use old access token after reset | Protected route denies it at documented boundary |
| SESSION-03 | Use old refresh token after reset | Refresh is denied |
| SESSION-04 | Revocation API fails | Operation not COMPLETED; no `sessionRevoked:true` |
| SESSION-05 | Profile update fails after Auth mutation | Reconciliation state created; no false success |
| SESSION-06 | Self-service change | Credential, profile flag, and revocation states reconcile |
| SESSION-07 | Replay same idempotency key | Same operation result; no second reset or duplicate audit |

### 4.3 Login tests

| ID | Scenario | Expected |
|---|---|---|
| LOGIN-01 | Invalid NIP format | Generic invalid-login response; no credential data logged |
| LOGIN-02 | Unknown NIP | Same generic invalid-login response |
| LOGIN-03 | Known NIP with wrong password | Same generic invalid-login response |
| LOGIN-04 | Repeated failures across separate function instances | Shared limiter throttles |
| LOGIN-05 | Success | LOGIN_SUCCESS durable event |
| LOGIN-06 | Failure | LOGIN_FAILURE durable event without account enumeration |
| LOGIN-07 | Throttle | LOGIN_THROTTLED durable event |
| LOGIN-08 | Audit storage unavailable | Approved fail-safe behavior; no false audit-complete claim |
| LOGIN-09 | Spoofed forwarding header | Cannot bypass network limiter |
| LOGIN-10 | Recovery after cooldown | Valid login resumes without manual permanent unlock |

### 4.4 Audit and failure-injection tests

| ID | Failure point | Expected |
|---|---|---|
| AUD-CRED-01 | Auth mutation rejected | Operation safely fails; no success audit |
| AUD-CRED-02 | Auth succeeds, profile update fails | Reconciliation required |
| AUD-CRED-03 | Profile update succeeds, revocation fails | Revocation pending/reconciliation; no completion |
| AUD-CRED-04 | Revocation succeeds, audit write fails | Non-completed operation, recoverable audit retry |
| AUD-CRED-05 | Client retries after timeout | Same operation is resumed/replayed idempotently |
| AUD-CRED-06 | Duplicate event delivery | One canonical audit event |
| AUD-CRED-07 | Secret scan of logs/audit | No password, token, raw authorization header, or temporary credential |

### 4.5 Browser/session regression

- Desktop, tablet, phone.
- Login success/failure and throttling feedback.
- Forced-password-change flow.
- Password reset followed by old-session rejection.
- Self-service password change followed by expected reauthentication.
- No temporary credential in browser console, URL, analytics, or persistent client storage.
- Session expiry/revocation produces a safe return-to-login experience.

## 5. Evidence and release gates

Required evidence packet:
1. Source diff and migration diff (migration remains unapplied until separately approved).
2. Unit tests for state machine, idempotency, and safe event serialization.
3. Integration tests against isolated Supabase/Auth environment.
4. Direct PostgREST/RLS tests using authenticated sessions, not only service-role tests.
5. Previously-issued-token revocation tests.
6. Failure injection for every saga transition.
7. Rate-limit tests across separate Edge Function instances.
8. Browser matrix results.
9. Secret/log scan.
10. Forensic review and CI run references.

Gate sequence:
- Contract review and explicit owner decisions.
- Isolated implementation.
- CI and negative tests.
- Forensic diff.
- Migration approval (separate; no automatic application).
- Staging deployment and verification (separate authorization).
- Production deployment and UAT (separate authorization).
- P9.3 certification.

## 6. Decisions required before implementation

The following are intentionally not decided by this document:

1. **Session revocation semantics:** whether protected APIs must reject already-issued access JWTs immediately after reset, or whether the approved boundary is refresh-token revocation plus a bounded access-token lifetime. Recommendation: immediate denial at the application authorization boundary for reset users, verified by old-token tests.
2. **Login throttle policy:** thresholds, windows, cooldown, account/network weighting, and recovery behavior. Recommendation: progressive throttling with shared state, generic response, and no permanent account lockout.
3. **Audit failure policy:** whether login failure audit outage blocks login or allows login with a durable degraded-operation signal. Recommendation: do not silently claim audit completeness; privileged credential reset must remain non-completed until audit evidence is durable.
4. **Temporary credential delivery:** whether administrative reset continues to issue a one-time temporary password or moves to a secure recovery/set-password flow. Recommendation: prefer a short-lived, one-time recovery flow; never persist or log plaintext temporary passwords.
5. **Scope policy:** unchanged and still awaiting owner decision for P9.4–P9.6. This document does not grant global operational access to OWNER/ADMIN/AUDITOR.

## 7. Completion definition

P9.3 is complete only when:
- all P93-A01–A05 findings are closed with source and test evidence;
- all applicable tests in Section 4 pass;
- no migration is applied without separate approval;
- all required session, audit, and rate-limit semantics are explicit;
- production remains NO-GO until the separate production-readiness gate is approved.

**Current decision:** DESIGN READY FOR REVIEW; IMPLEMENTATION NOT AUTHORIZED BY THIS DOCUMENT.
