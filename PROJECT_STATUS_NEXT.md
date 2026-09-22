# MTA DETENI — Next Gate

**Foundation:** v1.122+
**Current:** P13.16321–16440 — integrated operational audit publication certification implemented; CI observation blocker remains

## Completed (through current gate)

- Deterministic reconnect, reporting, persistence, authorization and offline/local continuity foundations.
- P13.13681–13800: post-dispatch acknowledgement bound to exact execution, dispatch, evidence, decision, request and fingerprint identities.
- P13.13801–14040: acknowledgement replay and continuity certification.
- P13.14041–14400: completion proof, continuity receipt and runtime closure gate.
- P13.14401–15000: integrated recovery closure, replay, evidence and final closure certification.
- P13.15001–15360: final closure audit record, replay and integrated certification.
- P13.15361–15720: final closure audit evidence envelope, replay guard and certification.
- P13.15721–16080: operational audit projection boundary, replay guard and integrated certification.
- P13.16081–16200: deterministic operational audit publication envelope with explicit READY_FOR_PUBLICATION state and no external publication.
- P13.16201–16320: deterministic publication replay guard with ADMIT/REPLAY/CONFLICT semantics and no external side effect.
- P13.16321–16440: integrated publication certification composes readiness and replay boundaries and preserves exact identity/fingerprint continuity.

## Parallel UI hardening — smartphone & tablet

Implemented without changing the database/migration boundary:

- Smartphone/tablet shell at <=1024px replaces the cramped left sidebar with a full-width content surface and fixed bottom navigation.
- Central **Scan QR** action is intentionally larger than neighboring actions and delegates to the existing adaptive QR camera runtime.
- `Laporan` maps to the existing `documents` view instead of introducing a parallel route.
- Mobile detainee table is projected into responsive cards while preserving the existing row actions and underlying synthetic data.
- Safe-area handling and bottom content padding prevent gesture bars and the fixed navigation from covering content.
- Mobile search keeps the card projection synchronized without a mutation-observer feedback loop.
- Service Worker shell cache now includes the mobile shell.
- Device regression contract covers phone 390x844, tablet 768x1024, and desktop 1440x900.
- UI contract is documented in `docs/17-mobile-tablet-ui-hardening.md`.

## Deployment observation

Cloudflare deployment is still blocked at the credential/permission boundary. The latest controlled deploy reached Cloudflare API authentication and returned error code 10000; the account token is accepted as an account token but lacks the permission required to update the target Worker service. No production access was attempted.

## Next gate: P13.16441–16560

Define a deterministic, synthetic-only publication request admission contract over certified publication readiness. Preserve the complete projection/certification/publication identity chain, reject drift/conflict/incomplete/non-synthetic state, and remain strictly before external transport or durable publication.

## Authentication / RBAC login gate

- Dedicated login boundary restored before the application shell; unauthenticated users do not receive operational UI.
- Supabase session authentication resolves the account through protected /api/mta/me before RBAC access is granted.
- Canonical roles: OWNER, ADMIN, EDITOR, REVIEWER, AUDITOR.
- Explicit client/API action policy is enforced for READ, CREATE, UPDATE, DELETE, with fail-closed RBAC_ACTION_DENIED responses.
- Public self-registration removed from browser auth adapter.
- RBAC ↔ API ↔ RLS parity audit completed at repository level.
- REVIEWER Audit UI was removed because the current frozen RLS policy grants audit-event SELECT only to OWNER, ADMIN, AUDITOR.
- Known RLS drift documented: placements, movements, and leaves still use FOR ALL for OWNER/ADMIN/EDITOR, which gives EDITOR direct DB DELETE capability. No migration was changed or executed because migration freeze remains active.
- Added RBAC/RLS parity audit contract and CI gate.


- Dedicated login boundary restored before the application shell; unauthenticated users do not receive operational UI.
- Supabase session authentication resolves the account through the protected `/api/mta/me` endpoint before RBAC access is granted.
- Accepted roles: OWNER, ADMIN, EDITOR, REVIEWER, AUDITOR.
- Client RBAC now includes an explicit action policy for READ, CREATE, UPDATE, DELETE, APPROVE, FINALIZE, and AUDIT.
- Production MTA API now enforces role-by-action policy: READ all roles; CREATE/UPDATE OWNER/ADMIN/EDITOR; DELETE OWNER/ADMIN. Denials are fail-closed with `RBAC_ACTION_DENIED`.
- Public self-registration has been removed from the browser authentication adapter; account provisioning remains administrative.
- Authentication/RBAC contract tests and production API RBAC contract tests cover the boundary.
- No schema/migration/production-data changes were made.


- Dedicated login boundary is restored before the application shell; unauthenticated users do not receive the operational UI.
- Existing Supabase Auth session is used for login; the authenticated role is resolved through the protected `/api/mta/me` path.
- Accepted roles are explicitly constrained to OWNER, ADMIN, EDITOR, REVIEWER, and AUDITOR.
- Navigation and privileged backup/restore controls are projected from the resolved RBAC role.
- Public self-registration is removed from the visible application entry point; account provisioning remains administrative.
- Added a dedicated authentication/RBAC contract test and Domain CI gate.
- This remains a synthetic/local UI contract; production authorization continues to depend on the protected API/RLS boundary.

## Governance lock

Migration Freeze TRUE. AI OFF. Repository SYNTHETIC ONLY. Production access NOT AUTHORIZED. Live PostgreSQL execution BLOCKED pending explicit governance clearance and approved non-production target.

## Observation blocker

GitHub Actions remains an observation blocker for the full domain gate. New commits must not be described as CI-PASS until observable workflow steps/logs/artifacts exist. The dedicated responsive device workflow has produced successful phone/tablet/desktop smoke evidence for the earlier responsive-shell revision; the newest shell hardening revision is awaiting its current workflow run.
