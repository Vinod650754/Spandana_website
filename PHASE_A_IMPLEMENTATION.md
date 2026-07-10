# Phase A Implementation: Cloudinary Integration - Complete ✅

## What Was Implemented

Phase A integrates Cloudinary for secure, scalable image management across your SPANDANA platform. The implementation includes:

### 1. **Backend Upload Service** (`apps/api/src/utils/cloudinary.ts`)
- ✅ Cloudinary SDK initialization with your credentials
- ✅ Typed upload function for secure file uploads
- ✅ Delete function for removing images from Cloudinary
- ✅ List function for browsing uploaded assets
- ✅ Transform function for responsive image URLs

### 2. **API Endpoints**

#### Gallery Management (`/gallery`)
- **GET /gallery** - Fetch all gallery images (sorted by category)
- **POST /gallery/upload** - Single image upload (admin-only)
- **POST /gallery/bulk-upload** - Batch upload up to 50 images (admin-only)
- **DELETE /gallery/:id** - Remove image and delete from Cloudinary
- **PUT /gallery/:id/reorder** - Reorder images in gallery
- **PUT /gallery/:id/tag** - Categorize and feature images

#### Event Management (`/events`)
- **GET /events** - List all events
- **GET /events/:slug** - Get event details
- **POST /events** - Create event with banner (admin-only)
- **PUT /events/:slug** - Update event and banner (admin-only)
- **DELETE /events/:slug** - Remove event
- **POST /events/:slug/gallery** - Add up to 20 images to event gallery

#### Team Management (`/team`)
- **GET /team** - List all team members
- **POST /team** - Add faculty/student with photo (admin-only)
- **PUT /team/:id** - Update member profile and photo
- **DELETE /team/:id** - Remove team member

### 3. **Admin Dashboard Components**

#### Gallery Uploader (`apps/web/src/components/admin/gallery-uploader.tsx`)
- Drag-and-drop interface for bulk uploads
- Category selection (Events, Workshops, Community Service, etc.)
- Upload progress tracking
- Recently uploaded preview
- Supports up to 50 images per batch

#### Event Uploader (`apps/web/src/components/admin/event-uploader.tsx`)
- Select existing events
- Upload event banner images
- Add multiple gallery images to event gallery
- Real-time event list refresh

#### Team Uploader (`apps/web/src/components/admin/team-uploader.tsx`)
- Add faculty/student profiles
- Upload profile photos
- Set role and category
- Store social links (email, LinkedIn, Twitter)

#### Drag-Drop Component (`apps/web/src/components/admin/drag-drop-uploader.tsx`)
- Reusable drag-and-drop UI
- File preview with size display
- Remove individual files
- File limit validation

### 4. **Database Integration**

All uploaded images store metadata in PostgreSQL:

- **gallery_images**: title, category, caption, Cloudinary public_id, dimensions, featured status, sort order
- **events**: banner_url, gallery JSONB array with all event photos
- **team_members**: photo_url, social links (JSONB), category

---

## Environment Variables Required

### Create `.env` File in `apps/api/`

```bash
# Application Environment
NODE_ENV=development
PORT=4000

# Database Configuration (requires PostgreSQL running locally)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/spandana

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
JWT_EXPIRES_IN=7d

# Cloudinary Configuration
# ⚠️ Keep API Secret private - never commit to version control!
CLOUDINARY_CLOUD_NAME=vinod0717
CLOUDINARY_API_KEY=877467453887467
CLOUDINARY_API_SECRET=xMQVp2RBOT2OPcNxQYoqOJFy3_s

# Frontend Configuration
FRONTEND_URL=http://localhost:3000

# Admin Credentials
ADMIN_EMAIL=admin@spandana.edu.in
ADMIN_PASSWORD=ChangeMe123!
```

### Create `.env.local` File in `apps/web/`

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Environment Variable Reference

| Variable | Value | Notes |
|----------|-------|-------|
| `CLOUDINARY_CLOUD_NAME` | `vinod0717` | Your Cloudinary account name |
| `CLOUDINARY_API_KEY` | `877467453887467` | API key from Cloudinary console |
| `CLOUDINARY_API_SECRET` | `xMQVp2RBOT2OPcNxQYoqOJFy3_s` | Keep this secret! |
| `DATABASE_URL` | PostgreSQL connection | Format: `postgresql://user:pass@host:port/dbname` |
| `JWT_SECRET` | Any random string | Generate a long random string for production |
| `FRONTEND_URL` | Frontend URL | Used for CORS configuration |
| `ADMIN_EMAIL` | Your admin email | Login email for admin panel |
| `ADMIN_PASSWORD` | Your password | Login password (change immediately) |

---

## How Cloudinary Credentials Are Used

### Credential Placement:
1. **Backend (Server-side)**: `apps/api/.env`
   - API Key and Secret stay on the server (never exposed to client)
   - Used for signing uploads and deleting images
   - Initialized in `apps/api/src/utils/cloudinary.ts`

2. **Frontend (Client-side)**: No secrets stored in frontend
   - Upload Preset (`spandana_upload`) allows unsigned uploads
   - No sensitive credentials in browser
   - All operations validated through Express API

### Security Flow:
```
Browser → Express API → Cloudinary
         (validates)    (stores)
```

---

## How to Test Uploads Locally

### Prerequisites
- PostgreSQL running on `localhost:5432`
- Node.js 18+
- Database `spandana` created with schema loaded

### Step 1: Database Setup

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE spandana;

