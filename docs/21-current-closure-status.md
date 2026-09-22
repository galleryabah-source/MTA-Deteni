# MTA DETENI — Current Closure Status

**Revision:** `fix/runtime-functional-audit-2026-09-22`  
**Date:** 2026-09-22

## Full Functional + Runtime Integration Audit — 2026-09-22

- Audit branch: `fix/runtime-functional-audit-2026-09-22`.
- QR print action was found bypassing the clean QR-only printer; the action is now wired to `window.p6printQR()` and the worker cache version was bumped to `v5`.
- Duplicate QR camera `detected()` implementation was found and removed.
- The production API CORS response now varies on `Origin`; this is a hardening change, not a production authorization grant.
- **Open functional blocker:** QR resolution is still local-storage scoped in preview. A QR generated on device A cannot resolve its synthetic resource on device B unless the resource registry is shared. This must be solved by the LAN/local runtime shared registry or the authorized production API; the current `resourceId/token` payload alone is insufficient.
- **Open architecture blocker:** the main UI domain workflows still persist to `mta-deteni-demo-v2` localStorage, while `mta-production-api.js` exists as a separate adapter. Production API availability therefore must not be interpreted as domain persistence integration.
- **Open runtime blocker:** CI evidence is synthetic/controlled-nonprod. Physical PC/LAN, real multi-device acceptance, controlled Cloudflare non-prod runtime, and actual restore/DR remain external gates.
- **Open authorization blocker:** canonical scope authorization is not yet established; production SELECT RLS must remain unchanged until the scope model is explicit.

## Verified

- Domain CI run 1446: **PASS**
  - static architecture gate
  - production typecheck
  - test typecheck
  - JavaScript regression suite
  - TypeScript domain suite
  - controlled execution evidence harness
  - evidence validator
  - evidence artifact upload
- P1 Runtime Observation run 237: **PASS**
- Supabase project `MTA DETENI`: **ACTIVE_HEALTHY**
- Supabase Security Advisor: **0 findings**
- Supabase Performance Advisor: 8 INFO unused-index observations; retained intentionally because the database is still synthetic/low-volume and the indexes are part of the planned operational access paths.

## Implemented in this closure pass

- Integrated Acceptance Journey contract `IAJ-v1`
- Controlled-nonprod executable Integrated Acceptance runtime evidence: Domain CI Run #1470; artifact `10673903431`; all five mandatory stages observed PASS.
- Local Runtime Adapter executable evidence: Domain CI Run #1480 **PASS**.
- Local Runtime Recovery executable evidence: Domain CI Run #1480 **PASS**; artifact `10674888472` proves first admission APPLY, idempotent replay `REPLAYED`, fingerprint drift `CONFLICT/FINGERPRINT_CONFLICT`, deterministic sync APPLY, and deterministic sync replay `REPLAYED`.
- The evidence remains synthetic controlled-nonprod adapter/engine evidence; physical PC/LAN deployment remains an external acceptance gate.
- Cross-stage binding for:
  - domain journey
  - offline/reconnect
  - QR
  - Daily Guard Report
  - audit/outbox correlation
- Negative-path regression for stage incompleteness and audit/outbox correlation drift.
- Backup/recovery continuity executable evidence: Domain CI Run #1484 **PASS**, including valid-chain READY, missing-predecessor BLOCKED, and committed recovery certification with canonical RETRY → SKIP_DUPLICATE evidence.
- Runtime device/handoff executable evidence: Domain CI Run #1489 **PASS**; CLOUD/DESKTOP, LAN/TABLET, LOCAL/SMARTPHONE capability contracts, certified handoff with pending reconciliation, and responsive invariants were executed successfully.
- Physical device acceptance remains separate from synthetic CI evidence.
- Documentation now distinguishes contract completion from runtime evidence.
- F4 Daily Guard Report implementation now aggregates operational runtime state into DGR-v1 metrics, validates consistency/provenance before rendering/export, records report validation/render/export/print audit events, and binds the controlled Integrated Acceptance runtime to the same aggregation path. CI execution for the latest F4 commits is still pending/awaiting observable GitHub Actions evidence.

