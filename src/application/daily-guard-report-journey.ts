import { createReportPreview } from "./report-preview.js";
import { createReportDownload, type ReportDownloadArtifact } from "./report-download.js";
import type { ReportSnapshot } from "./report-artifact.js";

export type DailyGuardReportJourney = Readonly<{
  snapshotId: string;
  previewId: string;
  downloadId: string;
  download: ReportDownloadArtifact;
  syntheticOnly: true;
}>;

export function buildDailyGuardReportJourney(input: Readonly<{
  snapshot: ReportSnapshot;
  sectionOrder: readonly string[];
  previewId: string;
  downloadId: string;
}>): DailyGuardReportJourney {
  const preview = createReportPreview({ previewId: input.previewId, snapshot: input.snapshot, sectionOrder: input.sectionOrder });
  const download = createReportDownload({ downloadId: input.downloadId, preview, snapshot: input.snapshot });
  return Object.freeze({ snapshotId: input.snapshot.snapshotId, previewId: preview.previewId, downloadId: download.downloadId, download, syntheticOnly: true });
}
