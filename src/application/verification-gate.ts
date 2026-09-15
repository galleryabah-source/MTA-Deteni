import { DomainError } from "../domain/shared/errors.js";
import type { EvidencePacket } from "./verification-evidence.js";

export type GateDecision = "READY" | "BLOCKED";

export const CONTROLLED_NONPROD_CONTROLS = [
  "TARGET_AUTHORIZATION",
  "SCHEMA_RLS_READ_ONLY_RECONCILIATION",
  "PERSISTENCE_CONCURRENCY",
  "AUDIT_APPEND_ONLY",
  "OUTBOX_IDEMPOTENCY",
  "API_AUTHORIZATION",
  "RUNTIME_READINESS",
  "SYNTHETIC_E2E",
] as const;

export function evaluateControlledGate(packet: EvidencePacket): GateDecision {
  if (packet.target !== "SYNTHETIC" && packet.target !== "NON_PRODUCTION") return "BLOCKED";
  const controls = new Set(packet.controls.map((control) => control.control));
  if (CONTROLLED_NONPROD_CONTROLS.some((required) => !controls.has(required))) return "BLOCKED";
  if (packet.controls.some((control) => control.status !== "PASS")) return "BLOCKED";
  if (packet.target === "NON_PRODUCTION" && packet.controls.some((control) => control.target !== "NON_PRODUCTION")) return "BLOCKED";
  return "READY";
}

export function assertControlledGate(packet: EvidencePacket): void {
  if (evaluateControlledGate(packet) !== "READY") throw new DomainError("FORBIDDEN_SCOPE", "Controlled integration gate is not satisfied.");
}