## Shared Persistence → QR → Protected Projection Audit — 2026-09-22

- P1 Runtime Observation #261: **PASS** on commit `8fbd7f4`.
- Added executable shared persistence gateway for the Detainee vertical slice:
  - Cloud LIST/CREATE/UPDATE/ARCHIVE route through Runtime Adapter → Production API.
  - Application shell loads the gateway and synchronizes the Detainee projection when an authenticated Cloud session is active.
- Added executable shared QR resolver contract for controlled-nonprod:
  - resourceId + opaque token lookup
  - active/revoked/expired/context validation
  - explicit DENIED outcomes
- Added protected QR projection boundary:
  - QR validation → authentication → authorization/RBAC → projection
  - correlated QR resolve and projection audit events.
- Added multi-device E2E contract execution using two distinct device identities against one shared registry; this proves the intended execution composition in synthetic controlled-nonprod only.
- **Important limitation:** the shared QR resolver is currently an executable in-memory controlled-nonprod contract. It is not yet a LAN persistent registry or production PostgreSQL-backed resolver. Therefore physical cross-device QR acceptance remains OPEN.
- Domain CI #1554 was observed pending at the time of this audit continuation; its final conclusion must be verified before treating the latest branch as CI-green.

## Canonical QR Persistence Audit — 2026-09-22

- Live Supabase schema audit completed against project `tmmhxqgzelgrsrxbbfzh`.
- Existing domain tables: `mta_detainees`, `mta_placements`, `mta_movements`, `mta_leaves`, `mta_documents`, `mta_audit_events`, `mta_profiles`, plus storage/AI support tables.
- All inspected MTA tables have RLS enabled.
- Live `pg_policies` inspection returned no public table policies. This preserves deny-by-default and confirms that a QR table must not receive permissive access just to make the feature work.
- `mta_profiles` roles are OWNER/ADMIN/EDITOR/REVIEWER/AUDITOR/VIEWER. The current API authenticates the bearer token and checks an active profile; write roles are OWNER/ADMIN/EDITOR.
- No canonical organizational scope/ownership dimension was found in the inspected domain schema. Scope authorization therefore remains an explicit gate and was not invented for QR.
- Canonical QR registry design documented in `docs/22-qr-registry-schema-authorization-audit.md`.
- Proposed registry uses a token verifier/hash rather than persisting the raw QR token in normal reads and references `mta_detainees`.
- Runtime-neutral persistence adapters are now implemented:
  - `src/application/local-postgres-qr-registry.ts`
  - `src/application/supabase-qr-registry.ts`
- Adapter parity tests added in `test/shared-qr-persistence-adapters.test.ts`.
- **No QR migration has been applied to Supabase.** The adapters are concrete and migration-ready, but the physical table and RLS policy remain intentionally uncreated until canonical scope authorization is settled.

## Canonical Scope + QR Registry Activation — 2026-09-22

- Canonical scope model implemented as `mta_scopes` + `mta_profile_scopes`.
- `mta_detainees.scope_id` is now mandatory; the live database had 0 detainees at migration time, so no existing records required backfill.
- Scope inheritance is enforced for detainee-linked placements, movements, and leaves.
- Legacy broad `using(true)` policies on those operational tables were explicitly removed by the scope-hardening migration.
- Canonical `mta_qr_registry` was created with RLS enabled and no anonymous/authenticated direct table grants.
- QR registry stores `token_hash`, not raw QR tokens.
- `mta_resolve_qr(resource_id, token, context)` is a SECURITY DEFINER resolver with explicit authentication, active-profile, role, and scope checks.
- The resolver was hardened again with `mta_qr_resolver_active_expiry_hardening`: empty tokens are rejected, only `ACTIVE` records resolve, and expired records are excluded at the database boundary.
- The Cloud MTA API now exposes the authenticated QR resolution path at `qr-registry/resolve`, backed by the canonical database function.
- The Cloud Detainee flow now requires an explicit operational `scope_id`; the UI loads authorized scopes through the authenticated API and persists only the selected scope identifier locally as runtime context.
- Runtime shell cache was bumped to v8 so the scope-aware Detainee flow is not served from the previous service-worker shell cache.
- Local PostgreSQL and Supabase adapters therefore now target the same runtime-neutral resolver contract.
- Supabase migrations applied successfully:
  - `mta_canonical_scope_and_qr_registry`
  - `mta_scope_policy_hardening`
  - `mta_scope_policy_legacy_cleanup`
