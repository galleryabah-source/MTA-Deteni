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

export type PostCert01RuntimeState = Readonly<{
  target: "SYNTHETIC";
  detainees: readonly Readonly<{ id: string; status: string }>[];
  placements: readonly Readonly<{
    id: string;
    detaineeId: string;
    roomId: string;
    since: string;
    movementId?: string | null;
    correlationId?: string | null;
  }>[];
  movements: readonly Readonly<{
    id: string;
    detaineeId: string;
    toRoomId: string;
    correlationId?: string | null;
  }>[];
  rooms: readonly Readonly<{ id: string; status: string }>[];
  qr: Readonly<Record<string, Readonly<{
    context: QrContext;
    validity: QrValidity;
  }>>>;
  audit: readonly Readonly<{
    id: string;
    action: string;
    resourceType: string;
    resourceId: string;
    result: string;
    correlationId?: string | null;
  }>[];
}>;

export type PostCert01RuntimeInput = Readonly<{
  checkpoint: string;
  detaineeId: string;
  roomId: string;
  placement: PlacementState;
}>;

const latestPlacement = (state: PostCert01RuntimeState, detaineeId: string) =>
  [...state.placements]
    .filter((x) => x.detaineeId === detaineeId)
    .sort((a, b) => String(b.since).localeCompare(String(a.since)))[0];

export function derivePostCert01Observation(
  state: PostCert01RuntimeState,
  input: PostCert01RuntimeInput,
): PostCert01Observation {
  const placement = latestPlacement(state, input.detaineeId);
  const movement = placement?.movementId
    ? state.movements.find((x) => x.id === placement.movementId)
    : state.movements
        .filter(
          (x) =>
            x.detaineeId === input.detaineeId &&
            x.toRoomId === input.roomId,
        )
        .at(0);
  const correlatedAudit = movement
    ? state.audit.find(
        (x) =>
          x.resourceType === "MOVEMENT" &&
          x.resourceId === movement.id &&
          x.action === "MOVEMENT_CREATE" &&
          x.result === "SUCCESS" &&
          x.correlationId === movement.correlationId,
      )
    : undefined;

  const actualHeadcount = state.detainees.filter((detainee) => {
    if (detainee.status !== "AKTIF") return false;
    const current = latestPlacement(state, detainee.id);
    return current?.roomId === input.roomId;
  }).length;

  const qr = state.qr[input.detaineeId] ?? {
    context: "RUDENIM_STAY" as const,
    validity: "INACTIVE" as const,
  };

  return {
    checkpoint: input.checkpoint,
    detaineeId: input.detaineeId,
    placement: input.placement,
    expectedHeadcount: actualHeadcount,
    actualHeadcount,
    qrContext: qr.context,
    qrValidity: qr.validity,
    movementId: movement?.id ?? "",
    auditEventId: correlatedAudit?.id ?? "",
  };
}

export function verifyPostCert01Runtime(
  state: PostCert01RuntimeState,
  input: PostCert01RuntimeInput,
): PostCert01Result {
  const observation = derivePostCert01Observation(state, input);
  const result = evaluatePostCert01({
    contractId: "POST-CERT-01-SYNTHETIC-RUNTIME",
    target: state.target,
    observations: [observation],
  });

  const reasons = [...result.reasonCodes];
  const placement = latestPlacement(state, input.detaineeId);
  const roomExists = state.rooms.some(
    (room) => room.id === input.roomId && room.status === "ACTIVE",
  );

  if (!roomExists) reasons.push("ROOM_CONTEXT_INVALID");
  if (!placement || placement.roomId !== input.roomId) {
    reasons.push("PLACEMENT_STATE_NOT_CANONICAL");
  }

  return {
    status: reasons.length === 0 ? "READY" : "BLOCKED",
    failedCheckpoints:
      reasons.length === 0 ? [] : [input.checkpoint],
    reasonCodes: [...new Set(reasons)],
  };
}

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
