# MTA DETENI — Production-like Staging + UAT Evidence

**Certification:** MTA-STAGING-UAT-CERT-2026-09-26-01  
**Environment:** Cloudflare production-like staging  
**Target:** mta-deteni-staging  
**Current decision:** HISTORICAL — NOT RELEASE-BOUND TO THE CURRENT CANDIDATE

> This record certifies release `36b423263403958ec763671ecddcbd61393c7a6d` only. It must not be used as certification evidence for a later release candidate. The current canonical candidate is `79fb0a4c77debf7d8e56484e6515f1db7af35f1a`.

## Staging deployment evidence

The canonical release candidate was redeployed locally to the controlled staging Worker:

- Worker: `mta-deteni-staging`
- Cloudflare version ID: `9e664bca-f595-4c5b-9f47-d2305f124b49`
- URL: `https://mta-deteni-staging.galleryabah.workers.dev`

Live `/api/health` returned PASS with:

- `dataMode = SYNTHETIC_ONLY`
- `ai = OFF`
- `migrationFreeze = true`
- `productionAccessAuthorized = false`
- `livePostgresqlExecution = false`
- `realDetaineeDataAllowed = false`
- `externalTransportAllowed = false`
- `durablePublicationAllowed = false`

## Authenticated staging UAT

The same deployed staging Worker was tested using `tests/authenticated-browser-acceptance.mjs`.

### Phone — 390×844

PASS:
- all 17 operational surfaces
- monitor
- QR journey
- detainee CRUD
- movement mutation
- placement mutation
- leave mutation
- report/evidence
- functional surfaces
- browser acceptance

### Tablet — 768×1024

PASS:
- all 17 operational surfaces
- monitor
- QR journey
- detainee CRUD
- movement mutation
- placement mutation
- leave mutation
- report/evidence
- functional surfaces
- browser acceptance

Evidence IDs:
- movement: `MOV-A12A66EC-2`
- placement: `PLC-D0EA6AF2-1`
- leave: `COMPLETED`
- report: `RPT-MPCL25`

### Desktop — 1440×900

PASS:
- all 17 operational surfaces
- monitor
- QR journey
- detainee CRUD
- movement mutation
- placement mutation
- leave mutation
- report/evidence
- functional surfaces
- browser acceptance

Evidence IDs:
- movement: `MOV-B80DA000-0`
- placement: `PLC-793FBF56-D`
- leave: `COMPLETED`
- report: `RPT-UUWHDZ`

## Governance

```
production deployment       = NOT AUTHORIZED
production database         = NOT ACCESSED
real detainee data          = NOT USED
migration                   = NOT EXECUTED
AI                          = OFF
synthetic-only              = TRUE
```

## Release-bound GitHub Actions certification

The formal release-bound workflow was executed successfully after the GitHub Actions → Cloudflare credential correction and CI evidence-path correction.

- Workflow: `MTA DETENI Production-like Staging UAT`
- Run: `#10`
- Run ID: `36282041542`
- Release commit: `36b423263403958ec763671ecddcbd61393c7a6d`
- Artifact ID: `10918859824`
- Artifact: `mta-staging-uat-certification-36b423263403958ec763671ecddcbd61393c7a6d`
- Artifact digest: `sha256:0ccddc2a91df1b1b88d77f1ba8334328bea815bdd5b4c05f19df424608db477b`

Release-bound execution results:

| Control | Result |
|---|---|
| Cloudflare credentials | PASS |
| Existing staging Worker access | PASS |
| Staging deployment | PASS |
| Live staging health | PASS |
| Phone 390×844 authenticated UAT | PASS |
| Tablet 768×1024 authenticated UAT | PASS |
| Desktop 1440×900 authenticated UAT | PASS |
| Governance validation | PASS |
| Release-bound evidence generation | PASS |
| Evidence artifact upload | PASS |

The release-bound artifact contains certification ID `MTA-STAGING-UAT-CERT-2026-09-26-01`, binds the evidence to commit `36b423263403958ec763671ecddcbd61393c7a6d`, and is generated only when all three synthetic journeys and staging governance invariants pass.

**Certification decision: CERTIFIED.**

No production deployment, production database access, real detainee data, migration execution, or AI activation was performed by this certification.

### Certification boundary

Formal release-bound certification is now complete. The remaining Production Readiness blockers are independent of staging/UAT: production deployment gate execution and Real User Acceptance.

No application source, schema, migration, production deployment, production database, real detainee data, or AI activation is authorized by this evidence update.
