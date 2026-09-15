import type { ClientPairing, PairingState } from "./p13-2721-2760-client-pairing.js";
import type { ContinuitySessionState } from "./p13-2881-2920-continuity-session-lifecycle.js";

export type DeviceRevocation = Readonly<{
  deviceId: string;
  pairingId: string;
  reason: string;
  revokedAt: string;
  initiatedBy: string;
}>;

export function validateDeviceRevocation(revocation: DeviceRevocation): void {
  if (!revocation.deviceId.trim() || !revocation.pairingId.trim() || !revocation.reason.trim() || !revocation.initiatedBy.trim()) throw new Error("DEVICE_REVOCATION_IDENTITY_REQUIRED");
  if (!revocation.revokedAt.trim()) throw new Error("DEVICE_REVOCATION_TIMESTAMP_REQUIRED");
}

export function revokePairingState(state: PairingState): PairingState {
  if (state === "BLOCKED") return "BLOCKED";
  return "REVOKED";
}

export function revokeSessionState(state: ContinuitySessionState): ContinuitySessionState {
  if (state === "CLOSED") return "CLOSED";
  return "REVOKED";
}
