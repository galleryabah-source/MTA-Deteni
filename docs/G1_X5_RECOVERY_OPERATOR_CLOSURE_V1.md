# G1-X5 Recovery Operator Closure V1

## Scope

G1-X5 establishes the provenance of backup creation, archive ownership, restore execution, and privileged recovery access. The purpose is to determine whether recovery can preserve the canonical detainee identity contract and whether the legacy `code` field remains a compatibility dependency during recovery.

This is an evidence audit. It does not execute a production restore, apply the controlled restore SQL artifact, rotate credentials, or remove the legacy CREATE contract.

## Repository recovery surface

### Backup creation

The production API exposes OWNER/ADMIN backup read capability through `mta-api`.

The backup manifest is schema version 1 and carries the detainee dataset through the server-side backup payload. The existing backup path uses `select("*")`, therefore the current recovery representation still carries legacy `code` together with canonical `nid`.

### Restore execution

The production API exposes OWNER-only `POST /backup-restore`.

The API validates:
- schemaVersion = 1;
- single-scope constraint;
- required root collections;
- payload fingerprint;
- request identity;
- server-side service-role configuration.

It then calls:

```
public.mta_restore_backup_transaction
```

The repository contains the controlled operation artifact:

```
supabase/operations/mta_backup_restore_transaction_v1.sql
```

The artifact is explicitly marked **NOT applied automatically** and requires database/governance clearance.

### Recovery transaction contract

The operation artifact defines a SECURITY DEFINER PostgreSQL transaction with:
- advisory transaction locking;
- replay detection;
- cardinality limits;
- FK-ordered restore;
- audit event creation;
- EXECUTE revoked from public/anon/authenticated;
- EXECUTE granted to service_role.

The operation is therefore designed as a privileged server-side recovery boundary rather than an authenticated direct-table restore.

## Production provenance check

Production catalog inspection on project `tmmhxqgzelgrsrxbbfzh` confirms:

- `public.mta_restore_backup_transaction` is **not currently installed**.
- `public.mta_execute_idempotent_mutation` exists and is executable by service_role, not authenticated.
- `public.mta_execute_movement_transaction` exists and is executable by service_role, not authenticated.

The production Edge Function inventory is:
- `mta-api` v24, ACTIVE, JWT required;
- `mta-outbox-dispatcher` v2, ACTIVE, JWT required;
- `mta-login` v1, ACTIVE, custom login boundary.

Therefore the repository's restore caller exists, but the corresponding production restore function is not provisioned.

## Operator / archive provenance

The repository does **not** establish:
- a named backup archive owner;
- a named restore operator;
- an external backup archive service;
- a production restore runbook tied to a specific operator identity;
- a documented service-role credential custodian for recovery;
- a completed production recovery rehearsal.

These are operational facts outside what the repository and current production catalog can prove.

No inference is made that these actors or systems do not exist.

## Synthetic recovery evidence

Repository tests and scripts provide controlled non-production evidence for:
- backup chain continuity;
- payload fingerprint integrity;
- restore integrity;
- RPO/RTO calculation;
- recovery retry/idempotency;
- synthetic-only execution.

The existing DR certification explicitly records:

```
syntheticOnly = true
productionAccessAuthorized = false
migrationExecuted = false
```

This is valid non-production evidence but is not a production recovery certification.

## Legacy code impact

The current backup/restore contract remains compatibility-bearing:

```
NID   = canonical operational identity
code  = temporary compatibility field
backup schemaVersion = 1
restore payload       = preserves current detainee representation
```

Because the recovery contract has not yet transitioned to an explicit NID-first versioned schema, `code` cannot be removed from CREATE compatibility yet.

## X5 decision

**G1-X5 = BLOCKED / RECOVERY OPERATOR PROVENANCE NOT CLOSED**

### Closed by evidence

- canonical backup API surface identified;
- OWNER-only restore authorization identified;
- controlled restore SQL artifact exists;
- restore function security boundary is defined;
- production restore function is confirmed absent;
- synthetic DR certification exists.

### Open blockers

1. Backup archive ownership is not established.
2. Restore operator provenance is not established.
3. Privileged recovery credential custody is not established.
4. Production restore function has not been provisioned.
5. Production recovery rehearsal has not been performed.
6. Backup schema version transition for removal of legacy `code` is not defined.

## Required closure sequence

Before G1 Final Certification:

1. identify and document the operational backup archive owner;
2. identify authorized recovery operator(s);
3. establish privileged credential custody without exposing secret values;
4. obtain governance clearance for the controlled restore operation;
5. provision the restore function only through the governed migration/operation path;
6. perform a controlled recovery rehearsal against an approved non-production target;
7. verify NID continuity and legacy-code compatibility during recovery;
8. record production recovery provenance and evidence.

No production restore is executed by this audit.

G2 remains blocked until G1-X2, G1-X3, and G1-X5 are fully closed.
