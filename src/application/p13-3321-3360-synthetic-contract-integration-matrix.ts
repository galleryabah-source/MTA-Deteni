export type ContractDomain = "RAP" | "PERKES" | "KAMTIB" | "SUBBAG_TU" | "HEAD_RUDENIM";
export type ContractMatrixEntry = Readonly<{
  entryId: string;
  sourceDomain: ContractDomain;
  targetDomain: ContractDomain;
  contractId: string;
  compatible: boolean;
  evidenceId: string;
}>;

export function assertSyntheticContractMatrix(entries: readonly ContractMatrixEntry[]): void {
  if (entries.length === 0) throw new Error("CONTRACT_MATRIX_REQUIRED");
  for (const entry of entries) {
    if (!entry.entryId.trim() || !entry.contractId.trim() || !entry.evidenceId.trim()) throw new Error("CONTRACT_MATRIX_IDENTITY_REQUIRED");
    if (!entry.compatible) throw new Error(`CONTRACT_MATRIX_INCOMPATIBLE:${entry.entryId}`);
  }
}
