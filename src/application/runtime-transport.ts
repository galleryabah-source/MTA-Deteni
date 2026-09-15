import type { LanDeviceIdentity, LocalServiceBoundary } from "./runtime-surface.js";

export type BrowserTransportRequest = Readonly<{
  requestId: string;
  device: LanDeviceIdentity;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  idempotencyKey?: string;
}>;

export function assertBrowserTransportRequest(request: BrowserTransportRequest, boundary: LocalServiceBoundary): void {
  if (!request.requestId.trim() || !request.path.startsWith("/")) throw new Error("Browser transport requires request identity and absolute application path.");
  if (!request.device.deviceId.trim() || !request.device.installationId.trim() || !request.device.networkScopeId.trim()) {
    throw new Error("Browser transport requires authenticated LAN device identity.");
  }
  if (boundary.allowsInternetExposure || !boundary.requiresAuthenticatedDevice) throw new Error("Transport boundary is unsafe.");
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method) && !request.idempotencyKey?.trim()) {
    throw new Error("Mutating browser requests require an idempotency key.");
  }
}

export type PersistentQueueAdapter<T> = Readonly<{
  append: (item: T) => void;
  listPending: () => readonly T[];
  markSynced: (identity: string) => void;
}>;

export type BackupManifest = Readonly<{
  manifestVersion: "v1";
  backupId: string;
  sourceRuntime: "LAN" | "LOCAL";
  sourceDeviceId: string;
  createdAt: string;
  recordCount: number;
  syntheticOnly: true;
  previousBackupId?: string;
}>;

export function assertBackupManifest(manifest: BackupManifest): void {
  if (!manifest.backupId.trim() || !manifest.sourceDeviceId.trim()) throw new Error("Backup manifest identity is required.");
  if (!Number.isInteger(manifest.recordCount) || manifest.recordCount < 0) throw new Error("Backup record count must be a non-negative integer.");
  if (!manifest.syntheticOnly) throw new Error("Backup manifest must remain synthetic-only.");
}
