# MTA DETENI - Cloudflare Deployment Boundary

## Current rule

GitHub Actions performs deterministic Cloudflare artifact and preflight validation. Actual Cloudflare deployment is a separate controlled action from an authenticated deployment station.

- GitHub CI remains a quality/evidence gate.
- Cloudflare credentials are not required for normal push validation.
- Production deployment remains manual and explicitly controlled.
- Preview deployment may be performed manually from a supported Wrangler host.

## Android / Termux

Termux on Android ARM64 is not a supported Wrangler host for the current Wrangler/workerd package. Installing Wrangler 4.132.0 can fail with: Unsupported platform: android arm64 LE.

Do not repeatedly reinstall Wrangler in Termux.

Termux may still be used to synchronize the repository, run source checks that do not require Wrangler, SSH to a supported deployment station, or open the Cloudflare dashboard.

## Supported deployment station

Use Windows, macOS or Linux with a supported Node/Wrangler environment.

Authenticate with OAuth using: npx wrangler@4.132.0 login
Verify with: npx wrangler@4.132.0 whoami

Preview: npx wrangler@4.132.0 deploy --config wrangler.preview.toml --name mta-deteni-preview
Production: npx wrangler@4.132.0 deploy --config wrangler.toml --name mta-deteni

Before production, the deployment station must have a clean repository and the latest successful CI evidence.

## Governance locks

Runtime health must report:
- dataMode = SYNTHETIC_ONLY
- ai = OFF
- migrationFreeze = true
- productionAccessAuthorized = false
- livePostgresqlExecution = false
- realDetaineeDataAllowed = false
- externalTransportAllowed = false
- durablePublicationAllowed = false

These fields are executable guard evidence, not permission to bypass governance.

## Windows deployment station

A controlled PowerShell entry point is available at `scripts/cloudflare-deploy-station.ps1`.

Preview:

`powershell -ExecutionPolicy Bypass -File .\\scripts\\cloudflare-deploy-station.ps1 -Target preview`

Production requires an explicit confirmation phrase and performs a live health read after deployment:

`powershell -ExecutionPolicy Bypass -File .\\scripts\\cloudflare-deploy-station.ps1 -Target production`

The script uses Wrangler OAuth credentials already established on the deployment station; no Cloudflare API token is stored in the repository.
