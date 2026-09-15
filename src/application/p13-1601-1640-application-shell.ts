import type { ActorContext } from "../domain/shared/contracts.js";
import type { DashboardRole } from "./read-model.js";

export type ApplicationShellState = Readonly<{
  actorId: string;
  role: DashboardRole;
  activeSection: string;
  onlineState: "ONLINE" | "OFFLINE" | "DEGRADED";
  dataTrust: "TRUSTED" | "UNTRUSTED";
  syntheticMode: true;
}>;

export function composeApplicationShell(actor: ActorContext, activeSection: string, onlineState: ApplicationShellState["onlineState"], dataTrust: ApplicationShellState["dataTrust"]): ApplicationShellState {
  if (!actor.actorId.trim() || !actor.correlationId.trim()) throw new Error("SHELL_ACTOR_IDENTITY_REQUIRED");
  if (!activeSection.trim()) throw new Error("SHELL_ACTIVE_SECTION_REQUIRED");
  return { actorId: actor.actorId, role: actor.role as DashboardRole, activeSection, onlineState, dataTrust, syntheticMode: true };
}

export function assertShellAllowsOperationalMutation(shell: ApplicationShellState): void {
  if (shell.onlineState !== "ONLINE") throw new Error("SHELL_MUTATION_REQUIRES_ONLINE");
  if (shell.dataTrust !== "TRUSTED") throw new Error("SHELL_MUTATION_REQUIRES_TRUSTED_DATA");
}
