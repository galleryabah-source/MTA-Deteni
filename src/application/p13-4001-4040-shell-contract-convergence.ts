export type ShellSurface = "DASHBOARD" | "DETAINEE" | "KAMTIB" | "PERKES" | "RAP" | "REPORTS" | "AUDIT";

export type ShellContract = Readonly<{
  surface: ShellSurface;
  requiresAuthorization: true;
  responsive: true;
  offlineAware: true;
  syntheticSafe: true;
}>;

export function assertShellContract(contract: ShellContract): void {
  if (!contract.requiresAuthorization || !contract.responsive || !contract.offlineAware || !contract.syntheticSafe) throw new Error("APPLICATION_SHELL_CONTRACT_INVALID");
}
