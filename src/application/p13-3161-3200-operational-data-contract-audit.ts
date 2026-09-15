export type ContractField = Readonly<{
  name: string;
  required: boolean;
  authoritative: boolean;
  syntheticAllowed: boolean;
}>;

export type OperationalDataContract = Readonly<{
  contractId: string;
  domain: "RAP" | "PERKES" | "KAMTIB" | "SUBBAG_TU" | "HEAD_RUDENIM";
  fields: readonly ContractField[];
}>;

export function assertOperationalDataContract(contract: OperationalDataContract): void {
  if (!contract.contractId.trim() || contract.fields.length === 0) throw new Error("DATA_CONTRACT_REQUIRED");
  for (const field of contract.fields) {
    if (!field.name.trim()) throw new Error("DATA_CONTRACT_FIELD_NAME_REQUIRED");
    if (field.required && !field.authoritative) throw new Error(`REQUIRED_FIELD_NOT_AUTHORITATIVE:${field.name}`);
    if (field.authoritative && !field.syntheticAllowed) throw new Error(`NON_SYNTHETIC_AUTHORITY_FIELD:${field.name}`);
  }
}
