# MTA DETENI — Deployment Parity Contract

## Purpose

This contract prevents a Cloudflare Worker deployment from being considered equivalent to the repository source merely because the Worker responds successfully.

The required parity boundary is:

`GitHub source → wrangler asset bundle → Worker → HTML shell → authentication gate → /api/mta/me RBAC resolution → operational action guard`

## Required runtime markers

The Worker health response must expose:

- `deploymentContract: DEPLOYMENT_PARITY_CONTRACT_V1`
- `authBoundary: DEDICATED_LOGIN_REQUIRED`
- `rbacContract: CANONICAL_5_ROLE_RBAC`
- `actionGuard: ACTION_GUARD_ENABLED`

If an externally deployed Worker does not expose these markers, deployment parity is **not established**. A successful HTTP 200 alone is insufficient.

## Required asset path

The Cloudflare configuration must serve `./web` through `worker-v11.js`. The HTML shell must load:

- `mta-production-api.js`
- `mta-auth-ui.js`
- `mta-auth.js`
- `mta-rbac-action-guard.js`

The login gate must hide the application shell for pending/guest state. Authentication must resolve the canonical role through `/api/mta/me`. Operational mutations must be guarded by the RBAC action policy.

## Operational interpretation

This is a **source and smoke-test contract**, not proof that a live Worker has been updated.

Because production deployment credentials are not authorized in the current governance state, this change does not deploy or mutate the live Worker.

After an authorized deployment, the health endpoint can be checked for the four markers above. The browser should then be checked for:

1. Guest → Login gate only.
2. No public self-registration.
3. Authenticated role badge visible.
4. Navigation projected by role.
5. Backup/Restore visible only to OWNER/ADMIN.
6. Audit visible only to OWNER/ADMIN/AUDITOR.
7. Unauthorized mutations rejected by the action guard.

The screenshot showing an operational shell to a guest must therefore be treated as **pre-parity/legacy deployment evidence**, not as proof of the current source behavior.
