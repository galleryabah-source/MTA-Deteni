import test from "node:test";
import assert from "node:assert/strict";
import { createUiReadModel, assertUiMutationHasServerBoundary } from "../src/application/ui-surface.js";
import { createQrResult } from "../src/application/qr-scan-result.js";
import { toReportArtifact } from "../src/application/report-artifact.js";

test("UI mutation exposes explicit server boundary", () => {
  const model = createUiReadModel("TEMPORARY_EXIT", [], [{ id: "temporary-exit.request", label: "Request", method: "MUTATE" }]);
  assert.doesNotThrow(() => assertUiMutationHasServerBoundary(model.actions[0]));
});

test("QR adapter maps operational outcome", () => {
  assert.deepEqual(createQrResult("DEPORTATION", "ACCEPTED", "SYN-DETAINEE-001"), {
    context: "DEPORTATION", outcome: "ACCEPTED", nextAction: "CONTINUE", detaineeId: "SYN-DETAINEE-001",
  });
  assert.equal(createQrResult("TEMPORARY_EXIT", "CONTEXT_MISMATCH").nextAction, "REVIEW");
});

test("report adapter requires immutable snapshot contract", () => {
  const artifact = toReportArtifact({
    snapshotId: "SYN-SNAPSHOT-001", sourceVersion: "v1", documentNumber: "SYN-001", approvalBinding: "SYN-APPROVAL-001", provenance: ["SYNTHETIC"],
    sections: {
      IDENTITAS_LAPORAN: "Synthetic", PERSONEL_REGU: "Synthetic", KONDISI_DETENI: "Synthetic", KEGIATAN_JAGA: "Synthetic",
      KEJADIAN_PENTING: "Nihil", SERAH_TERIMA: "Synthetic", PENGESAHAN: "Synthetic",
    },
  });
  assert.equal(artifact.snapshotId, "SYN-SNAPSHOT-001");
  assert.match(artifact.content, /IDENTITAS_LAPORAN/);
});
