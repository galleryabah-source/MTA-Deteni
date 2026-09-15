import type { ApplicationSurface } from "./application-surface.js";
import { assertUiMutationHasServerBoundary, type UiSurface } from "./ui-surface.js";

export type ApplicationBoundaryCheck = Readonly<{
  checkpoint: string;
  control: string;
  status: "PASS" | "FAIL";
  details: string;
}>;

export type ApplicationBoundaryGate = Readonly<{
  gateId: string;
  target: "SYNTHETIC";
  checks: readonly ApplicationBoundaryCheck[];
}>;

const REQUIRED_SURFACES: readonly UiSurface[] = [
  "DASHBOARD", "DETAINEE", "MOVEMENT", "TEMPORARY_EXIT", "QR", "REPORTS",
];

function nonBlank(value: string): boolean { return value.trim().length > 0; }

export function evaluateApplicationBoundary(surface: ApplicationSurface, gateId: string): ApplicationBoundaryGate {
  const checks: ApplicationBoundaryCheck[] = [];
  checks.push({
    checkpoint: "P11.001-008", control: "surface-identity",
    status: REQUIRED_SURFACES.includes(surface.readModel.surface) && nonBlank(surface.readModel.title) ? "PASS" : "FAIL",
    details: "Application surface exposes a recognized UI read-model identity.",
  });

  const mutationActions = surface.readModel.actions.filter((action) => action.method === "MUTATE");
  let mutationStatus: "PASS" | "FAIL" = "PASS";
  try { mutationActions.forEach(assertUiMutationHasServerBoundary); } catch { mutationStatus = "FAIL"; }
  checks.push({
    checkpoint: "P11.009-016", control: "mutation-server-boundary", status: mutationStatus,
    details: "Every exposed mutation action has an explicit server-bound action id.",
  });

  checks.push({
    checkpoint: "P11.017-024", control: "read-model-shape",
    status: Array.isArray(surface.readModel.summary) && Array.isArray(surface.readModel.actions) ? "PASS" : "FAIL",
    details: "Read-model collections remain structurally enumerable for responsive clients.",
  });

  checks.push({
    checkpoint: "P11.025-032", control: "capability-boundary",
    status: typeof surface.qr === "function" && typeof surface.report === "function" ? "PASS" : "FAIL",
    details: "QR verification and report conversion remain application-bound capabilities.",
  });
  return { gateId, target: "SYNTHETIC", checks };
}

export function evaluateApplicationBoundaryGate(gate: ApplicationBoundaryGate): "READY" | "BLOCKED" {
  if (!nonBlank(gate.gateId) || gate.target !== "SYNTHETIC" || gate.checks.length !== 4) return "BLOCKED";
  return gate.checks.every((check) => nonBlank(check.checkpoint) && nonBlank(check.control) && nonBlank(check.details) && check.status === "PASS") ? "READY" : "BLOCKED";
}
