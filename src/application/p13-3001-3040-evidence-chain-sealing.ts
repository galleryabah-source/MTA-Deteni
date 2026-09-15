export type EvidenceChainItem = Readonly<{
  sequence: number;
  evidenceId: string;
  payloadFingerprint: string;
  previousFingerprint: string | null;
  fingerprint: string;
}>;

export type EvidenceChain = Readonly<{
  chainId: string;
  items: readonly EvidenceChainItem[];
  sealed: boolean;
  sealedAt?: string;
}>;

function fingerprint(item: Omit<EvidenceChainItem, "fingerprint">): string {
  let hash = 2166136261;
  const value = JSON.stringify(item);
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function appendEvidence(chain: EvidenceChain, input: Omit<EvidenceChainItem, "sequence" | "previousFingerprint" | "fingerprint">): EvidenceChain {
  if (chain.sealed) throw new Error("EVIDENCE_CHAIN_SEALED");
  if (!chain.chainId.trim() || !input.evidenceId.trim() || !input.payloadFingerprint.trim()) throw new Error("EVIDENCE_CHAIN_IDENTITY_REQUIRED");
  const last = chain.items.at(-1);
  const item = { ...input, sequence: (last?.sequence ?? 0) + 1, previousFingerprint: last?.fingerprint ?? null };
  return { ...chain, items: [...chain.items, { ...item, fingerprint: fingerprint(item) }] };
}

export function assertEvidenceChainIntact(chain: EvidenceChain): void {
  let previous: string | null = null;
  let sequence = 0;
  for (const item of chain.items) {
    sequence += 1;
    const unsigned = { sequence: item.sequence, evidenceId: item.evidenceId, payloadFingerprint: item.payloadFingerprint, previousFingerprint: item.previousFingerprint };
    if (item.sequence !== sequence || item.previousFingerprint !== previous || item.fingerprint !== fingerprint(unsigned)) throw new Error("EVIDENCE_CHAIN_INTEGRITY_FAILED");
    previous = item.fingerprint;
  }
}

export function sealEvidenceChain(chain: EvidenceChain, sealedAt: string): EvidenceChain {
  assertEvidenceChainIntact(chain);
  if (!sealedAt.trim()) throw new Error("EVIDENCE_CHAIN_SEAL_TIMESTAMP_REQUIRED");
  return { ...chain, sealed: true, sealedAt };
}
