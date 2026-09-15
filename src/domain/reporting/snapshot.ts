export type ReportingRow = Readonly<Record<string, string | number | boolean | null>>;

export type ReportingSnapshot = Readonly<{
  snapshotId: string;
  generatedAt: string;
  sourceRevision: string;
  rows: readonly ReportingRow[];
}>;

export function createReportingSnapshot(input: Omit<ReportingSnapshot, "rows"> & { rows: readonly ReportingRow[] }): ReportingSnapshot {
  if (!input.snapshotId.trim() || !input.sourceRevision.trim()) throw new Error("Snapshot identity is required.");
  const rows = input.rows.map((row) => Object.freeze({ ...row }));
  return Object.freeze({ ...input, rows: Object.freeze(rows) });
}

export function canonicalizeReportingSnapshot(snapshot: ReportingSnapshot): string {
  if (!snapshot.snapshotId.trim() || !snapshot.sourceRevision.trim()) throw new Error("Snapshot identity is required.");
  return JSON.stringify({
    snapshotId: snapshot.snapshotId,
    generatedAt: snapshot.generatedAt,
    sourceRevision: snapshot.sourceRevision,
    rows: snapshot.rows,
  });
}

export function assertCanonicalReportingSnapshot(snapshot: ReportingSnapshot, expectedCanonical: string): void {
  if (canonicalizeReportingSnapshot(snapshot) !== expectedCanonical) throw new Error("Reporting snapshot canonical representation mismatch.");
}
