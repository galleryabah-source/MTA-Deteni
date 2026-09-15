import type { OfflineCommand } from "./offline-continuity.js";
import type { LanDeviceIdentity, LocalServiceBoundary } from "./runtime-surface.js";

export type BrowserTransportRequest = Readonly<{
  requestId: string;
  actorId: string;
  device: LanDeviceIdentity;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  idempotencyKey?: string;
}>;

export function assertBrowserTransportRequest(request: BrowserTransportRequest): void {
  for (const [name, value] of [["requestId", request.requestId], ["actorId", request.actorId], ["path", request.path]]) {
    if (!value.trim()) throw new Error(`Browser request requires ${name}.`);
  }
  if (request.method !== "GET" && !request.idempotencyKey?.trim()) throw new Error("Mutation transport requires idempotency key.");
}

export type PersistentQueueAdapter<T = OfflineCommand> = Readonly<{
  append(item: T): Promise<void>;
  list(): Promise<readonly T[]>;
  replace(item: T): Promise<void>;
  replaceByIdentity(item: T, identity: (candidate: T) => string): Promise<void>;
}>;

export class MemoryQueueAdapter<T = OfflineCommand> implements PersistentQueueAdapter<T> {
  private items: T[] = [];
  async append(item: T): Promise<void> { this.items.push(item); }
  async list(): Promise<readonly T[]> { return [...this.items]; }
  async replace(item: T): Promise<void> {
    const index = this.items.findIndex((candidate) => candidate === item);
    if (index < 0) throw new Error("Queue replacement target is not present.");
    this.items[index] = item;
  }
  async replaceByIdentity(item: T, identity: (candidate: T) => string): Promise<void> {
    const target = identity(item);
    if (!target.trim()) throw new Error("Queue replacement identity is required.");
    const index = this.items.findIndex((candidate) => identity(candidate) === target);
    if (index < 0) throw new Error("Queue replacement identity is not present.");
    this.items[index] = item;
  }
}

export type LanSession = Readonly<{
  sessionId: string;
  device: LanDeviceIdentity;
  authenticatedAt: string;
  expiresAt: string;
}>;

export function assertLanSession(session: LanSession, expectedDevice: LanDeviceIdentity, now: string): void {
  if (!session.sessionId.trim()) throw new Error("LAN session identity is required.");
  if (session.device.deviceId !== expectedDevice.deviceId || session.device.installationId !== expectedDevice.installationId || session.device.networkScopeId !== expectedDevice.networkScopeId) {
    throw new Error("LAN session/device binding mismatch.");
  }
  if (now >= session.expiresAt) throw new Error("LAN session expired.");
}

export function assertLocalAdapterBoundary(boundary: LocalServiceBoundary, device: LanDeviceIdentity): void {
  if (boundary.allowsInternetExposure || !boundary.requiresAuthenticatedDevice) throw new Error("Local adapter boundary is unsafe.");
  if (!device.deviceId.trim() || !device.installationId.trim() || !device.networkScopeId.trim()) throw new Error("Local adapter requires authenticated device identity.");
}

export type BackupManifest = Readonly<{
  schemaVersion: 1;
  backupId: string;
  sourceRuntime: "LAN" | "LOCAL";
  sourceDeviceId: string;
  sourceInstallationId: string;
  createdAt: string;
  previousBackupId?: string;
  payloadFingerprint: string;
  syntheticOnly: true;
}>;

export function assertBackupManifest(manifest: BackupManifest): void {
  for (const [name, value] of Object.entries(manifest)) {
    if (name === "syntheticOnly" || name === "schemaVersion" || name === "previousBackupId") continue;
    if (typeof value === "string" && !value.trim()) throw new Error(`Backup manifest requires ${name}.`);
  }
  if (manifest.schemaVersion !== 1 || manifest.syntheticOnly !== true) throw new Error("Unsupported or non-synthetic backup manifest.");
}

export function assertBackupChain(previous: BackupManifest | undefined, current: BackupManifest): void {
  assertBackupManifest(current);
  if (previous && current.previousBackupId !== previous.backupId) throw new Error("Backup chain reference mismatch.");
}
