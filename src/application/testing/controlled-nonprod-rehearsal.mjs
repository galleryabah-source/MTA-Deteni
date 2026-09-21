import { createHash } from "node:crypto";

export const CONTROLLED_NONPROD_REHEARSAL_VERSION = "P10.229-236-v1";

const GOLDEN_STEPS = [
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

const clone = (value) => structuredClone(value);
const hash = (value) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");

export class SyntheticRepository {
  constructor() {
    this.state = new Map();
    this.audit = [];
    this.outbox = [];
    this.idempotency = new Map();
  }

  snapshot() {
    return {
      state: clone(this.state),
      audit: clone(this.audit),
      outbox: clone(this.outbox),
      idempotency: clone(this.idempotency),
    };
  }

  restore(snapshot) {
    this.state = snapshot.state;
    this.audit = snapshot.audit;
    this.outbox = snapshot.outbox;
    this.idempotency = snapshot.idempotency;
  }

  read(subjectId) {
    return clone(this.state.get(subjectId));
  }

  commit(subjectId, nextState, auditEvent, outboxEvent) {
    this.state.set(subjectId, clone(nextState));
    this.audit.push(clone(auditEvent));
    this.outbox.push(clone(outboxEvent));
  }
}

function transition(state, step) {
  const next = clone(state ?? { subjectId: step.subjectId, status: "ABSENT", history: [] });

  const expected = GOLDEN_STEPS[next.history.length];
  if (expected !== step.type) {
    throw new Error(`STATE_TRANSITION_INVALID:expected=${expected}:received=${step.type}`);
  }

  next.status = step.type;
  next.history.push(step.type);

  if (step.type === "CREATE_LEAVE") next.leaveStatus = "DRAFT";
  if (step.type === "APPROVE_LEAVE") next.leaveStatus = "APPROVED";
  if (step.type === "GENERATE_DOCUMENT") next.documentStatus = "ISSUED";
  if (step.type === "ASSIGN_ESCORT") next.escortStatus = "ASSIGNED";
  if (step.type === "DEPART") {
    if (next.leaveStatus !== "APPROVED" || next.documentStatus !== "ISSUED" || next.escortStatus !== "ASSIGNED") {
      throw new Error("DEPART_PREREQUISITES_INVALID");
    }
    next.leaveStatus = "DEPARTED";
  }
  if (step.type === "RETURN") {
    if (next.leaveStatus !== "DEPARTED") throw new Error("RETURN_PREREQUISITES_INVALID");
    next.leaveStatus = "RETURNED";
  }
  if (step.type === "COMPLETE") {
    if (next.leaveStatus !== "RETURNED") throw new Error("COMPLETE_PREREQUISITES_INVALID");
    next.leaveStatus = "COMPLETED";
  }

  return next;
}

export function executeControlledRehearsal({ scenarioId, subjectId, steps, repository = new SyntheticRepository(), failureAtStep = null }) {
  if (!Array.isArray(steps) || steps.length !== GOLDEN_STEPS.length) {
    throw new Error("REHEARSAL_STEPS_INVALID");
  }

  const baseline = repository.snapshot();
  const executed = [];

  try {
    for (const [index, step] of steps.entries()) {
      if (step.type !== GOLDEN_STEPS[index] || step.subjectId !== subjectId) {
        throw new Error(`REHEARSAL_SEQUENCE_INVALID:${index}`);
      }

      const requestHash = hash({ scenarioId, subjectId, step });
      const prior = repository.idempotency.get(step.stepId);
      if (prior && prior.requestHash === requestHash) {
        executed.push({ stepId: step.stepId, result: "REPLAY" });
        continue;
      }
      if (prior && prior.requestHash !== requestHash) {
        throw new Error(`IDEMPOTENCY_CONFLICT:${step.stepId}`);
      }

      const current = repository.read(subjectId);
      const next = transition(current, step);

      if (failureAtStep === index) {
        throw new Error(`SYNTHETIC_FAILURE_INJECTION:${step.type}`);
      }

      const auditEvent = {
        eventId: `audit-${step.stepId}`,
        action: step.type,
        subjectId,
        result: "SUCCESS",
        requestHash,
      };
      const outboxEvent = {
        eventId: `outbox-${step.stepId}`,
        subjectId,
        eventType: step.type,
        payloadHash: hash(next),
        status: "PENDING",
      };

      repository.commit(subjectId, next, auditEvent, outboxEvent);
      repository.idempotency.set(step.stepId, { requestHash, status: "COMPLETED" });
      executed.push({ stepId: step.stepId, result: "EXECUTED" });
    }

    return {
      status: "REHEARSAL_PASS",
      version: CONTROLLED_NONPROD_REHEARSAL_VERSION,
      scenarioId,
      subjectId,
      executed,
      finalState: repository.read(subjectId),
      auditCount: repository.audit.length,
      outboxCount: repository.outbox.length,
      productionMutation: false,
      externalTransport: false,
    };
  } catch (error) {
    repository.restore(baseline);
    return {
      status: "REHEARSAL_ROLLED_BACK",
      version: CONTROLLED_NONPROD_REHEARSAL_VERSION,
      scenarioId,
      subjectId,
      error: error.message,
      executed,
      finalState: repository.read(subjectId) ?? null,
      auditCount: repository.audit.length,
      outboxCount: repository.outbox.length,
      productionMutation: false,
      externalTransport: false,
    };
  }
}

export { GOLDEN_STEPS };
