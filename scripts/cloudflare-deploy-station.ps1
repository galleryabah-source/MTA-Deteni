param(
  [ValidateSet("preview","production")]
  [string]$Target = "preview",
  [switch]$SkipStatusCheck
)

$ErrorActionPreference = "Stop"
$worker = if ($Target -eq "preview") { "mta-deteni-preview" } else { "mta-deteni" }
$config = if ($Target -eq "preview") { "wrangler.preview.toml" } else { "wrangler.toml" }

Write-Host "MTA DETENI Cloudflare Deployment Station"
Write-Host "Target: $Target / $worker"

if (-not (Get-Command npx -ErrorAction SilentlyContinue)) { throw "Node.js/npx is required." }
if (-not $SkipStatusCheck) {
  $status = git status --porcelain
  if ($status) { throw "Working tree is not clean. Commit/stash changes before deployment." }
}
if (-not (Test-Path $config)) { throw "Missing Wrangler config: $config" }
if (-not (Test-Path "worker-v11.js")) { throw "Missing worker-v11.js" }

Write-Host "Checking Wrangler OAuth authentication..."
npx wrangler@4.132.0 whoami

if ($Target -eq "preview") {
  npx wrangler@4.132.0 deploy --config $config --name $worker
  Write-Host "Preview deployment completed."
} else {
  $confirm = Read-Host "Type DEPLOY-MTA-PRODUCTION to continue"
  if ($confirm -ne "DEPLOY-MTA-PRODUCTION") { throw "Production deployment cancelled." }
  npx wrangler@4.132.0 deploy --config $config --name $worker
  Write-Host "Production deployment command completed."
  Invoke-WebRequest "https://mta-deteni.galleryabah.workers.dev/api/health" -UseBasicParsing | Select-Object -ExpandProperty Content
}
