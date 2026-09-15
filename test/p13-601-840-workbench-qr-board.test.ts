import { strict as assert } from "node:assert";
import { composeOperatorWorkbench, canOpenWorkbenchSection } from "../src/application/p13-601-660-operator-workbench.js";
import { buildRoleNavigation } from "../src/application/p13-661-720-role-navigation.js";
import { verifyOperationalQR } from "../src/application/p13-721-780-qr-verification.js";
import { composeOperationalBoard, assertTrustedOperationalBoard } from "../src/application/p13-781-820-operational-board.js";

const actor = { actorId: "SYN-ADMIN", role: "ADMIN", domain: "KAMTIB", scope: {}, correlationId: "CORR-001" } as const;
const dashboard = { generatedAt: "2026-09-15T00:00:00.000Z", detainees: [], headcount: { capturedAt: "2026-09-15T00:00:00.000Z", totalActive: 0, byBlock: [], reconciliation: "MATCH" as const }, pendingTemporaryExits: 0, pendingApprovals: 0, operationalAlerts: [] };
const workbench = composeOperatorWorkbench(actor, dashboard);
assert.equal(canOpenWorkbenchSection(workbench, "QR_VERIFY"), true);
assert.equal(buildRoleNavigation("ADMIN", workbench.sections).some((item) => item.id === "audit"), false);
assert.throws(() => composeOperatorWorkbench({ ...actor, role: "UNKNOWN" }, dashboard), /WORKBENCH_ROLE_UNSUPPORTED/);

const validQR = verifyOperationalQR({ scanId: "SCAN-001", qrToken: "detainee:SYN-001|v1", detaineeId: "SYN-001", context: "TEMPORARY_EXIT", scannedAt: "2026-09-15T08:00:00.000Z", validFrom: "2026-09-15T07:00:00.000Z", validUntil: "2026-09-15T18:00:00.000Z" });
assert.equal(validQR.valid, true);
assert.equal(verifyOperationalQR({ ...validQR, qrToken: "detainee:SYN-999|v1", detaineeId: "SYN-001", validFrom: "2026-09-15T07:00:00.000Z", validUntil: "2026-09-15T18:00:00.000Z", scannedAt: "2026-09-15T08:00:00.000Z", scanId: "SCAN-002", context: "TEMPORARY_EXIT" }).reason, "IDENTITY_MISMATCH");

const board = composeOperationalBoard({ generatedAt: "2026-09-15T00:00:00.000Z", headcount: dashboard.headcount, movementQueue: [], temporaryExitQueue: [], alerts: [] });
assertTrustedOperationalBoard(board);
const untrusted = composeOperationalBoard({ ...board, headcount: { ...board.headcount, reconciliation: "MISMATCH" } });
assert.equal(untrusted.trusted, false);
assert.throws(() => assertTrustedOperationalBoard(untrusted), /OPERATIONAL_BOARD_NOT_RECONCILED/);
