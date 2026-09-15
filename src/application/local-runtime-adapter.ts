import type { BrowserTransportRequest } from "./runtime-adapters.js";
import type { LanDeviceIdentity, LocalServiceBoundary } from "./runtime-surface.js";
import { assertBrowserTransportRequest } from "./runtime-adapters.js";
import { assertLanDeviceIdentity, assertLocalServiceBoundary } from "./runtime-surface.js";

export type LocalRuntimeRequest = Readonly<BrowserTransportRequest & {
  device: LanDeviceIdentity;
  boundary: LocalServiceBoundary;
}>;

export type LocalRuntimeResponse = Readonly<{
  requestId: string;
  status: "ACCEPTED" | "REJECTED";
  syntheticOnly: true;
}>;

export interface LocalRuntimeAdapter {
  execute(request: LocalRuntimeRequest): Promise<LocalRuntimeResponse>;
}

export function assertLocalRuntimeRequest(request: LocalRuntimeRequest): void {
  assertBrowserTransportRequest(request);
  assertLanDeviceIdentity(request.device);
  assertLocalServiceBoundary(request.boundary);
  if (request.boundary.listenScope !== "LAN_ONLY" && request.boundary.listenScope !== "LOOPBACK_ONLY") throw new Error("Unsupported local service listen scope.");
  if (!request.path.startsWith("/mta-local/")) throw new Error("Local runtime adapter rejects non-local service paths.");
  if (/^https?:\/\//i.test(request.path) || request.path.startsWith("//")) throw new Error("Local runtime adapter rejects absolute or protocol-relative URLs.");
}

export class MemoryLocalRuntimeAdapter implements LocalRuntimeAdapter {
  async execute(request: LocalRuntimeRequest): Promise<LocalRuntimeResponse> {
    assertLocalRuntimeRequest(request);
    return Object.freeze({ requestId: request.requestId, status: "ACCEPTED", syntheticOnly: true });
  }
}
