export type IntegrityEnvelope = Readonly<{
  payload: string;
  checksum: string;
}>;

function fnv1a(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function createIntegrityEnvelope(payload: string): IntegrityEnvelope {
  if (!payload) throw new Error("INTEGRITY_PAYLOAD_REQUIRED");
  return { payload, checksum: fnv1a(payload) };
}

export function assertIntegrityEnvelope(envelope: IntegrityEnvelope): void {
  if (!envelope.payload || !envelope.checksum.trim()) throw new Error("INTEGRITY_ENVELOPE_INVALID");
  if (fnv1a(envelope.payload) !== envelope.checksum) throw new Error("INTEGRITY_CHECKSUM_MISMATCH");
}
