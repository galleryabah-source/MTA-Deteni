export const REQUIRED_P9_KERNEL_CONTROLS = Object.freeze(["P9.9", "P9.10", "P9.11", "P9.12"] as const);

export type KernelControl = Readonly<{ id: string; status: "PASS" | "PENDING" | "BLOCKED" }>;
export type KernelCertificationResult = Readonly<{
  certificationId: string;
  state: "CERTIFIED" | "NOT_CERTIFIED";
  controls: readonly KernelControl[];
  productionAccessAuthorized: false;
  migrationExecuted: false;
  aiEnabled: false;
}>;

export function certifyP9Kernel(certificationId: string, controls: readonly KernelControl[]): KernelCertificationResult {
  if (!certificationId.trim()) throw new Error("P9_CERTIFICATION_ID_REQUIRED");
  if (controls.length === 0) throw new Error("P9_CERTIFICATION_CONTROLS_REQUIRED");

  const byId = new Map(controls.map((control) => [control.id, control]));
  const hasAllRequiredControls = REQUIRED_P9_KERNEL_CONTROLS.every((id) => byId.has(id));
  const uniqueIds = new Set(controls.map((control) => control.id));
  const allControlsValid = controls.every((control) => control.id.trim() && control.status === "PASS");
  const state = hasAllRequiredControls && uniqueIds.size === controls.length && allControlsValid
    ? "CERTIFIED"
    : "NOT_CERTIFIED";

  return Object.freeze({
    certificationId,
    state,
    controls: Object.freeze([...controls]),
    productionAccessAuthorized: false,
    migrationExecuted: false,
    aiEnabled: false,
  });
}
