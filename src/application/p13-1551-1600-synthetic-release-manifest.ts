export type SyntheticReleaseManifest = Readonly<{
  manifestId: string;
  version: string;
  branch: string;
  syntheticOnly: true;
  migrationFreeze: true;
  aiEnabled: false;
  productionAuthorized: false;
  evidenceIds: readonly string[];
  generatedAt: string;
}>;

export function buildSyntheticReleaseManifest(input: Omit<SyntheticReleaseManifest, "syntheticOnly" | "migrationFreeze" | "aiEnabled" | "productionAuthorized">): SyntheticReleaseManifest {
  if (!input.manifestId.trim() || !input.version.trim() || !input.branch.trim() || !input.generatedAt.trim()) throw new Error("RELEASE_MANIFEST_IDENTITY_REQUIRED");
  if (!input.evidenceIds.length) throw new Error("RELEASE_MANIFEST_EVIDENCE_REQUIRED");
  return { ...input, syntheticOnly: true, migrationFreeze: true, aiEnabled: false, productionAuthorized: false };
}

export function assertSyntheticReleaseManifestSafe(manifest: SyntheticReleaseManifest): void {
  if (!manifest.syntheticOnly || !manifest.migrationFreeze || manifest.aiEnabled || manifest.productionAuthorized) throw new Error("SYNTHETIC_RELEASE_MANIFEST_UNSAFE");
}
