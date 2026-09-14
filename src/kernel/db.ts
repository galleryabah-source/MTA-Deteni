import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

export type Database = Readonly<{
  query<T extends QueryResultRow = QueryResultRow>(text: string, values?: readonly unknown[]): Promise<QueryResult<T>>;
  transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}>;

export function createPostgresDatabase(options: {
  connectionString: string;
  max?: number;
  statementTimeoutMs?: number;
}): Database {
  const pool = new Pool({
    connectionString: options.connectionString,
    max: options.max ?? 10,
    statement_timeout: options.statementTimeoutMs ?? 5000,
  });

  return {
    query: (text, values) => pool.query(text, values ? [...values] : undefined),
    transaction: async <T>(fn: (client: PoolClient) => Promise<T>): Promise<T> => {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const result = await fn(client);
        await client.query('COMMIT');
        return result;
      } catch (error) {
        try { await client.query('ROLLBACK'); } catch { /* preserve original failure */ }
        throw error;
      } finally {
        client.release();
      }
    },
    close: () => pool.end(),
  };
}
