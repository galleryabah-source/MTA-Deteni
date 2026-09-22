import type { SharedQrLookup, SharedQrRecord, SharedQrRegistry } from "./shared-qr-resolver-v2.js";

export type LocalLanQrRegistryTransport = Readonly<{
  lookup(input: SharedQrLookup): Promise<SharedQrRecord | null>;
}>;

export function createLocalLanSharedQrRegistry(transport: LocalLanQrRegistryTransport): SharedQrRegistry {
  return Object.freeze({
    find(input) {
      return transport.lookup(input);
    }
  });
}

export type CloudQrRegistryTransport = Readonly<{
  lookup(input: SharedQrLookup): Promise<SharedQrRecord | null>;
}>;

export function createCloudSharedQrRegistry(transport: CloudQrRegistryTransport): SharedQrRegistry {
  return Object.freeze({
    find(input) {
      return transport.lookup(input);
    }
  });
}
