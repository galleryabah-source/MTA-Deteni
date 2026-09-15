export type ReportArtifactInput = Readonly<{
  templateId: string;
  sourceSnapshotId: string;
  orderedFields: readonly string[];
}>;

export type ReportArtifact = Readonly<{
  artifactId: string;
  templateId: string;
  sourceSnapshotId: string;
  contentFingerprint: string;
}>;

function fingerprint(input: ReportArtifactInput): string {
  let hash = 2166136261;
  const value = JSON.stringify(input);
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function createDeterministicReportArtifact(input: ReportArtifactInput): ReportArtifact {
  if (!input.templateId.trim() || !input.sourceSnapshotId.trim() || input.orderedFields.length === 0) throw new Error("REPORT_ARTIFACT_INPUT_REQUIRED");
  if (input.orderedFields.some((field) => !field.trim())) throw new Error("REPORT_ARTIFACT_FIELD_INVALID");
  return { artifactId: `${input.templateId}:${input.sourceSnapshotId}`, templateId: input.templateId, sourceSnapshotId: input.sourceSnapshotId, contentFingerprint: fingerprint(input) };
}

export function assertReportArtifactsDeterministic(a: ReportArtifact, b: ReportArtifact): void {
  if (a.artifactId !== b.artifactId || a.contentFingerprint !== b.contentFingerprint) throw new Error("REPORT_ARTIFACT_NONDETERMINISTIC");
}
