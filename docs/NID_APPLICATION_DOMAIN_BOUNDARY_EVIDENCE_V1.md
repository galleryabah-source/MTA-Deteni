# NID Application / Domain Boundary Evidence V1

## Scope

This evidence closes the application/domain boundary for the canonical Deteni NID contract before broader production negative testing.

Canonical identity:

`RDM-PTK-YY-NNNNNN`

Production database:
- Supabase project: `MTA DETENI`
- Project ref: `tmmhxqgzelgrsrxbbfzh`
- Production detainees verified: 13
- NID rows: 13
- Distinct NIDs: 13
- NULL NIDs: 0
- malformed NIDs: 0
- duplicate NID groups: 0
- NID sequence last value: 13
- next sequence start: 14

## Application/domain boundary

The following boundaries are enforced:

1. Canonical domain create rejects caller-supplied `nid` with `NID_SYSTEM_GENERATED`.
2. Canonical domain update rejects `nid` mutation with `NID_IMMUTABLE`.
3. Canonical domain update rejects `entryYear` mutation with `ENTRY_YEAR_IMMUTABLE`.
4. Production state adapter rejects caller `nid` and only sends `entry_year` during create.
5. Production API rejects request bodies containing `nid`.
6. Production API requires `entry_year` on create and rejects `entry_year` mutation on update.
7. Detainee UI exposes required entry year for create but has no NID input.
8. Repository-wide regression gates scan application mutation paths for caller-supplied NID.
9. RAP/Perkes/Kamtib path scan is guarded against a second NID generator. Current production database has no tables named for RAP, Perkes, or Kamtib; operational section tables reference the canonical detainee through `detainee_id`.
10. Database contains exactly one function referencing the canonical NID sequence/format: `public.mta_assign_canonical_nid()`.

## CI evidence

PR #289 — NID application/domain boundary hardening:
- Static Integration Gate #1260: PASS
- Domain CI #3050: PASS
- Feature Verification #541: PASS
- Device Regression #1071: PASS
- Cross-Device Hardening #262: PASS
- End-to-End Journey Certification #379: PASS
- P1 Runtime Observation #1006: PASS
- P9.13 Kernel Certification #312: PASS
- Production Readiness Gate #343: PASS

PR #289 was merged to `main` after all listed gates were green.

## Production negative tests

### NID-TEST-001 — caller-supplied NID on create
**PASS.** Production trigger returned:
`NID_SYSTEM_GENERATED: nid must not be supplied by caller`.

### NID-TEST-002 — NID update
**PASS.** Production trigger returned:
`NID_IMMUTABLE: canonical NID cannot be changed`.

### NID-TEST-003 — duplicate NID submission
**PASS.** Caller-supplied existing NID was rejected by the system-generated boundary before a duplicate could be persisted.

### NID-TEST-004 — malformed NID submission
**PASS.** Caller-supplied malformed NID was rejected by the system-generated boundary before persistence.

### NID-TEST-005 — concurrent generation
**PASS at the database contract level; no production sequence was artificially advanced for a concurrency stress run.**
The canonical generator uses PostgreSQL `nextval(public.mta_detainee_nid_seq)`, sequence increment 1, cache 1, cycle disabled, and the production dataset has 13 distinct NIDs. A true multi-session stress run would consume production sequence values and was therefore not used as a destructive test.

### NID-TEST-006 — sequence collision safety
**PASS.** Canonical NID has a unique database constraint `mta_detainees_nid_key`; caller-supplied NID is rejected before persistence; the sequence is non-cycling.

### NID-TEST-007 — NID reuse
**PASS at the contract level.** NID is immutable, caller-supplied NID is rejected, and the sequence is monotonic/non-cycling. No production NID was reset or reused during verification.

### NID-TEST-008 — direct API NID mutation
**PASS after deployment.** Production `mta-api` is now version 24 and its deployed source explicitly contains the NID guard plus entry-year create/update guards. The deployment was made from the merged `main` implementation. No authenticated mutation request was replayed against production solely to consume an operational identity.

### NID-TEST-009 — cross-section identity split
**PASS at the current schema boundary.** No public tables named RAP, Perkes, or Kamtib exist. Current operational tables `mta_movements`, `mta_placements`, and `mta_leaves` reference the canonical detainee through `detainee_id`; none carries a second NID column.

### NID-TEST-010 — second NID generator
**PASS.** Production catalog inspection found exactly one function referencing `mta_detainee_nid_seq` or the canonical `RDM-PTK-` format: `public.mta_assign_canonical_nid()`.

## Final production integrity

After all live negative checks:
- detainee count remains 13
- negative-test rows remain 0
- NULL NID rows remain 0
- distinct NIDs remain 13
- duplicate NID groups remain 0
- malformed NIDs remain 0
- sequence last value remains 13

No production test Deteni was created or retained.

## Remaining boundary

The application/domain boundary is now closed and CI-protected. The only deliberately non-destructive limitation is that NID-TEST-005 was not executed as a true multi-session production stress test, and NID-TEST-008 was verified by deployed-source evidence rather than an authenticated production mutation request.

The next safe gate is the full NID negative-suite certification using a disposable/isolated database environment for true concurrency and sequence-collision stress, without disturbing production identity state.
