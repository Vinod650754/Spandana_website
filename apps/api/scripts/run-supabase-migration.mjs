import dotenv from "dotenv";
import { readFile } from "node:fs/promises";
import { Client } from "pg";

dotenv.config({ path: new URL("../.env", import.meta.url) });

if (!process.env.DIRECT_URL) {
  throw new Error("DIRECT_URL is required to run Supabase migrations.");
}

const migrationFile = process.argv[2] ?? "002_supabase_init.sql";
const sqlPath = new URL(`../../../db/migrations/${migrationFile}`, import.meta.url);
const sql = await readFile(sqlPath, "utf8");
const client = new Client({
  connectionString: process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

await client.connect();
await client.query(sql);

const result = await client.query(
  `select table_name
   from information_schema.tables
   where table_schema = 'public'
     and table_name in ('gallery_images', 'events', 'event_registrations', 'team_members', 'contact_info', 'contact_messages')
   order by table_name`
);

console.log(
  JSON.stringify({
    migrated: true,
    migration: migrationFile,
    tables: result.rows.map((row) => row.table_name),
  })
);

await client.end();
