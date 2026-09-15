export type ReportingSnapshot = Readonly<{
  snapshotId: string;
  generatedAt: string;
  sourceRevision: string;
  rows: readonly Readonly<Record<string, string | number | boolean | null>>[];
}>;

export function createReportingSnapshot(input: Omit<ReportingSnapshot, "rows"> & { rows: readonly Readonly<Record<string, string | number | boolean | null>>[] }): ReportingSnapshot {
  if (!input.snapshotId.trim() || !input.sourceRevision.trim()) throw new Error("Snapshot identity is required.");
  const rows = input.rows.map((row) => ({ ...row }));
  return Object.freeze({ ...input, rows: Object.freeze(rows) });
}

export function canonicalizeReportingSnapshot(snapshot: ReportingSnapshot): string {
  return JSON.stringify({
    snapshotId: snapshot.snapshotId,
    generatedAt: snapshot.generatedAt,
    sourceRevision: snapshot.sourceRevision,
    rows: snapshot.rows,
  });
}
