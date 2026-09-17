# MTA DETENI — UI / Runtime Responsive Audit v12

Status: hardening implemented on `main`  
Data mode: synthetic-only  
AI: OFF  
Database: NOT CONNECTED  
Migration freeze: TRUE

## v11 baseline findings

1. **Runtime entrypoint drift** — corrected by aligning `worker.js` and `wrangler.toml` to `worker-v11.js`.
2. **Responsive hardening** — `responsive-v11.css` plus collapsible left navigation remain active.
3. **Cloudflare boundary** — validation-only workflow remains separate from the controlled non-production deployment workflow.

## v12 offline/LAN hardening

### 1. Offline shell
- Added `web/offline-v1.js` to register a root-scoped service worker.
- Added `web/sw.js` to cache the application shell and same-origin runtime assets.
- The service worker uses cache-first behavior for previously loaded shell resources and network fallback for first-load/uncached resources.
- Browser `localStorage` remains the synthetic persistence boundary; this is intentionally not a substitute for the future shared LAN database.

### 2. QR offline continuity
- The QR generator dependency is now loaded by the offline bootstrap when absent.
- The service worker attempts to cache the existing qrcode-generator 1.4.4 runtime during the first online bootstrap.
- Consequently, QR rendering can continue after the initial online bootstrap when the browser has the cached dependency.
- This is an offline-cache strategy, not yet a fully vendored third-party library. A future release should vendor the MIT-licensed QR library into the repository to remove the external dependency entirely.

### 3. LAN architecture boundary
The current browser shell is now **LAN/offline-ready**, but it is not yet a multi-device shared database. Each browser still owns its synthetic local state. The production/local-PC target remains:

`Tablet/Phone/PC browser → LAN → Local Runtime Adapter → Local PostgreSQL → audit/event boundary`

Internet/Cloudflare is an optional synchronization/remote access layer, not the sole runtime dependency.

### 4. Responsive browser smoke tests
Added `tests/ui-responsive.mjs` and `.github/workflows/ui-responsive.yml` covering:
- 320 px
- 360 px
- 390 px
- 430 px
- 768 px
- 1024 px
- 1440 px

Checks include horizontal overflow, required shell elements, viewport metadata, and service-worker registration.

## Cloudflare non-production workflow correction
The first controlled non-production run failed before deployment because the secret variables were referenced in the verification step without being exposed to that step. The workflow has been corrected so the verification step receives the configured GitHub Secrets. No production deployment was attempted.

## Remaining hardening

- Vendor qrcode-generator locally and record its license/provenance in the repository.
- Add a deterministic LAN runtime adapter for Windows PC/Docker with a shared non-production PostgreSQL target.
- Add offline mutation queue + idempotency + conflict resolution before shared multi-device writes are enabled.
- Add explicit connectivity state and synchronization status to the UI.
- Define production Leave QR expiry/revocation and return-confirmation contracts.
- Run the browser smoke workflow to terminal status and retain evidence before declaring responsive PASS.

## Governance boundary

No real detainee data, credentials, production PII, production health records, WhatsApp exports, AI runtime, or live database migration is introduced by this hardening.
