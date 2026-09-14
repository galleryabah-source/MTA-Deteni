export interface DocumentNumberContext {
  readonly prefix: string;
  readonly year: number;
  readonly sequence: number;
}

export const formatDocumentNumber = ({ prefix, year, sequence }: DocumentNumberContext): string => {
  if (!prefix.trim() || !Number.isInteger(year) || !Number.isInteger(sequence) || sequence < 1) {
    throw new Error("INVALID_DOCUMENT_NUMBER_CONTEXT");
  }
  return `${prefix}/${String(sequence).padStart(4, "0")}/${year}`;
};

export interface NumberingRegister {
  readonly registerKey: string;
  readonly documentId: string;
  readonly number: string;
  readonly issuedAt: string;
}
