# MTA DETENI — UI / Runtime Responsive Audit v11

Status: implemented on `main`  
Data mode: synthetic-only  
AI: OFF  
Database: NOT CONNECTED  
Migration freeze: TRUE

## Findings and corrections

1. **Runtime entrypoint drift**
   - `wrangler.toml` referenced `worker-v9.js` while the active preview surface had already advanced to v10/v11 presentation behavior.
   - Corrected by adding `worker-v11.js` and aligning `worker.js` and `wrangler.toml` to the v11 adapter.

2. **Responsive hardening**
   - `web/responsive-v11.css` provides width constraints, touch-sized controls, mobile grid collapse, table overflow containment, modal sizing, reduced-motion handling, and phone-width adjustments.
   - `web/preview-v10.js` injects the stylesheet and provides a collapsible left vertical navigation persisted in browser local storage.

3. **Cloudflare deployment boundary**
   - Existing validation workflow remains validation-only and does not deploy.
   - Added `.github/workflows/cloudflare-preview-nonprod.yml` for a separately named `mta-deteni-preview` worker using GitHub Secrets. This is explicitly non-production and does not authorize production access.

## Remaining technical hardening

- Vendor the QR generator locally so offline/LAN runtime does not depend on jsDelivr.
- Add automated browser-level responsive checks for 320px, 360px, 390px, 430px, 768px and desktop widths.
- Ensure temporary leave QR lifecycle revokes/expires returned or cancelled transactions in the production contract.
- Replace preview-only QR/camera behavior with authenticated policy-bound runtime adapters before any operational data is introduced.

## Verification boundary

The GitHub Actions non-production deployment run was observed queued after the commit. No deployment success is claimed until its run reaches a terminal successful state and the deployed `/api/health` endpoint is independently observed.
