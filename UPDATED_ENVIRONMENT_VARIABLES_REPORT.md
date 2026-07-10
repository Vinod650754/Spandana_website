# Updated Environment Variables Report

Date: 2026-06-20

## API Environment

File: `apps/api/.env`

Required variables:

- `NODE_ENV`
- `PORT`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `DIRECT_URL`
- `DATABASE_SSL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `FRONTEND_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Current status:

- Supabase project URL configured.
- Supabase publishable/anon key configured.
- Supabase secret/service role key configured.
- Supabase transaction pooler `DATABASE_URL` configured.
- Supabase session pooler `DIRECT_URL` configured.
- `DATABASE_SSL=auto` configured.
- Cloudinary credentials remain configured.
- Admin JWT login credentials remain configured.

## Web Environment

File: `apps/web/.env.local`

Required variables:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Current status:

- API URL configured as local development API.
- Supabase public project URL configured.
- Supabase public key configured.

## Security Note

Do not commit real `.env` files to public source control. The `.env.example` files contain placeholders only.
