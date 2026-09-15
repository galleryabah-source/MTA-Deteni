import { createQrResult, type QrScanContext, type QrScanOutcome } from "./qr-scan-result.js";
import { toReportArtifact, type ReportSnapshot } from "./report-artifact.js";

export type ContractCompositionCheck = Readonly<{ checkpoint: string; control: string; status: "PASS" | "FAIL"; details: string }>;
export type ContractCompositionGate = Readonly<{ gateId: string; target: "SYNTHETIC"; checks: readonly ContractCompositionCheck[] }>;

function nonBlank(value: string): boolean { return value.trim().length > 0; }

const contexts: readonly QrScanContext[] = ["RUDENIM_STAY", "TEMPORARY_EXIT", "DEPORTATION"];
const outcomes: readonly QrScanOutcome[] = ["ACCEPTED", "REJECTED", "EXPIRED", "FUTURE", "CONTEXT_MISMATCH", "INACTIVE"];
const requiredSections = ["IDENTITAS_LAPORAN", "PERSONEL_REGU", "KONDISI_DETENI", "KEGIATAN_JAGA", "KEJADIAN_PENTING", "SERAH_TERIMA", "PENGESAHAN"] as const;

export function evaluateQrReportComposition(gateId: string): ContractCompositionGate {
  const checks: ContractCompositionCheck[] = [];
  const qrConsistent = contexts.every((context) => outcomes.every((outcome) => {
    const result = createQrResult(context, outcome, "SYN-DETAINED-001");
    return result.context === context && result.outcome === outcome &&
      result.nextAction === (outcome === "ACCEPTED" ? "CONTINUE" : outcome === "CONTEXT_MISMATCH" ? "REVIEW" : "STOP");
  }));
  checks.push({ checkpoint: "P11.033-040", control: "qr-outcome-action-mapping", status: qrConsistent ? "PASS" : "FAIL", details: "Every QR context/outcome combination retains deterministic next-action semantics." });

  const snapshot: ReportSnapshot = {
    snapshotId: "SYN-SNAPSHOT-001", sourceVersion: "SYN-v1", documentNumber: "SYN-DOC-001", approvalBinding: "SYN-APPROVAL-001",
    provenance: ["SYNTHETIC"], sections: Object.fromEntries(requiredSections.map((section) => [section, `Synthetic ${section}`])),
  };
  let reportPass = false;
  try {
    const artifact = toReportArtifact(snapshot);
    reportPass = artifact.snapshotId === snapshot.snapshotId && artifact.documentNumber === snapshot.documentNumber && requiredSections.every((section) => artifact.content.includes(`[${section}]`));
  } catch { reportPass = false; }
  checks.push({ checkpoint: "P11.041-048", control: "report-snapshot-contract", status: reportPass ? "PASS" : "FAIL", details: "Synthetic report artifacts preserve snapshot identity and mandatory section structure." });

  let malformedBlocked = false;
  try { toReportArtifact({ ...snapshot, approvalBinding: " " }); } catch { malformedBlocked = true; }
  checks.push({ checkpoint: "P11.049-056", control: "report-fail-closed", status: malformedBlocked ? "PASS" : "FAIL", details: "Incomplete report identity or approval binding is rejected." });

  checks.push({ checkpoint: "P11.057-064", control: "synthetic-only-composition", status: nonBlank(gateId) ? "PASS" : "FAIL", details: "Composition gate requires explicit identity and remains synthetic-only." });
  return { gateId, target: "SYNTHETIC", checks };
}

export function evaluateQrReportCompositionGate(gate: ContractCompositionGate): "READY" | "BLOCKED" {
  if (!nonBlank(gate.gateId) || gate.target !== "SYNTHETIC" || gate.checks.length !== 4) return "BLOCKED";
  return gate.checks.every((check) => nonBlank(check.checkpoint) && nonBlank(check.control) && nonBlank(check.details) && check.status === "PASS") ? "READY" : "BLOCKED";
}
