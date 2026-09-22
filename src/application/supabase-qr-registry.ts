import type { SharedQrLookup, SharedQrRecord, SharedQrRegistry } from "./shared-qr-resolver-v2.js";

export type CloudQrRegistryHttp = Readonly<{
  resolve(input: SharedQrLookup & { accessToken: string }): Promise<SharedQrRecord | null>;
}>;

export function createSupabaseSharedQrRegistry(http: CloudQrRegistryHttp, accessToken: string): SharedQrRegistry {
  return Object.freeze({
    find(input: SharedQrLookup) {
      if (!accessToken.trim()) throw new Error("Cloud QR registry requires an authenticated access token.");
      return http.resolve({ ...input, accessToken });
    }
  });
}

export function createSupabaseQrRegistryHttp(baseUrl: string, fetchImpl: typeof fetch = fetch): CloudQrRegistryHttp {
  return Object.freeze({
    async resolve(input) {
      const response = await fetchImpl(baseUrl.replace(/\/$/, "") + "/api/mta/qr-registry/resolve", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + input.accessToken,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ resourceId: input.resourceId, token: input.token })
      });
      if (response.status === 404) return null;
      if (!response.ok) throw new Error("Cloud QR registry lookup failed: HTTP " + response.status);
      const body = await response.json() as { ok?: boolean; data?: SharedQrRecord | null };
      return body.ok && body.data ? { ...body.data, token: input.token } : null;
    }
  });
}
