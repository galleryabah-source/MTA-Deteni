import crypto from 'node:crypto';

export const RELEASE_ARTIFACT_VERSION = 'P10.333-340-v1';
export const REQUIRED_ARTIFACTS = Object.freeze([
  'wrangler.toml','worker-v11.js','.github/workflows/cloudflare-deploy.yml',
  'web/index.html','web/daily-guard-report-v2.js','web/daily-guard-report-d57.js',
  'web/mta-production-api.js','web/mta-auth.js','web/mta-auth-ui.js',
  'web/mobile-shell-v1.js','web/desktop-shell-v2.js','web/offline-v1.js',
  'web/offline-queue-v1.js','web/qr-camera-v2.js','web/room-ops-v9.js',
  'web/movement-v9.js','web/admin-settings-v9.js','web/master-room-guard-v10.js',
  'web/preview-v10.js','web/qr-print-clean-v3.js'
]);
export const REQUIRED_ENDPOINTS = Object.freeze(['/api/health','/api/runtime','/api/mta/*']);
const req=(v,c)=>{if(typeof v!=='string'||!v.trim())throw new Error(c);return v.trim()};
const bool=(v,c)=>{if(v!==true)throw new Error(c)};
const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
export function composeReleaseArtifactManifest(input){
  req(input.releaseCommit,'RELEASE_COMMIT_REQUIRED');
  req(input.artifactFingerprint,'ARTIFACT_FINGERPRINT_REQUIRED');
  if(!/^[0-9a-f]{40}$|^[0-9a-f]{64}$/i.test(input.releaseCommit))throw new Error('RELEASE_COMMIT_INVALID');
  if(!/^[0-9a-f]{64}$/i.test(input.artifactFingerprint))throw new Error('ARTIFACT_FINGERPRINT_INVALID');
  bool(input.productionTargetExplicit,'PRODUCTION_TARGET_REQUIRED');
  bool(input.secretBoundaryPass,'SECRET_BOUNDARY_REQUIRED');
  bool(input.migrationFreeze,'MIGRATION_FREEZE_REQUIRED');
  bool(input.aiDisabled,'AI_DISABLED_REQUIRED');
  const declared=input.artifacts||[];
  if(declared.some(x=>!REQUIRED_ARTIFACTS.includes(x.path)))throw new Error('UNEXPECTED_ARTIFACT_DECLARATION');
  const present=new Set(declared.map(x=>x.path));
  for(const p of REQUIRED_ARTIFACTS)if(!present.has(p))throw new Error('ARTIFACT_MISSING:'+p);
  const endpointSet=new Set(input.endpoints||[]);
  for(const e of REQUIRED_ENDPOINTS)if(!endpointSet.has(e))throw new Error('RUNTIME_ENDPOINT_MISSING:'+e);
  const payload={version:RELEASE_ARTIFACT_VERSION,releaseCommit:input.releaseCommit,artifactFingerprint:input.artifactFingerprint,artifacts:REQUIRED_ARTIFACTS,endpoints:REQUIRED_ENDPOINTS,productionTargetExplicit:true,secretBoundaryPass:true,migrationFreeze:true,aiDisabled:true};
  return Object.freeze({...payload,manifestFingerprint:sha(JSON.stringify(payload))});
}
