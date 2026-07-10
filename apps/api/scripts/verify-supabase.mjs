import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config({ path: new URL("../.env", import.meta.url) });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to verify Supabase connectivity.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

const result = await pool.query(
  `select
    (select count(*)::int from gallery_images) as gallery_images,
    (select count(*)::int from events) as events,
    (select count(*)::int from event_registrations) as event_registrations,
    (select count(*)::int from team_members) as team_members`
);

console.log(JSON.stringify({ connected: true, counts: result.rows[0] }));
await pool.end();