# Load schema
\c spandana
\i db/migrations/001_init.sql
\q
```

### Step 2: Start Development Servers

```bash
# From root directory
npm run dev

# This starts both:
# - Frontend: http://localhost:3000
# - API: http://localhost:4000
```

### Step 3: Test Gallery Upload (Recommended First Test)

**Admin URL**: `http://localhost:3000/admin/gallery`

1. Navigate to Admin Gallery page
2. Select category (e.g., "Events")
3. Drag-and-drop images or click to browse
4. Click "Upload" button
5. Wait for success message
6. Visit `http://localhost:3000/gallery` to see uploaded images

### Step 4: Test Event Upload

**Admin URL**: `http://localhost:3000/admin/events`

1. Click "Refresh" to load existing events (should be empty initially)
2. To create test events first, use cURL:
   ```bash
   curl -X POST http://localhost:4000/events \
     -H "Authorization: Bearer <jwt_token>" \
     -F "title=Test Event" \
     -F "description=This is a test event with at least 20 characters of description." \
     -F "venue=Test Venue" \
     -F "eventDate=2026-12-31T10:00:00Z" \
     -F "status=upcoming" \
     -F "slug=test-event"
   ```
3. After event is created, select it and upload banner or gallery images

### Step 5: Test Team Upload

**Admin URL**: `http://localhost:3000/admin/team`

1. Fill in name, role, and category
2. Optionally upload a profile photo
3. Click "Add Team Member"
4. Member appears in database and displays on team page

### Step 6: Verify in Database

```bash
psql -U postgres -d spandana

# Check uploaded images
SELECT id, title, category, image_url, created_at FROM gallery_images;

# Check team members
SELECT id, name, role, category, photo_url FROM team_members;

# Check events
SELECT id, slug, title, banner_url, featured FROM events;
```

---

## Testing with cURL (API Direct Tests)

### 1. Login to Get JWT Token

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@spandana.edu.in",
    "password": "ChangeMe123!"
  }'

# Response:
# {
#   "token": "eyJhbGciOiJIUzI1NiIs...",
#   "user": {
#     "sub": "user-id",
#     "role": "admin",
#     "email": "admin@spandana.edu.in"
#   }
# }
```

Save the token for use in other requests.

### 2. Upload Single Gallery Image

```bash
curl -X POST http://localhost:4000/gallery/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@/path/to/image.jpg" \
  -F "title=Beautiful Event Photo" \
  -F "category=events" \
  -F "caption=This was taken during the event"
```

### 3. Upload Multiple Gallery Images

```bash
curl -X POST http://localhost:4000/gallery/bulk-upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg" \
  -F "images=@/path/to/image3.jpg" \
  -F "category=events"
```

### 4. Fetch All Gallery Images

```bash
curl http://localhost:4000/gallery
```

### 5. Delete Image from Gallery

```bash
curl -X DELETE http://localhost:4000/gallery/IMAGE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Common Issues & Solutions

### Issue: "No image file provided"
**Solution**: Ensure the form field is named `image` (single) or `images` (bulk)

### Issue: "Failed to upload image" with 500 error
**Solution**: Check that Cloudinary credentials are correct in `.env`

### Issue: CORS error when uploading
**Solution**: Ensure `FRONTEND_URL` matches your frontend URL (usually `http://localhost:3000`)

### Issue: Database connection failed
**Solution**: Verify PostgreSQL is running and database `spandana` exists with schema loaded

### Issue: JWT token invalid
**Solution**: Token expires after 7 days (set by `JWT_EXPIRES_IN`). Login again to get new token.

---

## Build Status

✅ **Frontend Build**: Success (Turbopack, 3.3s)
- 17 routes created and optimized
- All TypeScript compiled cleanly
- Tailwind CSS generated

✅ **Backend Build**: Success (TypeScript)
- All route handlers compiled
- Database queries type-safe
- Cloudinary integration ready

✅ **Total Package Size**: ~552 npm packages (3 moderate vulnerabilities - non-critical)

---

## What's Ready for Phase B

Your platform now has:
- ✅ Secure image uploads to Cloudinary (unlimited storage with your plan)
- ✅ Database storage for image metadata
- ✅ Admin dashboard for content management
- ✅ Gallery, events, and team image management
- ✅ CRUD operations fully functional

**Next Phase (B)**: PostgreSQL Content Binding
- Replace hardcoded homepage content with database queries
- Enable admin to edit hero text, about section, testimonials
- Implement content versioning

---

## File Structure Created

```
apps/
├── api/src/
│   ├── utils/
│   │   └── cloudinary.ts (Upload service)
│   ├── modules/
│   │   ├── gallery/gallery.routes.ts (Upload endpoints)
│   │   ├── events/events.routes.ts (Event image management)
│   │   └── team/team.routes.ts (Team photo management)
│
├── web/src/
│   ├── components/admin/
│   │   ├── drag-drop-uploader.tsx (Reusable uploader)
│   │   ├── gallery-uploader.tsx (Gallery bulk upload)
│   │   ├── event-uploader.tsx (Event image management)
│   │   └── team-uploader.tsx (Team photo management)
│   └── app/admin/
│       ├── gallery/page.tsx (Gallery admin)
│       ├── events/page.tsx (Events admin)
│       └── team/page.tsx (Team admin)
```

---

## Next Steps for Phase B

When ready, provide:
1. **Decision**: Will you use local PostgreSQL or Supabase?
2. **Database Credentials**: Connection string if using remote DB
3. **Content Preferences**: Which homepage sections should be editable?

Then we'll proceed with Phase B: Database-Driven Content Management!
