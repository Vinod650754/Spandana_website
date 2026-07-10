# Supabase Migration Report

Date: 2026-06-20

## Result

Phase A.1 Supabase migration is complete.

The API no longer depends on a local PostgreSQL instance. Runtime database traffic now uses the Supabase transaction pooler through `DATABASE_URL`, and schema migrations use the Supabase session pooler through `DIRECT_URL`.

## Changes Made

- Added Supabase environment support in `apps/api/src/config/env.ts`.
- Updated `apps/api/src/db/pool.ts` to require `DATABASE_URL` and enable SSL automatically for Supabase pooler connections.
- Added Supabase schema migration: `db/migrations/002_supabase_init.sql`.
- Added repeatable migration and connectivity scripts:
  - `apps/api/scripts/run-supabase-migration.mjs`
  - `apps/api/scripts/verify-supabase.mjs`
- Updated API data routes so gallery, analytics, registrations, and contact messages use Supabase-backed tables.
- Hardened gallery upload cleanup so Cloudinary assets are deleted if Supabase metadata storage fails.
- Updated admin login to call `/auth/login` and store `adminToken`.
- Updated admin dashboard to read `/analytics/dashboard`.
- Updated admin gallery to support live list, single upload, bulk upload, refresh, and delete.
- Updated public gallery page to render live `/gallery` API records.

## Migration Execution Log

```text
node apps/api/scripts/run-supabase-migration.mjs
{"migrated":true,"tables":["contact_info","contact_messages","event_registrations","events","gallery_images","team_members"]}
```

## Connectivity Verification

```text
node apps/api/scripts/verify-supabase.mjs
{"connected":true,"counts":{"gallery_images":0,"events":0,"event_registrations":0,"team_members":0}}
```

## Notes

- Supabase Free is now the database target for Phase A.
- Cloudinary remains the media storage target.
- Secrets are present only in local env files and are intentionally not repeated in this report.
- Existing orphaned Cloudinary assets from earlier failed local-PostgreSQL verification may still exist.