- **Remaining gate:** populate/assign operational test scopes and profile memberships in a controlled non-production identity set, then execute authenticated multi-user scope-isolation tests. No real detainee data has been introduced.

## Next checkpoint — Canonical scope isolation contract — 2026-09-22

- Added executable repository contract coverage for the canonical scope model.
- Verified the intended scoped operator matrix:
  - EDITOR/REVIEWER/VIEWER require active membership in the detainee scope.
  - OWNER/ADMIN/AUDITOR retain the explicitly defined cross-scope administrative/read authority.
  - EDITOR write operations remain constrained by active scope membership.
- Added explicit two-user/two-scope negative-path coverage: USER-A cannot access SCOPE-B and USER-B cannot access SCOPE-A.
- Added regression coverage ensuring Cloud detainee creation cannot cross the persistence boundary without an explicit operational scope_id.
- Added regression coverage that the legacy broad child-table policies are removed and scope inheritance remains tied to mta_detainees.scope_id.
- QR database resolution remains constrained by the same detainee scope and now resolves only ACTIVE, non-expired records.
- **This checkpoint is still contract-level evidence.** It does not claim that two real authenticated Supabase identities have been provisioned and exercised against live RLS. That remains the next controlled non-production execution gate.


## Authenticated multi-user isolation execution status — 2026-09-22

- The live Supabase project initially had zero `mta_profiles`, scopes, memberships, detainees, and QR records. No real detainee data was introduced.
- The authenticated API role was missing table privileges for the RLS-protected operational domain tables. This was corrected with `mta_authenticated_domain_table_grants`; RLS remains the authorization layer.
- The QR resolver was hardened from SECURITY DEFINER to SECURITY INVOKER and the QR registry received authenticated SELECT through RLS. Supabase Security Advisor is now clean (`lints: []`).
- A controlled database-session negative-path check was executed with the `authenticated` role and a synthetic JWT subject: visible domain rows remained zero under the deny-by-default state.
- **Positive two-user runtime isolation is not yet certified.** There are currently no authenticated test profiles in the project, and this execution environment does not provision real Supabase Auth credentials. The remaining evidence requires two controlled non-production Auth identities plus synthetic scopes/detainees, then API-level tests for own-scope allow, cross-scope deny, QR cross-scope deny, and write isolation.
- The checkpoint therefore advances the security/runtime contract and live authorization surface, but remains **OPEN for authenticated positive-path evidence**.


## Controlled Auth Identity Provisioning + Positive Isolation Harness — 2026-09-22

- Added `scripts/mta-authenticated-scope-isolation.mjs`, a controlled non-production runner that provisions two synthetic Supabase Auth users through the Admin Auth API, creates two synthetic scopes and detainees, assigns one scope per user, signs both users in, and exercises RLS through PostgREST.
- The harness covers own-scope read allow, cross-scope read denial, own-scope insert allow, cross-scope insert denial, own QR resolution, and cross-scope QR denial for both users.
- The harness cleans all synthetic QR, detainee, membership, profile, scope, and Auth-user fixtures in `finally`, so the execution leaves no controlled test identities behind.
- Added manual GitHub workflow `.github/workflows/mta-authenticated-scope-isolation.yml`. It requires dedicated `MTA_NONPROD_*` GitHub secrets and explicitly asserts `MTA_EXECUTION_ENV=controlled-nonprod`.
- **Live positive execution is not yet claimed as PASS in this chat session.** The available Supabase management tooling does not expose the Auth Admin create-user/sign-in operation directly, and the direct database mutation route for creating `auth.users` was blocked by the execution safety boundary. Therefore no synthetic Auth identities were left behind merely to manufacture evidence.
- The repository now contains the deterministic execution mechanism needed for the next authenticated gate; its PASS evidence must come from an actual controlled workflow run with non-production Auth credentials.


