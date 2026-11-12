# P9.3 WP2.1 — Migration Provenance Reconciliation 01

**Date:** 2026-11-04  
**Environment:** Supabase project `tmmhxqgzelgrsrxbbfzh` + repository `galleryabah-source/MTA-Deteni`  
**Mode:** Read-only inspection; documentation-only repository update  
**Status:** PARTIAL RECONCILIATION — NOT CERTIFIED

## 1. Safety boundary

- No DDL/DML executed.
- No migration applied, repaired, deleted, reordered, or squashed.
- No Supabase Auth, Storage, RLS, policy, grant, or project setting changed.
- No deployment performed.
- `MIGRATION_FREEZE = TRUE`; `AI_ENABLED = FALSE`; production write gate OFF; Production Readiness NO-GO.

## 2. Authoritative live migration inventory

A fresh read-only `list_migrations` inspection returned **44 entries**. This corrects the earlier documentation typo that referred to 45 entries.

The live migration versions and names, in returned order:

| # | Version | Live migration name |
|---:|---|---|
| 1 | 20260921060546 | mta_deteni_production_activation_foundation |
| 2 | 20260921060945 | mta_production_auth_rbac_v1 |
| 3 | 20260921061152 | mta_production_auth_rbac_v1_1_hardening |
| 4 | 20260921061424 | mta_production_auth_rbac_v1_2_private_helper |
| 5 | 20260922075730 | mta_canonical_scope_and_qr_registry |
| 6 | 20260922075831 | mta_scope_policy_hardening |
| 7 | 20260922075919 | mta_scope_policy_legacy_cleanup |
| 8 | 20260922080419 | mta_qr_resolver_active_expiry_hardening |
| 9 | 20260922082436 | mta_authenticated_domain_table_grants |
| 10 | 20260922082515 | mta_qr_resolver_invoker_hardening |
| 11 | 20260922082545 | mta_qr_registry_policy_performance_hardening |
| 12 | 20260922084559 | mta_audit_events_authenticated_read_grant |
| 13 | 20260922162628 | mta_ai_secure_configuration |
| 14 | 20260922220723 | mta_p97_durable_idempotency_transaction_boundary_v1 |
| 15 | 20260922220740 | mta_p97_durable_idempotency_transaction_boundary_v2 |
| 16 | 20260922220754 | mta_p97_durable_idempotency_transaction_boundary_v3 |
| 17 | 20260922220814 | mta_p97_durable_idempotency_rpc_wrapper_v1 |
| 18 | 20260922221532 | mta_p98_transactional_outbox_v1 |
| 19 | 20260922221548 | mta_p98_outbox_event_identity_v2 |
| 20 | 20260922222630 | mta_p98_outbox_dispatcher_v1 |
| 21 | 20260923022848 | mta_document_storage_read_hardening_v2 |
| 22 | 20260923022906 | mta_audit_hash_chain_v2 |
| 23 | 20260927130954 | mta_production_master_room_block_v1 |
| 24 | 20260927132428 | mta_transactional_movement_v1 |
| 25 | 20260927132513 | mta_transactional_movement_v1_idempotency_fix |
| 26 | 20260928025558 | mta_admin_users_service_role_privilege_v1 |
| 27 | 20260928045151 | mta_identity_credential_hardening_v1 |
| 28 | 20260928045425 | mta_identity_credential_bootstrap_v1 |
| 29 | 20260930082416 | mta_master_block_room_mutation_allowlist_v1 |
| 30 | 20260930105429 | mta_master_block_room_service_role_grants_v1 |
| 31 | 20260930111302 | mta_audit_service_role_read_insert_grant_v1 |
| 32 | 20261001001128 | mta_p97_service_role_dml_grants_v1 |
| 33 | 20261001073742 | mta_nip_identity_contract_v1 |
| 34 | 20261001073827 | assign_initial_owner_admin_nip_v1 |
| 35 | 20261001073833 | audit_initial_owner_admin_nip_assignment_v1 |
| 36 | 20261001224520 | mta_audit_sequence_v1 |
| 37 | 20261002101550 | add_canonical_detainee_nid |
| 38 | 20261002101713 | harden_canonical_detainee_nid_generator |
| 39 | 20261002101718 | harden_canonical_detainee_nid_search_path |
| 40 | 20261002150223 | 20261002160000_mta_detainee_direct_write_containment_v1 |
| 41 | 20261002155310 | 20261002223000_g1_x4_privileged_movement_execute_containment_v1 |
| 42 | 20261005072434 | 20261005130000_mta_p97_detainee_nid_sequence_grant_v1 |
| 43 | 20261014010854 | mta_detainee_activity_health_records_v1 |
| 44 | 20261014010900 | mta_audit_chain_epochs_rls_v1 |

