# NID — Production Implementation Evidence v1.0

Date: 2026-10-02

## Scope
This evidence records the production implementation of the canonical Deteni identity contract after reconciliation of the existing production dataset.

## Entry-Year Reconciliation
All 13 existing production Deteni were confirmed to have entry year **2026**.

The existing legacy `code` values are `01` through `13`. They are preserved as legacy references. For the initial migration only, those existing sequence values were mapped deterministically to the six-digit NID sequence.

## Production Mapping

| Legacy code | Entry year | Canonical NID |
|---|---:|---|
| 01 | 2026 | RDM-PTK-26-000001 |
| 02 | 2026 | RDM-PTK-26-000002 |
| 03 | 2026 | RDM-PTK-26-000003 |
| 04 | 2026 | RDM-PTK-26-000004 |
| 05 | 2026 | RDM-PTK-26-000005 |
| 06 | 2026 | RDM-PTK-26-000006 |
| 07 | 2026 | RDM-PTK-26-000007 |
| 08 | 2026 | RDM-PTK-26-000008 |
| 09 | 2026 | RDM-PTK-26-000009 |
| 10 | 2026 | RDM-PTK-26-000010 |
| 11 | 2026 | RDM-PTK-26-000011 |
| 12 | 2026 | RDM-PTK-26-000012 |
| 13 | 2026 | RDM-PTK-26-000013 |

## Database Enforcement
Implemented on Supabase project `tmmhxqgzelgrsrxbbfzh`:

- `mta_detainees.entry_year` — required, 2000–2099
- `mta_detainees.nid` — required
- unique constraint on `nid`
- canonical NID format check
- atomic PostgreSQL sequence `mta_detainee_nid_seq`
- sequence position after migration: 13
- new generated NIDs continue from 14
- insert with caller-supplied NID is rejected
- NID update is rejected
- entry-year mutation after issuance is rejected
- generator function execution is not granted to PUBLIC
- generator function has fixed search_path

The technical UUID primary key remains unchanged.

## Production Verification
- Deteni rows: 13
- Distinct NID values: 13
- All existing NIDs match the canonical format
- First NID: `RDM-PTK-26-000001`
- Last NID: `RDM-PTK-26-000013`
- Sequence current value: 13

## Negative Verification
Verified without leaving test records in production:

- manual NID on create → DENY
- NID update → DENY
- no negative-test Deteni record remains

The remaining negative-test work is application/API enforcement, concurrency evidence, duplicate/reuse test certification, cross-section identity verification, and CI certification.

## Migration Files
- `20261002101550_add_canonical_detainee_nid.sql`
- `20261002101713_harden_canonical_detainee_nid_generator.sql`
- `20261002101718_harden_canonical_detainee_nid_search_path.sql`

## Current Gate
```text
ENTRY-YEAR RECONCILIATION     PASS
DATABASE NID SCHEMA           PASS
ATOMIC GENERATOR              PASS (database implementation)
IMMUTABILITY                  PASS (database enforcement)
PRODUCTION BACKFILL           PASS
API/DOMAIN ENFORCEMENT        PENDING
FULL NEGATIVE TEST SUITE      PENDING
CROSS-SECTION IDENTITY        PENDING
CI CERTIFICATION              PENDING
```

No new Deteni record was created for testing.