# Spandana

Premium full-stack website for Spandana, the Social Outreach Club of Sir M Visvesvaraya Institute of Technology.

## Structure

- `apps/web` - Next.js 15 frontend
- `apps/api` - Express.js API
- `db/migrations` - PostgreSQL schema

## Run

1. Install dependencies in the root and each app.
2. Set environment variables from the sample files.
3. Run `npm run dev` from the repository root.

## Notes

- Public pages do not expose authentication UI.
- Admin functionality lives under `/admin` in the web app and JWT-protected routes in the API.
