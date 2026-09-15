export type LanClient = Readonly<{
  clientId: string;
  deviceId: string;
  address: string;
  discoveredAt: string;
  trusted: boolean;
}>;

export function discoverLanClient(input: LanClient): LanClient {
  if (!input.clientId.trim() || !input.deviceId.trim() || !input.address.trim()) {
    throw new Error("LAN_CLIENT_IDENTITY_REQUIRED");
  }
  if (!input.discoveredAt.trim()) throw new Error("LAN_CLIENT_TIMESTAMP_REQUIRED");
  return input;
}

export function assertTrustedLanClient(client: LanClient): void {
  if (!client.trusted) throw new Error("LAN_CLIENT_TRUST_REQUIRED");
}
