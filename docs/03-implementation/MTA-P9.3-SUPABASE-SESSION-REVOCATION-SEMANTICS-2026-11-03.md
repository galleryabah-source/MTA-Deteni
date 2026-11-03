# P9.3 Addendum — Supabase Session Revocation Semantics

**Date:** 2026-11-03  
**Related:** P93-A02, P93-A04; PR #337  
**Status:** DOCUMENTATION / DESIGN EVIDENCE ONLY

## 1. Official Supabase behavior verified

This addendum records the current Supabase documentation findings relevant to the P9.3 session design.

### 1.1 Sign-out revokes refresh tokens, not already-issued access JWTs

Supabase documents that global sign-out terminates the user's active sessions and revokes the affected refresh tokens. However, access tokens for revoked sessions remain valid until their JWT `exp` time. Therefore a successful sign-out call does **not** prove immediate rejection of an already-issued access JWT.

Sources:
- https://supabase.com/docs/guides/auth/signout
- https://supabase.com/docs/guides/auth/sessions
- https://supabase.com/docs/reference/javascript/auth-signout

### 1.2 Server-side Admin signOut requires a valid session JWT

The JavaScript Admin `signOut` reference requires a valid logged-in JWT and a scope. It is not documented as a function that accepts only a target user ID.

Source:
- https://supabase.com/docs/reference/javascript/auth-admin-signout

Implementation implication:
- Do not invent or call `admin.signOut(userId)`.
- A privileged reset handler that only has the target user ID cannot assume it can invoke Admin sign-out for that target without a valid session JWT.
- The exact pinned `@supabase/supabase-js` version and supported Admin API signature must be confirmed before implementation.
- If the operation must terminate all target sessions without possessing a target JWT, design and verify a supported server-side mechanism; do not manipulate undocumented Auth internals.

### 1.3 Immediate denial of old access JWTs requires an application authorization check

Supabase documents that each access JWT includes a `session_id` claim that correlates to `auth.sessions.id`. For stronger guarantees after sign-out, sensitive operations can verify that the session ID still corresponds to a live session row. When the session row has been removed, the old JWT should be denied by that application-side check.

Source:
- https://supabase.com/docs/guides/auth/sessions

Design implication for MTA DETENI:
- Refresh-token revocation and access-token denial are two distinct postconditions.
- Sensitive operational requests need a canonical server/database authorization boundary that can reject revoked session IDs, or an equivalent verified revocation/version strategy.
- This check must not be bypassable through direct PostgREST/RLS access.
- Do not query or expose `auth.sessions` directly to browser clients.
- Any database helper/RPC accessing Auth-private data requires a dedicated security review (ownership, SECURITY DEFINER necessity, fixed search_path, grants, no caller-controlled user identity, and query cost).
- If immediate old-token denial is not implemented, the system must explicitly document and accept the residual JWT validity window; it must not claim immediate session revocation.

## 2. Revised acceptance semantics

| Requirement | Correct success condition |
|---|---|
| Global sign-out | Auth confirms affected refresh tokens/sessions are revoked |
| Old refresh token | Refresh attempt is rejected |
| Old access JWT, ordinary endpoint | Behavior matches documented JWT expiry semantics |
| Old access JWT, sensitive MTA DETENI endpoint | Denied by application-side session validity check if immediate revocation is required |
| API response `sessionRevoked` | Must describe exactly which revocation postcondition was verified; never imply access JWT invalidation if only refresh tokens were revoked |

Recommended response contract should avoid a single ambiguous boolean. Prefer explicit fields such as:
- `refreshSessionsRevoked`
- `activeAccessTokenPolicy` (for example `DENY_VIA_SESSION_CHECK` or `VALID_UNTIL_EXPIRY`)
- `revocationVerifiedAt`
- `operationStatus`

The final field names are design suggestions, not current API contracts.

## 3. P9.3 implementation gate update

Before implementing P93-A02/P93-A04:
1. Inspect the repository's pinned `@supabase/supabase-js` version and its TypeScript declarations for Admin `signOut`.
2. Prove the exact server-side mechanism available for terminating all target sessions when only target user ID is available.
3. Decide whether MTA DETENI requires immediate denial of already-issued access JWTs for all operational routes or only high-risk operations.
4. Design the RLS/database session check without exposing `auth.sessions`.
5. Add integration tests using an old access JWT and old refresh token.
6. Do not mark the reset operation complete until the selected revocation contract and durable audit state are satisfied.

## 4. Security decision recommendation

For MTA DETENI's sensitive detainee and custody data, recommend:
- revoke all refresh sessions on administrative password reset using a documented supported mechanism;
- enforce immediate denial of old access JWTs at the MTA DETENI authorization boundary for sensitive operational resources;
- keep the check consistent across Edge Function and direct PostgREST/RLS access;
- preserve a narrowly scoped password-change/recovery path;
- expose exact revocation status rather than a misleading `sessionRevoked: true`.

This remains a recommendation for owner review. No runtime or database changes are authorized by this addendum.