## 3. Repository inventory reconciliation

The previously inspected repository inventory contains 26 SQL migration files:
- 23 live entries have a normalized-name counterpart in the repository inventory.
- 21 live entries have no normalized-name counterpart.
- 3 repository SQL files have no normalized-name counterpart in the live migration inventory.

These are filename/version matching results only. A timestamp or name mismatch is not proof that SQL effects are absent, and a similar name is not proof of semantic equivalence.

### 3.1 Live entries without normalized-name counterparts

The 21 live names requiring source/commit provenance resolution are:

1. `mta_qr_resolver_active_expiry_hardening`
2. `mta_authenticated_domain_table_grants`
3. `mta_qr_resolver_invoker_hardening`
4. `mta_qr_registry_policy_performance_hardening`
5. `mta_audit_events_authenticated_read_grant`
6. `mta_ai_secure_configuration`
7. `mta_p97_durable_idempotency_transaction_boundary_v1`
8. `mta_p97_durable_idempotency_transaction_boundary_v2`
9. `mta_p97_durable_idempotency_transaction_boundary_v3`
10. `mta_p97_durable_idempotency_rpc_wrapper_v1`
11. `mta_p98_transactional_outbox_v1`
12. `mta_p98_outbox_event_identity_v2`
13. `mta_p98_outbox_dispatcher_v1`
14. `mta_document_storage_read_hardening_v2`
15. `mta_audit_hash_chain_v2`
16. `mta_transactional_movement_v1_idempotency_fix`
17. `mta_admin_users_service_role_privilege_v1`
18. `mta_audit_service_role_read_insert_grant_v1`
19. `mta_p97_service_role_dml_grants_v1`
20. `assign_initial_owner_admin_nip_v1`
21. `audit_initial_owner_admin_nip_assignment_v1`

**Current classification:** the 21 entries have no normalized-name counterpart under `supabase/migrations/`, but they are not all source-missing. Follow-up repository searches found archived P9.7 source SQL for four live entries and a P9.8 provenance manifest for three live entries. These are `ARCHIVED_SOURCE_FOUND` candidates, not yet `EXACT_MATCH` or `SAME_EFFECT_RECONSTRUCTED`. The remaining entries stay `UNRESOLVED_LIVE_SOURCE_PROVENANCE`. No semantic equivalence is asserted.

### 3.2 Repository SQL files without normalized-name live counterparts

Three files were fetched from the repository default branch and inspected:

| Repository SQL file | Observed SQL effect | Current classification |
|---|---|---|
| `20260923040000_mta_document_storage_read_hardening.sql` | Replaces document SELECT policy; EDITOR/REVIEWER metadata SELECT is constrained through linked document creator identity. | `REPO_ONLY_NAME_MATCH`; possible predecessor/reconstruction of live v2 is unproven. |
| `20260923041000_mta_audit_hash_chain_v1.sql` | Adds hash version/previous/event hash, backfills chain, installs insert hash trigger and immutable update/delete triggers, exposes verifier only to service_role. | `REPO_ONLY_NAME_MATCH`; possible predecessor/reconstruction of live v2 is unproven. |
| `20260929100000_mta_scope_metadata_admin_config_v1.sql` | Adds `mta_scopes.metadata jsonb NOT NULL DEFAULT '{}'` and documents adminSettings placement. | `REPO_ONLY_NAME_MATCH`; no live counterpart established by name or effect yet. |

The repository workflow and tests explicitly reference the document hardening and audit hash-chain v1 files. This proves repository CI depends on those files; it does **not** prove the corresponding SQL was applied to the live project or that the live v2 migrations are semantically identical.

### 3.3 Evidence limits

The current Supabase migration-history listing provides version and name, not the original SQL body or Git commit SHA. The GitHub inspection retrieved repository SQL bodies, but did not yet establish the originating commit/PR for all live entries. Therefore:
- no migration is classified `EXACT_SQL_MATCH` solely from a normalized filename;
- no migration is classified `SAME_EFFECT_RECONSTRUCTED` without a side-by-side SQL-effect comparison;
- no migration is classified definitively `LIVE_ONLY` until Git history, PR patches, and archived sources have been searched;
- no migration history repair is proposed.

## 4. Provenance classification model

Use the following controlled labels in the final matrix:

| Label | Required evidence |
|---|---|
| `EXACT_MATCH` | Live version/name mapped to repository file and SQL content/commit provenance verified. |
| `SAME_EFFECT_RECONSTRUCTED` | Different source filename/version, but all relevant schema, policy, function, trigger, grant, and data effects compared and shown equivalent. |
| `LIVE_ONLY` | Live effect exists with no authoritative source/commit/PR/backup artifact after documented exhaustive search. |
| `REPO_ONLY` | Repository migration has no live migration-history entry and its effects are not found in live catalog; do not infer non-application from history name alone. |
| `UNRESOLVED` | Evidence is incomplete or conflicting. |

