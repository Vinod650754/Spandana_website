# Supabase Migration Plan

Date: 2026-06-20

## Goal

Move Phase A storage from unavailable local PostgreSQL to Supabase Free while keeping Cloudinary as the image host. Phase B remains blocked until Phase A verification passes.

## Files Requiring Migration

- `apps/api/src/config/env.ts` - add Supabase and direct migration env configuration.
- `apps/api/src/db/pool.ts` - connect to Supabase pooler and enable SSL for Supabase.
- `apps/api/src/modules/gallery/gallery.routes.ts` - verify gallery metadata reads/writes/deletes use Supabase-backed query layer and clean up Cloudinary on failed DB writes.
- `apps/api/src/modules/events/events.routes.ts` - continues using the shared Supabase-backed query layer.
- `apps/api/src/modules/team/team.routes.ts` - continues using the shared Supabase-backed query layer.
- `apps/api/src/modules/contact/contact.routes.ts` and `apps/api/src/modules/registrations/registrations.routes.ts` - future admin data paths should persist to Supabase instead of demo-only responses.
- `apps/web/src/app/admin/login/page.tsx` - must authenticate against `/auth/login` and store the JWT.
- `apps/web/src/components/admin/gallery-uploader.tsx` - must support single upload, bulk upload, list, and delete using live API data.
- `apps/web/src/app/gallery/page.tsx` - must render live gallery records from Supabase through the API.
- `apps/web/src/app/admin/dashboard/page.tsx` - should read live admin metrics from `/analytics/dashboard`.
- `apps/api/.env`, `apps/api/.env.example`, `apps/web/.env.local`, `apps/web/.env.example` - must document Supabase env vars.
- `db/migrations/002_supabase_init.sql` - Supabase-compatible schema migration.

## Required Environment Variables

API:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL` - Supabase transaction-mode pooler for API traffic.
- `DIRECT_URL` - Supabase session-mode pooler for migrations.
- `DATABASE_SSL=auto`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `FRONTEND_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Web:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## SQL Migration

Run `db/migrations/002_supabase_init.sql` against `DIRECT_URL`. It creates the existing Phase A tables using `gen_random_uuid()` from `pgcrypto`, adds a useful gallery index, keeps the existing JSONB fields, and adds `contact_messages` plus `team_members.cloudinary_public_id` for better media cleanup support.

## Migration Steps

1. Configure API env with Supabase URL, keys, `DATABASE_URL`, and `DIRECT_URL`.
2. Configure web env with API URL and Supabase public values.
3. Apply `db/migrations/002_supabase_init.sql` using `DIRECT_URL`.
4. Restart the API so its `pg` pool connects to the Supabase transaction pooler.
5. Restart/rebuild the web app so public env vars are available.
6. Verify `/health`, `/auth/login`, and `/gallery`.
7. Upload one image through admin UI/API, confirm Cloudinary asset and Supabase row.
8. Confirm `/gallery` API returns the uploaded row and public `/gallery` renders it.
9. Bulk upload two images and confirm two Supabase rows.
10. Delete one uploaded image and confirm the Supabase row is removed and Cloudinary destroy succeeds.
11. Verify admin dashboard auth and metrics.

## Risks And Breaking Changes

- Supabase pooler requires SSL from local development; local no-SSL assumptions will fail.
- Transaction pooler should be used for API traffic; session pooler/direct URL should be used for migrations.
- Existing failed uploads may have left Cloudinary assets without database rows.
- The current API uploads to Cloudinary before DB insert; if DB insert fails, the API must clean up the uploaded Cloudinary asset.
- Static frontend pages can hide backend failures unless they are switched to live API data.
- Supabase Free limits apply for storage, database size, idle behavior, and connection limits.
- Secrets must not be committed to public source control.
