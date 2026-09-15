import { strict as assert } from "node:assert";
import { assertSyntheticContractMatrix } from "../src/application/p13-3321-3360-synthetic-contract-integration-matrix.js";
import { assertReportSourceReconciliation } from "../src/application/p13-3361-3400-report-source-reconciliation.js";
import { assertQrMovementEvidence, assertTemporaryExitContext } from "../src/application/p13-3401-3440-qr-movement-exit-acceptance.js";
import { assertPreCertificationEvidenceBundle } from "../src/application/p13-3441-3480-precertification-evidence-bundle.js";

assertSyntheticContractMatrix([{ entryId: "M1", sourceDomain: "RAP", targetDomain: "KAMTIB", contractId: "C1", compatible: true, evidenceId: "E1" }]);
assertReportSourceReconciliation([{ elementKey: "title", sourceField: "report.title", expectedValue: "SYNTHETIC DAILY GUARD", actualValue: "SYNTHETIC DAILY GUARD" }]);
assertQrMovementEvidence({ evidenceId: "E2", detaineeId: "DET-SYN-001", qrContext: "TEMPORARY_EXIT", movementId: "MOV-1", scannedAt: "2026-09-15T00:00:00Z", valid: true });
assertTemporaryExitContext({ evidenceId: "E2", detaineeId: "DET-SYN-001", qrContext: "TEMPORARY_EXIT", movementId: "MOV-1", scannedAt: "2026-09-15T00:00:00Z", valid: true });
assert.throws(() => assertTemporaryExitContext({ evidenceId: "E3", detaineeId: "DET-SYN-001", qrContext: "DEPORTATION", movementId: "MOV-2", scannedAt: "2026-09-15T00:00:00Z", valid: true }), /QR_TEMPORARY_EXIT_CONTEXT_REQUIRED/);
assertPreCertificationEvidenceBundle({ bundleId: "B1", items: [{ evidenceId: "E1", controlId: "C1", description: "synthetic control evidence", observable: true, passed: true }], syntheticOnly: true, productionAuthorized: false });