## 5. Required next steps

1. Retrieve complete repository migration path inventory at the same immutable commit as the PR base.
2. Search GitHub commit/PR history for the 21 unmatched live migration names and their SQL signatures.
3. Compare candidate SQL effects against live catalog definitions: tables/columns, policies, functions, triggers, grants, constraints, indexes, and relevant seed/assignment effects.
4. Inspect the three repository-only SQL files against current live catalog to determine whether effects exist under another migration name.
5. Build one row per 44 live entries and one row per 26 repository files, each with source path, commit/PR, effect comparison, evidence URI, and classification.
6. Keep all database operations read-only. No migration repair or apply during this work package.

## 6. Gate decision

**WP2.1: IN PROGRESS — PARTIAL EVIDENCE ONLY.**  
**P9.3: FORENSIC IN PROGRESS — NOT CERTIFIED.**

No production write, migration, configuration, Auth, Storage, or deployment authorization is implied by this report.


## 7. WP2.1 follow-up — archived P9.7/P9.8 source evidence

A second repository search located historical source artifacts that were not under `supabase/migrations/`.

### 7.1 P9.7 — four archived SQL sources found

The repository contains `docs/03-implementation/P9.7-RECOVERED-MIGRATION-PROVENANCE-MANIFEST.md`, which attributes the following live production versions to the historical branch `p9.7-durable-postgres-boundary-2026-09-23`:

| Live version | Live name | Archived source |
|---|---|---|
| 20260922220723 | mta_p97_durable_idempotency_transaction_boundary_v1 | `P9.7-recovered-migration-sources/20260922220723_mta_p97_durable_idempotency_transaction_boundary_v1.sql` |
| 20260922220740 | mta_p97_durable_idempotency_transaction_boundary_v2 | `P9.7-recovered-migration-sources/20260922220740_mta_p97_durable_idempotency_transaction_boundary_v2.sql` |
| 20260922220754 | mta_p97_durable_idempotency_transaction_boundary_v3 | `P9.7-recovered-migration-sources/20260922220754_mta_p97_durable_idempotency_transaction_boundary_v3.sql` |
| 20260922220814 | mta_p97_durable_idempotency_rpc_wrapper_v1 | `P9.7-recovered-migration-sources/20260922220814_mta_p97_durable_idempotency_rpc_wrapper_v1.sql` |

The four archived files were fetched and inspected:
- v1 creates `mta_internal.idempotency_keys`, its completed-at index, enables RLS, revokes anon/authenticated privileges, and grants service_role access.
- v2 is explicitly a reconciliation marker; its body says the executable transaction boundary is finalized in v3.
- v3 defines `mta_internal.execute_idempotent_mutation(...)`, including idempotency replay/conflict checks, table/operation allowlists, mutation execution, audit insertion, and idempotency completion.
- RPC wrapper v1 defines `public.mta_execute_idempotent_mutation(...)` delegating to the internal function and restricts EXECUTE to service_role.

**Classification:** `ARCHIVED_SOURCE_FOUND` for all four P9.7 entries. The manifest and archived SQL establish a traceable source artifact, but do not by themselves prove byte-for-byte equivalence with the applied live migration or identify a live migration checksum. Keep them archived; do not move them into the executable migrations directory during migration freeze.

### 7.2 P9.8 — provenance manifest found; version discrepancy remains

The repository contains `docs/03-implementation/P9.8-RECOVERED-MIGRATION-PROVENANCE-MANIFEST.md` with these dispositions:

| Manifest version/name | Manifest claim | Live inventory comparison |
|---|---|---|
| 20260922221532_mta_p98_transactional_outbox_v1 | recovered and archived as provenance | Live version/name match |
| 20260922221548_mta_p98_outbox_event_identity_v2 | recovered by historical branch comparison; executable body verified against live production function | Live version/name match; underlying comparison evidence still needs direct review |
| 20260922222000_mta_p98_outbox_dispatcher_v1 | recovered and archived as provenance | Live inventory has version 20260922222630 with same name; timestamp/version discrepancy unresolved |

The P9.8 manifest is provenance evidence, not the SQL body itself. The dispatcher version discrepancy must be traced to historical branch commits/renames and not silently normalized. The P9.8 manifest's statement that the event-identity executable body was verified is recorded as a prior repository assertion; this WP2.1 pass has not independently reproduced that full comparison.

**Classification:** `ARCHIVED_PROVENANCE_MANIFEST_FOUND` for the three P9.8 entries. Dispatcher remains `UNRESOLVED_VERSION_MAPPING` until source commit/branch lineage is verified.

