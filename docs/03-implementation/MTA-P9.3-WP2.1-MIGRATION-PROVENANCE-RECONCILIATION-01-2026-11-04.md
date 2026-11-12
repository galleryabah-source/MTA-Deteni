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
