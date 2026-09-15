import test from "node:test";
import assert from "node:assert/strict";
import { createApplicationSurface } from "../src/application/application-surface.js";

test("application surface composes UI, QR and report boundaries", () => {
  const app = createApplicationSurface("TEMPORARY_EXIT");
  assert.equal(app.readModel.surface, "TEMPORARY_EXIT");
  assert.deepEqual(app.qr("TEMPORARY_EXIT", "CONTEXT_MISMATCH").nextAction, "REVIEW");
  const artifact = app.report({
    snapshotId: "SYN-SNAPSHOT-002", sourceVersion: "v1", documentNumber: "SYN-002", approvalBinding: "SYN-APPROVAL-002", provenance: ["SYNTHETIC"],
    sections: {
      IDENTITAS_LAPORAN: "Synthetic", PERSONEL_REGU: "Synthetic", KONDISI_DETENI: "Synthetic", KEGIATAN_JAGA: "Synthetic",
      KEJADIAN_PENTING: "Nihil", SERAH_TERIMA: "Synthetic", PENGESAHAN: "Synthetic",
    },
  });
  assert.equal(artifact.documentNumber, "SYN-002");
});