### 7.3 Revised remaining search scope

The 21 live entries without a normalized migration path now divide into:
- 4 P9.7 entries with archived SQL source artifacts;
- 3 P9.8 entries with a recovered provenance manifest (one has a live/manifest version discrepancy);
- 14 entries still requiring source/commit/PR or archived artifact discovery.

This is a source-discovery classification only. It does not change the live database, migration history, or release gate.



## 8. Additional source-path findings and inspection limitation

### 8.1 Admin-users service-role privilege — same migration name, different version

A repository search found:
`supabase/migrations/20260928093000_mta_admin_users_service_role_privilege_v1.sql`

Its SQL grants SELECT/INSERT/UPDATE/DELETE on `public.mta_profiles` to `service_role` and adds a table comment describing the protected `mta-api` admin-users path.

The live migration inventory records the same migration name at version `20260928025558`. This is a **same-name / version mismatch candidate**. The file is an authoritative repository source artifact, but its timestamp does not match the live version. Do not classify it as `EXACT_MATCH` until historical branch/commit evidence confirms the version mapping and SQL effect against the live catalog.

### 8.2 Transactional movement and outbox source artifact

The repository file `supabase/migrations/20260927123000_mta_transactional_movement_v1.sql` contains:
- `mta_internal.idempotency_keys` and `mta_internal.outbox_events` table definitions;
- a transactional movement function with replay/conflict handling;
- movement/placement/detainee updates;
- audit event insertion and outbox event insertion in one transaction;
- a service-role-only public RPC wrapper.

The live migration history separately records `mta_transactional_movement_v1` at version `20260927132428`. This is a same-name / version mismatch candidate whose effects overlap with P9.7/P9.8 foundations. It must be compared carefully with the recovered P9.7/P9.8 sources and live function definitions; do not count the same database effect twice or infer that the full P9.7/P9.8 sequence is represented by this movement migration.

### 8.3 Repository search results for the remaining names

The default-branch code search returned no exact file hits for the following names:
- `mta_qr_resolver_active_expiry_hardening`
- `mta_authenticated_domain_table_grants`
- `mta_qr_registry_policy_performance_hardening`
- `mta_audit_events_authenticated_read_grant`
- `mta_ai_secure_configuration`
- `mta_audit_service_role_read_insert_grant_v1`
- `assign_initial_owner_admin_nip_v1`
- `audit_initial_owner_admin_nip_assignment_v1`
- `mta_transactional_movement_v1_idempotency_fix`
- `20261002160000_mta_detainee_direct_write_containment_v1`
- `20261002223000_g1_x4_privileged_movement_execute_containment_v1`
- `mta_document_storage_read_hardening_v2`
- `mta_audit_hash_chain_v2`

This is a bounded search result, not proof of absence: GitHub code search covered the default branch, and commit-message search did not return matches for these exact strings. Historical branches, deleted paths, PR patches, release artifacts, and external backups remain possible sources.

### 8.4 Live catalog query attempt

A read-only PostgreSQL catalog query was attempted to check whether object/policy/function names corresponding to the unresolved migration labels exist. The Supabase SQL execution service returned a connection error: PostgreSQL authentication failed for user `postgres` (SQLSTATE `28P01`). No query results were returned and no database mutation occurred.

Therefore no new live-catalog conclusion is drawn from this attempt. Retry only when the read-only SQL connection is healthy; until then retain the prior verified live metadata and mark new effect-level comparisons as pending.

### 8.5 Updated disposition

- P9.7: 4 archived SQL sources found; source provenance is documented, but byte-for-byte/live-effect verification remains open.
- P9.8: 3 manifest entries found; dispatcher version mapping remains unresolved.
- Admin-users privilege and transactional movement: repository SQL source files found with version mismatches that require lineage/effect verification.
- Remaining exact-name searches: no source hit in the default-branch search; classification remains `UNRESOLVED`, not `LIVE_ONLY`.
- Live catalog effect verification: blocked for this pass by SQL connection authentication failure.

**WP2.1 remains PARTIAL — NOT CERTIFIED.**


## 9. WP2.1.3 — Historical branch lineage recovery (follow-up)

A branch-level repository inspection recovered the original P9.8 migration paths from the historical branch `p9.8-application-e2e-2026-09-23`. This improves the evidence beyond the earlier manifest-only result.

### 9.1 P9.8 outbox table — exact version/path recovery

Fetched from `p9.8-application-e2e-2026-09-23`:

- Path: `supabase/migrations/20260922221532_mta_p98_transactional_outbox_v1.sql`
- Blob SHA: `861c00d366518048947c4956ee45e456064566c0`
- Live inventory: version `20260922221532`, name `mta_p98_transactional_outbox_v1`.

