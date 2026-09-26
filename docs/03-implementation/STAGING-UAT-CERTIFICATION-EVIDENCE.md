# MTA DETENI — Production-like Staging + UAT Evidence

**Certification:** MTA-STAGING-UAT-CERT-2026-09-26-01  
**Environment:** Cloudflare production-like staging  
**Target:** mta-deteni-staging  
**Current decision:** UAT evidence PASS locally; release-bound certification pending CI execution

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

## Certification boundary

The local staging deployment and local authenticated UAT establish that the deployed staging Worker passes the three-device journey.

However, the formal certification rule requires the existing release-bound GitHub workflow to reproduce:

1. staging deployment;
2. live health verification;
3. authenticated phone/tablet/desktop UAT;
4. governance validation;
5. evidence bound to the exact GitHub release commit.

Therefore this document is **not yet marked CERTIFIED**. The next step is to execute the existing `MTA DETENI Production-like Staging UAT` workflow and use its release-bound artifact as the formal certification evidence.

No application source, schema, migration, production deployment, production database, real detainee data, or AI activation is authorized by this evidence update.
