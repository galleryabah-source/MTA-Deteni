export const KERNEL_CERTIFICATION_EVIDENCE_VERSION = "P10.22-v1";

export type EvidenceStatus = "PASS" | "ACCEPTED" | "FAIL" | "MISSING" | "UNVERIFIED";

export interface KernelEvidence {
  contractId: string;
  status: EvidenceStatus;
  evidenceRef: string;
}

export interface KernelCertificationResult {
  status: "CERTIFIED" | "NOT_CERTIFIED";
  missing: string[];
  failed: string[];
  unverified: string[];
  version: string;
}

export const REQUIRED_KERNEL_CONTRACTS = [
  "P9.2","P9.3","P9.4","P9.5","P9.6",
  "P9.7","P9.8","P9.9","P9.10","P9.11","P9.12",
] as const;

export function evaluateKernelEvidence(
  evidence: readonly KernelEvidence[],
): KernelCertificationResult {
  const byId = new Map(evidence.map((item) => [item.contractId, item]));
  const missing: string[] = [];
  const failed: string[] = [];
  const unverified: string[] = [];

  for (const id of REQUIRED_KERNEL_CONTRACTS) {
    const item = byId.get(id);
    if (!item || item.status === "MISSING") {
      missing.push(id);
    } else if (item.status === "FAIL") {
      failed.push(id);
    } else if (item.status === "UNVERIFIED") {
      unverified.push(id);
    }
  }

  return {
    status: missing.length || failed.length || unverified.length ? "NOT_CERTIFIED" : "CERTIFIED",
    missing,
    failed,
    unverified,
    version: KERNEL_CERTIFICATION_EVIDENCE_VERSION,
  };
}