The recovered SQL creates `mta_internal.outbox_events`, indexes pending and aggregate lookup paths, enables RLS, revokes client-role table privileges, and grants service_role table privileges.

**Disposition:** `HISTORICAL_SOURCE_PATH_AND_VERSION_MATCH`. This confirms a historical repository source path at the exact live version. It does not independently establish that the currently deployed object state is byte-for-byte or effect-for-effect identical; live catalog comparison remains required.

### 9.2 P9.8 event identity — exact version/path recovery

Fetched from `p9.8-application-e2e-2026-09-23`:

- Path: `supabase/migrations/20260922221548_mta_p98_outbox_event_identity_v2.sql`
- Blob SHA: `2627aa5cda855990807529269dff4decdb23fafe`
- Live inventory: version `20260922221548`, name `mta_p98_outbox_event_identity_v2`.

The recovered SQL replaces `mta_internal.execute_idempotent_mutation(...)`. Its body enforces service-role context, validates idempotency key/request hash, restricts operation and target table names, performs mutation, inserts audit and outbox records, completes the idempotency response, and restricts function EXECUTE to service_role.

**Disposition:** `HISTORICAL_SOURCE_PATH_AND_VERSION_MATCH`. The path and version now match the live migration inventory. The prior P9.8 manifest also asserted that the executable body was verified against the live production function; this pass retrieved the historical body but did not obtain a successful fresh live SQL definition comparison. Do not elevate this to `EXACT_SQL_MATCH` or `SAME_EFFECT_RECONSTRUCTED` yet.

### 9.3 P9.8 dispatcher — unresolved version mapping

Fetched from `p9.8-application-e2e-2026-09-23`:

- Path: `supabase/migrations/20260922222000_mta_p98_outbox_dispatcher_v1.sql`
- Blob SHA: `acd14a3081a2f5ae28cf9606de5bb6585840c8ec`
- Live inventory: version `20260922222630`, name `mta_p98_outbox_dispatcher_v1`.

The recovered SQL defines `claim_outbox_events`, `release_outbox_event`, and `complete_outbox_event`, with service_role-only EXECUTE grants. The source version differs from the live version by 630 seconds.

**Disposition:** `UNRESOLVED_VERSION_MAPPING`. Need a commit/PR lineage bridge or another authoritative source showing the timestamp/version change, then compare function signatures, bodies, ownership, search_path, grants, and live catalog definitions. Do not silently relabel the archived file or alter migration history.

### 9.4 Historical branch lookup limitations

- The three P9.8 files were successfully retrieved from `p9.8-application-e2e-2026-09-23`.
- The same paths were not found at `p9.8-outbox-2026-09-23` through the GitHub contents endpoint. This is recorded only as a retrieval limitation for that branch/path combination, not as proof that the branch or source never existed.
- PR #171 and #172 independently contain patch copies of the first two P9.8 migration bodies, with later migration filenames `20260923100000` and `20260923100500`. Those later patch copies are not the matching live-version source paths; the historical branch files above are the stronger path/version evidence.

### 9.5 WP2.1.3 status update

| P9.8 live migration | Historical source | Current disposition |
|---|---|---|
| 20260922221532 transactional_outbox_v1 | Exact same-version path recovered | `HISTORICAL_SOURCE_PATH_AND_VERSION_MATCH` |
| 20260922221548 outbox_event_identity_v2 | Exact same-version path recovered | `HISTORICAL_SOURCE_PATH_AND_VERSION_MATCH` |
| 20260922222630 outbox_dispatcher_v1 | Source path exists at 20260922222000 | `UNRESOLVED_VERSION_MAPPING` |

WP2.1.3 is **PARTIALLY ADVANCED**, not complete. The recovered source files improve historical provenance but do not replace the required SQL-effect comparison against live catalog definitions. The previous SQL authentication failure (SQLSTATE `28P01`) remains a blocker to fresh direct catalog comparison.

No database query was successfully executed in this follow-up. No DDL/DML, migration execution, Auth/Storage/RLS/grant change, or deployment was performed.

**Gate remains:** WP2.1 PARTIAL — NOT CERTIFIED; P9.3 FORENSIC IN PROGRESS — NOT CERTIFIED.


## 10. WP2.1.3 — Additional PR-lineage recovery

A targeted PR-history search recovered authoritative merged PR patches for four more live migration labels. The evidence is stronger than default-branch exact-name search alone, but each item has a production-history version differing from the SQL filename timestamp.

### 10.1 G1 direct detainee DML containment

