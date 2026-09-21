import { createHash } from "node:crypto";

export const SYNTHETIC_SCENARIO_MANIFEST_VERSION = "P10.205-212-v1";

const REQUIRED_STEPS = [
  "CREATE_DETAINEE",
  "ASSIGN_PLACEMENT",
  "RECORD_MOVEMENT",
  "CREATE_LEAVE",
  "APPROVE_LEAVE",
  "GENERATE_DOCUMENT",
  "ASSIGN_ESCORT",
  "DEPART",
  "RETURN",
  "COMPLETE",
];

const sha256 = (value) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");

export function buildSyntheticScenarioManifest(input) {
  if (input.syntheticOnly !== true) throw new Error("SCENARIO_MUST_BE_SYNTHETIC");
  if (input.migrationFreeze !== true) throw new Error("MIGRATION_FREEZE_REQUIRED");
  if (input.aiEnabled !== false) throw new Error("AI_MUST_REMAIN_OFF");

  if (!Array.isArray(input.steps) || input.steps.length !== REQUIRED_STEPS.length) {
    throw new Error("SCENARIO_STEP_COUNT_INVALID");
  }

  const ids = new Set();
  for (const [index, step] of input.steps.entries()) {
    if (!step || typeof step.stepId !== "string" || !step.stepId.trim()) {
      throw new Error(`SCENARIO_STEP_ID_INVALID:${index}`);
    }
    if (ids.has(step.stepId)) throw new Error(`SCENARIO_STEP_ID_DUPLICATE:${step.stepId}`);
    ids.add(step.stepId);
    if (step.type !== REQUIRED_STEPS[index]) {
      throw new Error(`SCENARIO_STEP_ORDER_INVALID:${index}`);
    }
    if (step.subjectId !== input.subjectId) {
      throw new Error(`SCENARIO_SUBJECT_MISMATCH:${step.stepId}`);
    }
  }

  const normalized = {
    version: SYNTHETIC_SCENARIO_MANIFEST_VERSION,
    scenarioId: input.scenarioId,
    subjectId: input.subjectId,
    requestId: input.requestId,
    correlationId: input.correlationId,
    steps: input.steps.map(({stepId,type,subjectId,sourceId}) => ({stepId,type,subjectId,sourceId})),
    invariants: {
      auditRequired: true,
      outboxRequired: true,
      externalTransport: false,
      durablePublication: false,
      productionMutation: false,
    },
  };

  return {
    ...normalized,
    manifestFingerprint: sha256(normalized),
  };
}

export function validateSyntheticScenarioManifest(manifest) {
  const expected = buildSyntheticScenarioManifest({
    ...manifest,
    syntheticOnly: true,
    migrationFreeze: true,
    aiEnabled: false,
  });
  return expected.manifestFingerprint === manifest.manifestFingerprint;
}

export { REQUIRED_STEPS };
