export type SqlTransaction = Readonly<{
  transactionId: string;
  execute<T>(sql: string, params?: readonly unknown[]): Promise<readonly T[]>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}>;

export type SqlTransactionFactory = Readonly<{
  begin(metadata: Readonly<{ transactionId: string; actorId: string; correlationId: string; aggregateId: string }>): Promise<SqlTransaction>;
}>;

export async function runSqlTransaction<T>(
  factory: SqlTransactionFactory,
  metadata: Readonly<{ transactionId: string; actorId: string; correlationId: string; aggregateId: string }>,
  work: (tx: SqlTransaction) => Promise<T>,
): Promise<T> {
  if (!metadata.transactionId.trim() || !metadata.actorId.trim() || !metadata.correlationId.trim() || !metadata.aggregateId.trim()) {
    throw new Error("TRANSACTION_METADATA_REQUIRED");
  }
  const tx = await factory.begin(metadata);
  try {
    const result = await work(tx);
    await tx.commit();
    return result;
  } catch (error) {
    await tx.rollback();
    throw error;
  }
}
