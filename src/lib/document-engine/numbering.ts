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

export interface NumberingReservation {
  readonly registerKey: string;
  readonly number: string;
  readonly sequence: number;
  readonly reservedAt: string;
  readonly expiresAt?: string;
}

export interface DocumentNumberAllocator {
  reserve(context: DocumentNumberContext): NumberingReservation;
  commit(reservation: NumberingReservation, documentId: string, issuedAt: string): NumberingRegister;
}

/**
 * Reference-only allocator. Persistence, uniqueness and transaction locking are
 * intentionally delegated to the future PostgreSQL integration layer.
 */
export class InMemoryDocumentNumberAllocator implements DocumentNumberAllocator {
  private readonly committed = new Set<string>();

  reserve(context: DocumentNumberContext): NumberingReservation {
    const number = formatDocumentNumber(context);
    const registerKey = `${context.prefix}:${context.year}:${context.sequence}`;
    if (this.committed.has(registerKey)) throw new Error("DOCUMENT_NUMBER_ALREADY_COMMITTED");
    return {
      registerKey,
      number,
      sequence: context.sequence,
      reservedAt: new Date().toISOString(),
    };
  }

  commit(reservation: NumberingReservation, documentId: string, issuedAt: string): NumberingRegister {
    if (!documentId.trim()) throw new Error("INVALID_DOCUMENT_ID");
    if (Number.isNaN(Date.parse(issuedAt))) throw new Error("INVALID_ISSUED_AT");
    if (this.committed.has(reservation.registerKey)) throw new Error("DOCUMENT_NUMBER_ALREADY_COMMITTED");
    this.committed.add(reservation.registerKey);
    return {
      registerKey: reservation.registerKey,
      documentId,
      number: reservation.number,
      issuedAt,
    };
  }
}
