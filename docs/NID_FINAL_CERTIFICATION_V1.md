# NID Final Certification V1

Date: 2026-10-02

## Certification scope

This document closes the canonical Deteni NID certification after:
- production implementation and integrity verification;
- application/domain boundary hardening;
- isolated non-production concurrency certification.

Canonical identity:

`RDM-PTK-YY-NNNNNN`

Production remains unchanged by the isolated stress certification.

## Final control matrix

| Control | Result | Evidence boundary |
|---|---|---|
| NID-TEST-001 | PASS | Caller-supplied NID rejected on create |
| NID-TEST-002 | PASS | NID mutation rejected |
| NID-TEST-003 | PASS | Duplicate caller NID rejected before persistence |
| NID-TEST-004 | PASS | Malformed caller NID rejected before persistence |
| NID-TEST-005 | PASS | 32 workers × 10 inserts = 320 concurrent synthetic inserts; 320 distinct NIDs |
| NID-TEST-006 | PASS | 320 concurrent synthetic inserts; zero duplicate NID groups; sequence ended at 320 |
| NID-TEST-007 | PASS | Isolated sequence is non-cycling and generated 320 unique identities; production NIDs were not reset/reused |
| NID-TEST-008 | PASS | Production mta-api v24 contains direct NID mutation guard |
| NID-TEST-009 | PASS | RAP/Perkes/Kamtib use canonical detainee identity through detainee_id; no second NID column identified |
| NID-TEST-010 | PASS | Production catalog contains exactly one canonical NID generator |

## Isolated concurrency evidence

GitHub Actions:
- Workflow: `MTA DETENI NID Concurrency Certification`
- Run: #3
- Run ID: `36997948558`
- Head SHA: `4bab0b293176981698b1395003345ddcaa43622f`
- Job: `nid-concurrency`
- Job result: SUCCESS
- Artifact ID: `11222197864`

Evidence payload:

- status: PASS
- environment: controlled-nonprod
- syntheticOnly: true
- productionAccessAuthorized: false
- workers: 32
- rowsPerWorker: 10
- expectedRows: 320
- actualRows: 320
- distinctNids: 320
- malformedNids: 0
- duplicateNidGroups: 0
- sequenceLastValue: 320
- NID-TEST-005: PASS
- NID-TEST-006: PASS
- NID-TEST-007: PASS

This evidence is isolated from production and does not advance the production sequence.

## Production integrity boundary

Production remains:

- detainees: 13
- distinct NIDs: 13
- NULL NIDs: 0
- malformed NIDs: 0
- duplicate NID groups: 0
- production sequence last value: 13
- next generated sequence value: 14

No synthetic detainee remains in production.

## Canonical identity decision

NID is now the canonical operational identity for a Deteni.

The identity chain is:

`UUID technical PK → canonical NID → RAP / Perkes / Kamtib operational references`

No section may introduce a second detainee identity.

## Legacy code retirement boundary

The existing `mta_detainees.code` is **not yet physically retired**.

Current boundary:

1. `nid` is authoritative for operational identity.
2. `code` remains a legacy compatibility/reference field for existing records.
3. New identity generation must never use `code`.
4. New application/domain APIs must not accept `code` as a substitute for NID identity.
5. Existing `code` values must not be rewritten merely to make them resemble NID.
6. The database column should remain until a dedicated consumer/provenance audit proves there are no remaining production readers, filters, exports, integrations, or historical references that depend on it.
7. Physical column removal is therefore a later retirement migration, not part of this certification.

## Final gate

```
NID CONTRACT                         PASS
PRODUCTION DATABASE IMPLEMENTATION  PASS
APPLICATION/DOMAIN BOUNDARY         PASS
NID-001..004                         PASS
NID-005..007 ISOLATED STRESS        PASS
NID-008..010                         PASS
PRODUCTION INTEGRITY                PASS
CANONICAL IDENTITY                  CERTIFIED
LEGACY CODE                         RETIREMENT PENDING CONSUMER AUDIT
```

## Next controlled action

Do not add new NID features.

Perform a repository/runtime consumer audit specifically for legacy `mta_detainees.code`:
- reads;
- writes;
- search/filter;
- exports/reports;
- API payloads;
- audit/evidence;
- external integrations.

Only after that inventory is zero or all consumers are explicitly migrated should a legacy-code retirement migration be proposed.