- Merged PR: #299 — `hardening: contain direct detainee DML at database boundary`
- Historical branch: `hardening/g1-detainee-direct-write-containment-v1`
- Merged at: 2026-10-02T14:59:52Z
- Source path: `supabase/migrations/20261002160000_mta_detainee_direct_write_containment_v1.sql`
- SQL effect in PR patch: revokes INSERT, UPDATE, DELETE on `public.mta_detainees` from `authenticated`.
- Live inventory: version `20261002150223`, name `20261002160000_mta_detainee_direct_write_containment_v1`.

**Disposition:** `MERGED_PR_SOURCE_FOUND_VERSION_MISMATCH`. The PR and SQL source are verified, but the live history version is earlier than the timestamp embedded in the migration name. Need migration history/commit lineage and live ACL comparison before effect equivalence is certified.

### 10.2 G1-X4 privileged movement execution containment

- Merged PR: #300 — `hardening: contain privileged movement writer execution`
- Historical branch: `hardening/g1-x4-privileged-writer-provenance-v2`
- Merged at: 2026-10-02T15:53:02Z
- Source path: `supabase/migrations/20261002223000_g1_x4_privileged_movement_execute_containment_v1.sql`
- SQL effect in PR patch: revokes EXECUTE on `mta_internal.execute_movement_transaction(...)` from PUBLIC, anon, authenticated; grants EXECUTE to service_role.
- Live inventory: version `20261002155310`, name `20261002223000_g1_x4_privileged_movement_execute_containment_v1`.

**Disposition:** `MERGED_PR_SOURCE_FOUND_VERSION_MISMATCH`. The PR patch and SQL effect are recovered, but the live history version differs from the migration filename timestamp. Verify exact function signature, effective ACL, and lineage before declaring equivalence.

### 10.3 Detainee activity and restricted health records

- Merged PR: #331 — `feat(db): persist detainee activity notes and restricted health records`
- Historical branch: `feat/qr-detainee-notes-health-records`
- Merged at: 2026-10-14T01:08:37Z
- Source path: `supabase/migrations/20261013090000_mta_detainee_activity_health_records_v1.sql`
- SQL patch defines activity-note and health-record tables, RLS and service-role grants, and a SECURITY DEFINER transactional RPC with idempotency, actor/scope checks, audit and outbox insertion.
- Live inventory: version `20261014010854`, name `mta_detainee_activity_health_records_v1`.

**Disposition:** `MERGED_PR_SOURCE_FOUND_VERSION_MISMATCH`. Source SQL is recovered from the merged PR patch, but its embedded migration timestamp differs from the live migration-history version. The migration body also requires live catalog/effective-privilege comparison; source discovery alone does not certify runtime behavior.

### 10.4 Audit-chain epoch RLS hardening

- Same merged PR: #331
- Source path: `supabase/migrations/20261013093000_mta_audit_chain_epochs_rls_v1.sql`
- SQL patch enables RLS, explicitly sets NO FORCE RLS, and revokes all table privileges from PUBLIC, anon, authenticated, and service_role on `public.mta_audit_chain_epochs`.
- Live inventory: version `20261014010900`, name `mta_audit_chain_epochs_rls_v1`.

**Disposition:** `MERGED_PR_SOURCE_FOUND_VERSION_MISMATCH`. The PR source and effect are identified, but the live version differs from the filename timestamp. The NO FORCE RLS owner/trigger behavior and effective grants still require catalog verification.

### 10.5 Additional lineage items outside the original 21-entry unmatched-name group

