# Legacy Detainee Code → NID Migration Boundary V1

Date: 2026-10-02

## Purpose

Establish the first safe boundary for retiring the legacy detainee `code` field without changing production schema or breaking the current runtime.

This boundary is intentionally **repository/governance-only**. It does not drop, rename, null, or regenerate `public.mta_detainees.code`.

## Canonical identity

```
UUID = technical primary key
NID  = canonical operational detainee identity
code = legacy compatibility reference
```

NID contract:

`RDM-PTK-YY-NNNNNN`

The application must not introduce a second detainee identity generator.

## Current compatibility reality

The previous consumer/provenance audit established active legacy consumers in:

- `web/mta-domain-commands-v1.js`
- `web/mta-domain-commands-v2.js`
- `web/mta-production-state-adapter-v1.js`
- `web/mta-app-runtime-full.js`
- `web/detainee-detail-v1.js`
- `web/detainee-statistics-v1.js`
- `web/data-statistics-report-v1.js`
- `web/qr-print-clean.js`
- `web/qr-print-clean-v2.js`
- `web/movement-v9.js`
- `supabase/functions/mta-api/index.ts`

The production database still requires `code` and enforces its uniqueness.

Therefore the migration boundary must **not** yet convert the existing create path to NID-only writes.

## Boundary V1

Effective immediately for repository evolution:

1. NID remains the only canonical operational identity.
2. No new feature or module may introduce a detainee identity based on `code`.
3. Existing `code` consumers are transitional compatibility consumers and must remain explicitly inventoried.
4. New operational references between detainee records must use UUID/foreign keys or NID according to the canonical contract; `code` must not become a new relational identity.
5. `code` must not be used to generate NID.
6. No migration may drop or rename `code` until the retirement gates are certified.
7. Existing legacy consumers may be migrated incrementally; each migration must preserve provenance and behavior.
8. The CI guard added with this boundary prevents an unreviewed new detainee-code consumer from entering the repository.

## Why write removal is deferred

The current production schema still has a non-null, unique `code` contract. The production adapter also still carries `code` in its detainee write payload.

Removing those writes before introducing a compatibility-generation strategy would create an incomplete write path.

The safe sequence is therefore:

```
Boundary V1 / CI guard
        ↓
NID-first read/display migration
        ↓
compatibility write strategy
        ↓
remove code from domain/adapter/API writes
        ↓
backup/restore contract version
        ↓
runtime zero-consumer proof
        ↓
external dependency proof
        ↓
compatibility observation window
        ↓
physical retirement migration
```

## Explicitly not done by V1

- no production DDL;
- no data mutation;
- no `DROP COLUMN code`;
- no removal of the unique `code` constraint;
- no production write enablement;
- no change to the canonical NID generator;
- no second identity generator;
- no automatic rewrite of existing reports/QR/documents.

## NID-first read migration V1

The following presentation surfaces are now NID-first while retaining a legacy fallback for records that do not yet expose NID:

- production adapter maps `mta_detainees.nid` into runtime detainee state;
- main detainee list and operational selectors display NID first;
- detainee detail/document identity displays NID first;
- statistics and data-statistics reports expose NID first;
- detainee QR print labels use NID first;
- movement presentation resolves detainee identity from the detainee record and prefers NID.

The fallback `code` is deliberately retained only as a compatibility read path. This is not yet proof that `code` can be removed from production writes.

## V1 gate

```
NID canonical identity                 PASS
Legacy consumer inventory              PASS
Migration boundary contract            PASS
New-consumer CI guard                  PASS when workflow is green
Existing legacy consumers              TRANSITIONAL
Production code write dependency       PRESENT
Physical retirement                    BLOCKED
```

The next implementation boundary after V1 is the **NID-first read/presentation migration**, followed by a separately reviewed compatibility write strategy.
