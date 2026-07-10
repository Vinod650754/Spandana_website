import { Pool, type QueryResultRow } from "pg";
import { env } from "../config/env.js";

function shouldUseSsl(connectionString: string) {
  if (env.databaseSsl === "true") return true;
  if (env.databaseSsl === "false") return false;
  return /supabase\.com|pooler\.supabase\.com/.test(connectionString);
}

if (!env.databaseUrl) {
  throw new Error("DATABASE_URL is required. Configure the Supabase transaction pooler URL.");
}

export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: shouldUseSsl(env.databaseUrl) ? { rejectUnauthorized: false } : false,
});

export async function query<T extends QueryResultRow>(text: string, params: unknown[] = []) {
  const result = await pool.query<T>(text, params);
  return result;
}