The four entries recovered in this section—G1 direct detainee DML containment (#299), G1-X4 privileged movement EXECUTE containment (#300), detainee activity/health records (#331), and audit-chain epoch RLS hardening (#331)—are additional live inventory entries whose migration names embed the source filename timestamp. They were not members of the original 21-entry normalized-name mismatch list in section 3.1, so they do not reduce that list's 14-entry post-P9.7/P9.8 source-discovery worklist.

These four source artifacts are recovered from merged PR patches, but each has a version/timestamp mismatch and remains pending live-effect comparison. They must be tracked as a separate lineage cohort, not used to adjust the original 21-entry count.

### 10.6 WP2.1.3 status

WP2.1.3 has now recovered additional P9.8 historical branch sources and four merged PR migration patches. The remaining core blocker is no longer simply locating source artifacts; it is proving the mapping from historical migration file/PR commit to the live migration-history version and comparing effective SQL objects/privileges. The previous read-only SQL authentication failure (SQLSTATE `28P01`) still prevents fresh direct catalog comparison.

**No production database query, DDL/DML, migration apply, Auth/Storage/RLS/grant change, or deployment was performed in this follow-up.**


## 11. WP2.1.3 — Recovered QR, audit, document, and movement lineage

A further branch-level search located the historical source files listed in the P9.6 recovered migration manifest. The source files were independently fetched from their named historical branches; their blob identities are recorded below. The P9.6 manifest is currently present in open PR #253 (not merged), so its semantic reconciliation assertions are treated as prior repository claims, not as fresh production verification.

### 11.1 Five QR / authenticated-grant migrations

Historical source branch: `p9.7-transaction-idempotency-reconciliation-2026-09-23`.

| Live production version | Live migration name | Historical source path | Blob SHA |
|---|---|---|---|
| 20260922080419 | mta_qr_resolver_active_expiry_hardening | `20260922150000_mta_qr_resolver_active_expiry_hardening.sql` | `d1e8b4eeed239a3d623da700e403c6d479eb96b7` |
| 20260922082436 | mta_authenticated_domain_table_grants | `20260922153000_mta_authenticated_domain_table_grants.sql` | `1f4cb3ea18ef1833a14495ea94d720dc8b9f3437` |
| 20260922082515 | mta_qr_resolver_invoker_hardening | `20260922154500_mta_qr_resolver_invoker_hardening.sql` | `037995e4b7e04157015026a821a704c020bfcfa9` |
| 20260922082545 | mta_qr_registry_policy_performance_hardening | `20260922160000_mta_qr_registry_policy_performance_hardening.sql` | `ff4f3686b10ed1de206c6949cfe0d430c9c90b5e` |
| 20260922084559 | mta_audit_events_authenticated_read_grant | `20260922170000_mta_audit_events_authenticated_read_grant.sql` | `8f786608d0e2574b149adff87e36d8f9d0fc86f3` |

Observed source effects:
- QR active/expiry hardening replaces `public.mta_resolve_qr` with authenticated-profile, scope, active-token, context, and expiry checks.
- Authenticated domain table grants grant CRUD to authenticated on the selected domain tables, relying on RLS for row authorization.
- QR invoker hardening replaces the resolver with SECURITY INVOKER and grants authenticated SELECT on the QR registry.
- QR policy/performance hardening splits write policies by action and adds creator/revoker indexes.
- Audit read grant gives authenticated SELECT on `mta_audit_events`, with RLS remaining the row-level authorization boundary.

**Disposition:** `HISTORICAL_SOURCE_PATH_RECOVERED` for all five. Their source filenames use later timestamps than the live migration-history versions. This is not an exact timestamp match. The P9.6 manifest claims semantic production matches, but this WP2.1 pass has not independently reproduced the full live policy/function/index/grant comparison. Keep effect equivalence pending.

### 11.2 Document storage read hardening and audit hash chain

Historical source branch: `phase9.8-outbox-hardening`.

| Live production version | Live migration name | Historical source path | Blob SHA |
|---|---|---|---|
| 20260923022848 | mta_document_storage_read_hardening_v2 | `20260923040000_mta_document_storage_read_hardening.sql` | `650e9c1cf0e5594f09e3993b2b4a28bfd26ac130` |
| 20260923022906 | mta_audit_hash_chain_v2 | `20260923041000_mta_audit_hash_chain_v1.sql` | `6009cdad54ac3b9870bf05c24eb60c8285baae75` |

Observed source effects:
- Document storage hardening replaces the document SELECT policy so EDITOR/REVIEWER metadata visibility is restricted to documents created by the current user, while OWNER/ADMIN/AUDITOR retain broader read access.
- Audit hash-chain source adds hash version/previous/event hash fields, backfills a chain, installs a SECURITY DEFINER insert hash trigger, adds immutable update/delete triggers, and restricts the verifier function to service_role.

**Disposition:** `HISTORICAL_SOURCE_PATH_RECOVERED` for both. Live names indicate v2 while the recovered files use v1 source filenames and later file timestamps. The P9.6 manifest claims semantic matches, but fresh direct live function/policy/trigger/grant comparison remains pending. Do not label as byte-identical or exact migration match.

### 11.3 Transactional movement idempotency fix

Historical source branch: `production-transactional-movement`.

- Live production version: `20260927132513`
- Live migration name: `mta_transactional_movement_v1_idempotency_fix`
- Historical source path: `supabase/migrations/20260927123000_mta_transactional_movement_v1.sql`
- Blob SHA: `c9f5188048888ee07667d63c81cf3d4ae5883850`

The recovered source contains idempotency and outbox table definitions, transactional movement logic, audit/outbox writes, and a service-role-only RPC wrapper. The P9.6 manifest maps the live idempotency-fix entry to this source plus commit `9d90bf5fcdbdd90f79aa661ca10ceb0c4cb169cf`, and asserts that the live function reflects the completed-only idempotency fix including `ON CONFLICT DO NOTHING`.

**Disposition:** `HISTORICAL_SOURCE_PATH_RECOVERED_VERSION_AND_NAME_MISMATCH`. The source filename predates the live migration-history entry and has a different migration name. The prior manifest's semantic match assertion is not independently reproduced in this pass. Compare the exact live function body and effective grants before certifying.

### 11.4 AI secure configuration remains a provenance exception

The P9.6 AI migration disposition states that `20260922162628 mta_ai_secure_configuration` has not been recovered from the repository history searched. That document records deployed AI objects and the disabled state, but explicitly prohibits reconstructing migration SQL from live production objects.

This remains `SOURCE_NOT_RECOVERED_FROM_SEARCHED_REPOSITORY_HISTORY`; historical existence is undetermined. No source is fabricated and `AI_ENABLED = FALSE` remains unchanged.

### 11.5 Updated source-discovery disposition

This follow-up recovered historical SQL paths for:
- 5 QR/authenticated-grant migrations;
- 2 document/audit hardening migrations;
- 1 transactional movement idempotency-fix migration.

These eight source artifacts reduce the unresolved source-discovery worklist. They do not resolve the separate P9.8 dispatcher version mapping, the AI secure configuration provenance gap, or the four later merged-PR version-mismatch cases in section 10. All recovered artifacts remain provenance evidence only; they are not moved into the executable migration directory and are not replayed.

**WP2.1.3 remains PARTIAL — NOT CERTIFIED.** Fresh live effect comparison remains blocked by the prior read-only SQL connection failure (SQLSTATE `28P01`).


## 12. Consolidated WP2.1.3 source-discovery count (supersedes earlier interim counts)

The original normalized-name reconciliation identified 21 live migration entries without a repository migration counterpart. The current source-discovery evidence for those 21 is:

- 4 P9.7 historical SQL sources recovered (section 7.1);
- 3 P9.8 historical SQL sources recovered, with dispatcher version mapping unresolved (section 9);
- 8 additional historical SQL sources recovered for QR, document storage, audit hash chain, and movement idempotency (section 11);
- 1 admin-users service-role privilege source file recovered with a live/source version mismatch (section 8.1);
- 5 entries still without an authoritative source artifact recovered in this pass: `mta_ai_secure_configuration`, `mta_audit_service_role_read_insert_grant_v1`, `mta_p97_service_role_dml_grants_v1`, `assign_initial_owner_admin_nip_v1`, and `audit_initial_owner_admin_nip_v1`.

This yields **16 of 21 live entries with a historical/repository source artifact located**, and **5 of 21 still source-unrecovered in the current search record**. This is a source-discovery count only. It does not imply SQL effect equivalence, successful production replay, or permission to restore files into the executable migration directory.

Separately, four additional live entries were recovered from merged PR patches (#299, #300, #331) and are tracked as a distinct cohort in section 10. They are not included in the original 21-entry denominator.

The remaining P9.8 dispatcher version mapping, the source-to-live version mappings, and all required live SQL-effect comparisons remain open. The prior PostgreSQL authentication failure (SQLSTATE `28P01`) still blocks fresh direct catalog comparison.

**Consolidated status:** WP2.1.3 SOURCE DISCOVERY = ADVANCED / PARTIAL; WP2.1 = NOT CERTIFIED; P9.3 = NOT CERTIFIED.


## 13. Additional identity lineage — NIP identity contract (PR #273)

A merged PR search found an authoritative patch for the NIP identity contract:

- PR #273: `feat: adopt 18 digit NIP as login identity`
- Merged: 2026-10-01T07:37:09Z
- Branch: `feat/nip-authentication-contract`
- Head commit: `c29e4ef786b79d7bc29b43369260c7fb33e0803b`
- Source path in patch: `supabase/migrations/20261001090000_mta_nip_identity_contract_v1.sql`
- Live migration inventory: version `20261001073742`, name `mta_nip_identity_contract_v1`.

The PR patch adds nullable `mta_profiles.nip`, a format constraint for 18 digits, a partial unique index, and a column comment. The same PR adds NIP-to-profile lookup in `mta-login`, retrieves the existing Auth user's email server-side, and verifies the password using Supabase Auth. Its response uses a generic `INVALID_LOGIN` for malformed NIP, missing/inactive profile, and invalid credentials; it also avoids logging NIP/password.

**Disposition:** `MERGED_PR_SOURCE_FOUND_VERSION_MISMATCH`. The migration source is recovered from a merged PR, but the SQL filename timestamp (`20261001090000`) differs from live migration version (`20261001073742`). The migration body is available in the PR patch, not yet compared to live catalog column/constraint/index definitions. Do not classify as exact or semantically reconciled until that comparison succeeds.

This NIP contract is an additional lineage item outside the original 21-entry unmatched-name cohort. It is relevant to P9.3 authentication because the login identifier is NIP while credential verification remains delegated to Supabase Auth. It does not, by itself, establish rate limiting, login audit durability, session revocation, or forced-password-change enforcement.

No database mutation or Auth configuration change was performed.
