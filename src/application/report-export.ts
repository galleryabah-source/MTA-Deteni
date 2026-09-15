import type { ActorContext } from "../domain/shared/contracts.js";
import { DomainError } from "../domain/shared/errors.js";
import { REGU_JAGA_REQUIRED_SECTIONS, validateReguJagaReport, type ReguJagaReport } from "./reporting-contract.js";

export type ReportExportArtifact = Readonly<{
  reportId: string;
  format: "DOCX" | "PDF" | "JSON";
  contentHash: string;
  generatedAt: string;
  generatedBy: string;
  sourceSnapshotId: string;
}>;

export type ReportExportDeps = Readonly<{
  now: () => string;
  canExport: (actor: ActorContext) => boolean;
  render: (report: ReguJagaReport, format: ReportExportArtifact["format"]) => Promise<{ contentHash: string }>;
}>;

export class ReguJagaReportExportService {
  constructor(private readonly deps: ReportExportDeps) {}

  async export(report: ReguJagaReport, format: ReportExportArtifact["format"], actor: ActorContext): Promise<ReportExportArtifact> {
    if (!this.deps.canExport(actor)) throw new DomainError("FORBIDDEN_SCOPE", "Actor is not authorized to export operational reports.");
    const errors = validateReguJagaReport(report);
    if (errors.length > 0) throw new DomainError("VALIDATION_FAILED", `Report contract failed: ${errors.join(", ")}.`);
    if (report.sections.length < REGU_JAGA_REQUIRED_SECTIONS.length) throw new DomainError("VALIDATION_FAILED", "Required report sections are incomplete.");
    const rendered = await this.deps.render(report, format);
    if (!rendered.contentHash.trim()) throw new DomainError("INTEGRITY_FAILURE", "Rendered report must have a content hash.");
    return { reportId: report.reportId, format, contentHash: rendered.contentHash, generatedAt: this.deps.now(), generatedBy: actor.actorId, sourceSnapshotId: report.sourceSnapshotId };
  }
}
