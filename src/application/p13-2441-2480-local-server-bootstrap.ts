export type LocalServerState = "STOPPED" | "STARTING" | "READY" | "DEGRADED" | "STOPPING";

export type LocalServerBootstrap = Readonly<{
  serverId: string;
  bindAddress: string;
  port: number;
  state: LocalServerState;
  databaseMode: "LOCAL_NONPROD";
  internetRequired: false;
  syntheticOnly: true;
}>;

export function validateLocalServerBootstrap(input: LocalServerBootstrap): void {
  if (!input.serverId.trim() || !input.bindAddress.trim()) throw new Error("LOCAL_SERVER_IDENTITY_REQUIRED");
  if (!Number.isInteger(input.port) || input.port < 1 || input.port > 65535) throw new Error("LOCAL_SERVER_PORT_INVALID");
  if (input.databaseMode !== "LOCAL_NONPROD") throw new Error("LOCAL_SERVER_DATABASE_MODE_BLOCKED");
  if (input.internetRequired !== false || input.syntheticOnly !== true) throw new Error("LOCAL_SERVER_GOVERNANCE_INVALID");
}

export function assertLocalServerReady(input: LocalServerBootstrap): void {
  validateLocalServerBootstrap(input);
  if (input.state !== "READY") throw new Error("LOCAL_SERVER_NOT_READY");
}
