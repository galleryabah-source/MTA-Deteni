# MTA DETENI — Production-like Staging + UAT Evidence

**Certification:** MTA-STAGING-UAT-CERT-2026-09-26-01  
**Release candidate:** c0e99add085e5e6620af379332cc375749ec78bc  
**Environment:** Cloudflare production-like staging  
**Target:** mta-deteni-staging  
**Decision:** BLOCKED — STAGING DEPLOYMENT PERMISSION

## Executed evidence

Workflow: `MTA DETENI Production-like Staging UAT`  
Run: `36252115472`

Passed before deployment:
- staging artifact contract
- Worker syntax
- synthetic-only governance
- production access disabled
- live PostgreSQL disabled
- real detainee data disabled
- external transport disabled
- durable publication disabled
- migration freeze enabled
- AI OFF
- Cloudflare credential presence/format
- `wrangler whoami`

## Blocking result

The deployment step reached Cloudflare authentication successfully but Cloudflare rejected the Worker asset upload:

```
/accounts/***/workers/scripts/mta-deteni-staging/assets-upload-session

No access to the specified resource.
```

Therefore:
- staging deployment = NOT EXECUTED TO COMPLETION
- live staging health = NOT VERIFIED
- authenticated staging UAT = NOT RUN
- release-bound staging certification = NOT CERTIFIED

This is intentionally fail-closed.

## Required external action

The GitHub secret `CLOUDFLARE_API_TOKEN` must be replaced/updated with a token that has the required **Workers deployment/write permission for the target Cloudflare account** and is scoped only as narrowly as practical to the non-production staging deployment.

The existing `CLOUDFLARE_ACCOUNT_ID` passed format validation.

After the token permission is corrected, rerun the same workflow. No application/schema/migration change is required for this blocker.

## Certification rule

Staging/UAT becomes CERTIFIED only when the same release-bound workflow produces:
1. successful staging deployment;
2. live `/api/health` with all governance invariants;
3. authenticated browser journey PASS on phone/tablet/desktop;
4. synthetic-only evidence;
5. production access false;
6. migration false;
7. AI disabled;
8. evidence artifact bound to the exact release commit.

## Governance

```
production deployment       = NOT AUTHORIZED
production database         = NOT ACCESSED
real detainee data          = NOT USED
migration                   = NOT EXECUTED
AI                          = OFF
```

**Current gate:** NO-GO until Cloudflare staging deployment permission is corrected.
