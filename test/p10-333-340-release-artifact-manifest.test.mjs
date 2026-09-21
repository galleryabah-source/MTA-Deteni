import {describe,it,expect} from 'vitest';
import {composeReleaseArtifactManifest,REQUIRED_ARTIFACTS,REQUIRED_ENDPOINTS} from '../src/infrastructure/certification/release-artifact-manifest.mjs';
const base={releaseCommit:'a18a8d708745062d2bcfdcb544eb85f5cdea49e2',artifactFingerprint:'a'.repeat(64),productionTargetExplicit:true,secretBoundaryPass:true,migrationFreeze:true,aiDisabled:false,artifacts:REQUIRED_ARTIFACTS.map(path=>({path})),endpoints:REQUIRED_ENDPOINTS};
base.aiDisabled=true;
describe('P10.333-340 release artifact manifest',()=>{
 it('accepts complete deterministic artifact set',()=>{const a=composeReleaseArtifactManifest(base),b=composeReleaseArtifactManifest(base);expect(a.manifestFingerprint).toBe(b.manifestFingerprint)});
 it('fails closed on missing artifact',()=>{expect(()=>composeReleaseArtifactManifest({...base,artifacts:base.artifacts.slice(1)})).toThrow('ARTIFACT_MISSING:wrangler.toml')});
 it('fails closed on unsafe controls',()=>{expect(()=>composeReleaseArtifactManifest({...base,productionTargetExplicit:false})).toThrow('PRODUCTION_TARGET_REQUIRED');expect(()=>composeReleaseArtifactManifest({...base,aiDisabled:false})).toThrow('AI_DISABLED_REQUIRED')});
 it('binds endpoint contract',()=>{expect(()=>composeReleaseArtifactManifest({...base,endpoints:['/api/health']})).toThrow('RUNTIME_ENDPOINT_MISSING:/api/runtime')});
});
