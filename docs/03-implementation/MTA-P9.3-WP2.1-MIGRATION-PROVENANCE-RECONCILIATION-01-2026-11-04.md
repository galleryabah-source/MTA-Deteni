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

**Current classification:** `UNRESOLVED_LIVE_SOURCE_PROVENANCE`. No semantic equivalence is asserted. The next source investigation must locate original commits, renamed/deleted paths, PR patches, or archived migration artifacts before deciding whether any item is reconstructed or live-only.

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
