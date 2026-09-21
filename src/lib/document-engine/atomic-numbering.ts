import { formatDocumentNumber, type DocumentNumberContext, type NumberingRegister } from "./numbering";

export interface AtomicNumberReservation {
  readonly registerKey: string;
  readonly number: string;
  readonly sequence: number;
  readonly reservedAt: string;
}

export interface AtomicNumberingRepository {
  reserveNext(input: Omit<DocumentNumberContext, "sequence">): Promise<AtomicNumberReservation>;
  commit(reservation: AtomicNumberReservation, documentId: string, issuedAt: string): Promise<NumberingRegister>;
}

/**
 * Persistence-neutral atomic numbering contract. Production adapters must
 * allocate and commit under a durable uniqueness constraint/transaction.
 */
export class InMemoryAtomicNumberingRepository implements AtomicNumberingRepository {
  private readonly nextSequence = new Map<string, number>();
  private readonly committed = new Map<string, NumberingRegister>();

  async reserveNext(input: Omit<DocumentNumberContext, "sequence">): Promise<AtomicNumberReservation> {
    if (!input.prefix.trim() || !Number.isInteger(input.year)) throw new Error("INVALID_DOCUMENT_NUMBER_CONTEXT");
    const key = `${input.prefix}:${input.year}`;
    const sequence = this.nextSequence.get(key) ?? 1;
    const registerKey = `${key}:${sequence}`;
    if (this.committed.has(registerKey)) throw new Error("DOCUMENT_NUMBER_ALREADY_COMMITTED");
    this.nextSequence.set(key, sequence + 1);
    return Object.freeze({
      registerKey,
      number: formatDocumentNumber({ ...input, sequence }),
      sequence,
      reservedAt: new Date().toISOString(),
    });
  }

  async commit(reservation: AtomicNumberReservation, documentId: string, issuedAt: string): Promise<NumberingRegister> {
    if (!documentId.trim()) throw new Error("INVALID_DOCUMENT_ID");
    if (Number.isNaN(Date.parse(issuedAt))) throw new Error("INVALID_ISSUED_AT");
    const existing = this.committed.get(reservation.registerKey);
    if (existing) throw new Error("DOCUMENT_NUMBER_ALREADY_COMMITTED");
    const register = Object.freeze({
      registerKey: reservation.registerKey,
      documentId,
      number: reservation.number,
      issuedAt,
    });
    this.committed.set(reservation.registerKey, register);
    return register;
  }
}
