export type PairingState = "PENDING" | "PAIRED" | "REVOKED" | "BLOCKED";

export type ClientPairing = Readonly<{
  pairingId: string;
  serverId: string;
  deviceId: string;
  state: PairingState;
  pairedAt?: string;
  pairingFingerprint: string;
}>;

export function validateClientPairing(pairing: ClientPairing): void {
  if (!pairing.pairingId.trim() || !pairing.serverId.trim() || !pairing.deviceId.trim() || !pairing.pairingFingerprint.trim()) throw new Error("CLIENT_PAIRING_IDENTITY_REQUIRED");
  if (pairing.state === "PAIRED" && !pairing.pairedAt?.trim()) throw new Error("CLIENT_PAIRING_TIMESTAMP_REQUIRED");
}

export function assertPairingAllowsSession(pairing: ClientPairing): void {
  validateClientPairing(pairing);
  if (pairing.state !== "PAIRED") throw new Error("CLIENT_PAIRING_NOT_ACTIVE");
}