## Application Solidification Pass — 2026-09-22

The runtime integration was tightened as a single-application boundary rather than allowing partially connected persistence paths:

- The shared domain gateway now exposes one generic authenticated Cloud persistence surface for detainees, placements, movements, leaves, documents, scopes, and read-only audit events.
- Cloud runtime state now hydrates the operational domain from the shared persistence source instead of retaining independent local copies for each vertical.
- Placement, movement, leave, and Daily Guard Report creation/lifecycle mutations now persist through the same Cloud runtime adapter when CLOUD mode is active.
- Browser localStorage remains the LOCAL synthetic runtime only; save() is fail-closed/no-op in CLOUD mode so an accidental local write cannot masquerade as Cloud persistence.
- Runtime mode is surfaced in the UI (LOCAL SYNTHETIC, LAN LOCAL, or CLOUD AUTHENTICATED) and a mode change rehydrates the appropriate state boundary.
- Audit events in CLOUD mode are read from the backend audit surface; the browser synthetic audit ledger is not used as a substitute for database audit events.
- The Cloud API exposes audit-events as read-only; domain writes remain governed by RLS and role checks.
- Live Supabase `mta_audit_events` now has an explicit authenticated SELECT grant while its existing RLS policy restricts visibility to OWNER/ADMIN/AUDITOR; the corresponding migration is committed as `20260922170000_mta_audit_events_authenticated_read_grant.sql`.
- Service-worker/cache versioning was bumped so the new shared gateway cannot remain hidden behind the previous shell cache.
- Domain CI and P1 observation are configured to execute on the audit branch as well as main, improving evidence visibility before merge.

This pass deliberately does not claim production readiness. Actual authenticated two-user isolation, physical LAN/local persistence, physical multi-device QR/offline acceptance, Cloudflare controlled-nonprod runtime, and actual restore/DR evidence remain separate gates.

## Still open before production activation

1. Controlled non-production identities/scopes and authenticated multi-user scope-isolation evidence.
2. Physical Offline/LAN execution on the intended PC/local runtime, including real local persistence, reconnect/reconciliation, and device/network handoff acceptance.
3. Daily Guard Report + QR + desktop/tablet/smartphone acceptance; contract implementation is complete, but physical/runtime acceptance remains open.
4. Cloudflare controlled-nonprod runtime validation.
5. Backup/restore and disaster-recovery execution evidence against an actual recoverable runtime/storage target; synthetic backup-chain and recovery certification do not substitute for restore testing.
6. Final production-readiness review.

## Deployment hardening

- Cloudflare production deployment is now **manual (`workflow_dispatch`)** rather than automatic on every `main` push.
- The production workflow performs an artifact preflight before reading deployment credentials or invoking Wrangler.
- Cloudflare preview remains the controlled non-production path; its independent runtime-health verification is still open because the preview hostname is not yet fixed in deployment configuration.

## Governance locks

- No production migration execution is implied by this status.
- No real detainee/PII/health/WhatsApp data.
- AI remains disabled as a decision-maker.
- External durable publication remains disabled unless separately authorized.
- No production GO decision is inferred from CI PASS alone.

## Decision

The application remains **not production-ready**. The canonical scope/RLS and QR persistence foundation is now implemented and applied to the Supabase project, while the remaining work is authenticated multi-user isolation evidence, physical/local runtime acceptance, controlled Cloudflare validation, actual restore/DR evidence, and final operational review. CI status must be taken from the latest observable workflow run rather than inferred from the contract implementation.
