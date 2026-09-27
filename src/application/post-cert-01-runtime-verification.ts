export type PlacementState = "PLACED" | "MOVED" | "EXITED" | "RETURNED";

export type QrValidity =
  | "ACTIVE"
  | "EXPIRED"
  | "FUTURE"
  | "INACTIVE"
  | "CONTEXT_MISMATCH";

export type QrContext = "RUDENIM_STAY" | "TEMPORARY_EXIT" | "DEPORTATION";

export type PostCert01Observation = Readonly<{
  checkpoint: string;
  detaineeId: string;
  placement: PlacementState;
  expectedHeadcount: number;
  actualHeadcount: number;
  qrContext: QrContext;
  qrValidity: QrValidity;
  movementId: string;
  auditEventId: string;
}>;

export type PostCert01Contract = Readonly<{
  contractId: string;
  target: "SYNTHETIC";
  observations: readonly PostCert01Observation[];
}>;

export type PostCert01Result = Readonly<{
  status: "READY" | "BLOCKED";
  failedCheckpoints: readonly string[];
  reasonCodes: readonly string[];
}>;

const nonBlank = (value: string) => value.trim().length > 0;
const nonNegativeInt = (value: number) => Number.isInteger(value) && value >= 0;

export function evaluatePostCert01(
  contract: PostCert01Contract,
): PostCert01Result {
  const failedCheckpoints: string[] = [];
  const reasonCodes: string[] = [];

  if (!nonBlank(contract.contractId)) reasonCodes.push("CONTRACT_ID_REQUIRED");
  if (contract.target !== "SYNTHETIC") reasonCodes.push("SYNTHETIC_TARGET_REQUIRED");
  if (contract.observations.length === 0) reasonCodes.push("OBSERVATION_REQUIRED");

  for (const observation of contract.observations) {
    const fail = (reason: string) => {
      failedCheckpoints.push(observation.checkpoint);
      reasonCodes.push(reason);
    };

    if (!nonBlank(observation.checkpoint)) fail("CHECKPOINT_REQUIRED");
    if (!nonBlank(observation.detaineeId)) fail("DETAINEE_REQUIRED");
    if (!nonBlank(observation.movementId)) fail("MOVEMENT_EVIDENCE_REQUIRED");
    if (!nonBlank(observation.auditEventId)) fail("AUDIT_EVIDENCE_REQUIRED");

    if (!nonNegativeInt(observation.expectedHeadcount)) {
      fail("EXPECTED_HEADCOUNT_INVALID");
    }
    if (!nonNegativeInt(observation.actualHeadcount)) {
      fail("ACTUAL_HEADCOUNT_INVALID");
    }
    if (observation.expectedHeadcount !== observation.actualHeadcount) {
      fail("HEADCOUNT_STATE_MISMATCH");
    }

    if (observation.placement === "EXITED") {
      if (
        observation.qrContext !== "TEMPORARY_EXIT" ||
        observation.qrValidity !== "ACTIVE"
      ) {
        fail("EXITED_QR_CONTEXT_INVALID");
      }
    } else if (observation.placement === "RETURNED") {
      if (
        observation.qrContext !== "RUDENIM_STAY" ||
        observation.qrValidity !== "ACTIVE"
      ) {
        fail("RETURNED_QR_CONTEXT_INVALID");
      }
    } else if (
      observation.placement !== "PLACED" &&
      observation.placement !== "MOVED"
    ) {
      fail("PLACEMENT_STATE_INVALID");
    }

    if (observation.qrValidity === "CONTEXT_MISMATCH") {
      fail("QR_CONTEXT_MISMATCH");
    }
  }

  const uniqueFailures = [...new Set(failedCheckpoints)];
  const uniqueReasons = [...new Set(reasonCodes)];

  return {
    status: uniqueReasons.length === 0 ? "READY" : "BLOCKED",
    failedCheckpoints: uniqueFailures,
    reasonCodes: uniqueReasons,
  };
}
