/**
 * SSL setting for the PostgreSQL driver, from DATABASE_SSL:
 * - "false" (default): plain connection, for a local database;
 * - "true": encrypted, and the server's certificate must be trusted;
 * - "no-verify": encrypted, without checking the certificate (hosted databases
 *   such as Render whose certificate Node does not trust out of the box).
 */
export type DatabaseSsl = 'false' | 'true' | 'no-verify';

export function pgSsl(mode: string | undefined): boolean | { rejectUnauthorized: false } | undefined {
  if (mode === 'true') return true;
  if (mode === 'no-verify') return { rejectUnauthorized: false };
  return undefined;
}
