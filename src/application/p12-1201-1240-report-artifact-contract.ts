import type { ReportingSnapshotIntegrity } from "./p12-921-960-reporting-snapshot-integrity.js";

export type ReportArtifact = Readonly<{
  artifactId: string;
  snapshot: ReportingSnapshotIntegrity;
  format: "TEXT" | "PDF";
  contentHash: string;
  generatedAt: string;
}>;

export function buildReportArtifact(input: Omit<ReportArtifact, "contentHash"> & { content: string }): ReportArtifact {
  if (!input.artifactId.trim() || !input.content.trim() || !input.generatedAt.trim()) throw new Error("REPORT_ARTIFACT_IDENTITY_REQUIRED");
  const bytes = new TextEncoder().encode(input.content);
  let hash = 2166136261;
  for (const byte of bytes) hash = Math.imul(hash ^ byte, 16777619);
  return { artifactId: input.artifactId, snapshot: input.snapshot, format: input.format, contentHash: (hash >>> 0).toString(16), generatedAt: input.generatedAt };
}
