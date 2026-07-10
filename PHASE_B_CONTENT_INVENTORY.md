# Phase B Content Inventory

Date: 2026-06-21

## Summary

Phase A gallery, Cloudinary upload, Supabase metadata, and admin auth are verified. Phase B now needs to convert remaining static public content and placeholder admin surfaces into Supabase-driven CMS content.

## Already Database-Backed

- Gallery page: `apps/web/src/app/gallery/page.tsx` reads `/gallery`.
- Admin gallery: `apps/web/src/components/admin/gallery-uploader.tsx` lists, uploads, bulk uploads, and deletes via `/gallery`.
- Team creation API: `apps/api/src/modules/team/team.routes.ts` writes to `team_members`.
- Event creation API: `apps/api/src/modules/events/events.routes.ts` writes to `events`.
- Contact messages API: `apps/api/src/modules/contact/contact.routes.ts` writes to `contact_messages`.
- Registrations API: `apps/api/src/modules/registrations/registrations.routes.ts` writes to `event_registrations`.
- Dashboard metrics API: `apps/api/src/modules/analytics/analytics.routes.ts` reads Supabase counts.

## Placeholder Content Still Present

### Global Layout And Navigation

- `apps/web/src/app/layout.tsx`
  - Static meta title: `SPANDANA | Social Outreach Club of SMVIT`
  - Static meta description.
- `apps/web/src/data/site.ts`
  - Static navigation labels and routes.
- `apps/web/src/components/layout/site-shell.tsx`
  - Static footer brand copy.
  - Static contact CTA.

### Homepage

- `apps/web/src/components/sections/home-page.tsx`
  - Static hero badge: `Social Outreach Club of SMVIT`
  - Static hero title: `SPANDANA`
  - Static subtitle: `Social Outreach Club`
  - Static rotating lines from `heroRotatingLines`
  - Static hero body copy.
  - Static buttons: `Explore Events`, `Join Us`
  - Static hero chips: `Blood Donation`, `Environmental Action`, `Education Outreach`
  - Static visual background/effect only, not CMS-controlled media.
  - Static impact counters from `impactStats`: `5000+`, `150+`, `800+`, `20+`
  - Static About Preview heading/description and cards from `aboutPreview`
  - Static Featured Events section heading/description, while event cards still use `featuredEvents`
  - Static Gallery preview still uses old `galleryItems` from `site.ts`, not live `/gallery`
  - Static testimonials from `testimonials`
  - Static team preview from `teamMembers`
  - Static contact CTA and contact values.

### About Page

- `apps/web/src/app/about/page.tsx`
  - Static page heading and description.
  - Static mission, vision, objectives from `aboutPreview`
  - Static club history paragraph.
  - Static operating style paragraph.
  - Static timeline:
    - 2018 Club formation
    - 2021 Program expansion
    - 2024 Digital presence
    - 2026 Premium platform

### Contact Page

- `apps/web/src/app/contact/page.tsx`
  - Static page heading and description.
  - Static contact cards:
    - `spandana@smvit.edu.in`
    - `+91 90000 00000`
    - `Chat for volunteer updates`
    - `@spandana.smvit`
    - `Spandana Club`
    - `SMVIT Campus`
  - Contact form UI is not wired to POST `/contact/message`.
  - Submit button is a link, not a form action.
- `apps/api/src/modules/contact/contact.routes.ts`
  - `PUT /contact/details` returns a placeholder response and does not update `contact_info`.

### Team Page

- `apps/web/src/app/team/page.tsx`
  - Static page heading and description.
  - Static team cards from `teamMembers`.
  - Does not read `/team`.
- `apps/web/src/data/site.ts`
  - Placeholder people:
    - Dr. Meera Rao
    - Prof. Arun Bhat
    - Aditi Sharma
    - Karan Singh
  - Stock Unsplash profile photos.
- `apps/web/src/components/admin/team-uploader.tsx`
  - Can create team members, but cannot list, edit, delete, feature, reorder, or support `Core Members` as a separate category.

### Testimonials And Success Stories

- `apps/web/src/data/site.ts`
  - Placeholder testimonials:
    - Community Partner / NGO Field Coordinator
    - Student Volunteer / Event Lead
    - Faculty Coordinator / Advisor
- `apps/web/src/components/sections/home-page.tsx`
  - Success Stories section reads static testimonial data.
- No public testimonials page exists.
- No admin testimonial CMS exists.
- No dedicated testimonials table exists yet.

### Events

- `apps/web/src/app/events/page.tsx`
  - Static event list from `featuredEvents`.
- `apps/web/src/app/events/[slug]/page.tsx`
  - Static event detail lookup from `featuredEvents`.
  - Static event detail copy.
  - Static gallery count: `12 images`.
- `apps/web/src/data/site.ts`
  - Placeholder events:
    - Blood Donation Drive 2026
    - Tree Plantation Week
    - Education Drive: Learn and Lead
  - Stock Unsplash event images.
- `apps/web/src/components/admin/event-uploader.tsx`
  - Admin event tooling exists but needs live event list/edit/delete/status management polish.

### SEO

- `apps/web/src/app/layout.tsx`
  - Only global static metadata exists.
- No admin SEO UI exists.
- No `seo_metadata` table exists yet.
- No page-specific meta title, meta description, or Open Graph image management exists.

### Admin Settings

- `apps/web/src/app/admin/settings/page.tsx`
  - Placeholder cards only:
    - Homepage Content
    - Contact Details
    - Site Settings
    - SEO Metadata
  - No forms, API calls, or persistence.

### Admin Registrations

- `apps/web/src/app/admin/registrations/page.tsx`
  - Placeholder cards only:
    - Review New Signups
    - Export CSV
    - Approve Volunteers
    - Track Attendance
  - Export API exists, but UI is not wired to it.

### API Placeholder Routes

- `apps/api/src/modules/home/home.routes.ts`
  - Returns static hero and impact data instead of reading `homepage_content`.
- `apps/api/src/modules/contact/contact.routes.ts`
  - Contact details update route is placeholder.
- `apps/api/src/modules/analytics/analytics.routes.ts`
  - Counts are live, but recent uploads and recent activities are not implemented.

## CMS Data Model Needed

Existing tables to reuse:

- `homepage_content`
- `contact_info`
- `events`
- `gallery_images`
- `team_members`
- `event_registrations`
- `contact_messages`
- `site_settings`

New or expanded structures needed:

- Add `about_content` for intro, mission, vision, objectives, history, operating style, and timeline.
- Add `testimonials` for student, community, and success story entries.
- Add `seo_metadata` for per-page meta titles, descriptions, and Open Graph images.
- Add an activity log table for dashboard recent activities.
- Expand `team_members.category` to support `core` or introduce a separate `group` field.
- Add homepage sections/featured content support, either inside `homepage_content` JSONB or normalized tables.

## Recommended Implementation Order

1. Homepage CMS foundation:
   - Supabase schema for homepage content.
   - API read/update routes.
   - Admin settings form for hero, buttons, impact counters, and featured section copy.
   - Public homepage reads live CMS content with existing Vision Pro / ReactBits presentation.
2. Contact CMS:
   - API read/update `contact_info`.
   - Public contact page reads live details.
   - Admin contact form.
   - Wire public contact form to `/contact/message`.
3. About CMS:
   - Add `about_content`.
   - Admin editor.
   - Public About page reads live data.
4. Team CMS completion:
   - Public team page reads `/team`.
   - Admin list/edit/delete/reorder/feature.
   - Support Faculty Coordinators, Student Coordinators, Core Members.
5. Testimonials CMS:
   - Add testimonials table.
   - Admin list/create/edit/delete.
   - Homepage reads live testimonials.
6. SEO CMS:
   - Add SEO table/API.
   - Admin SEO editor.
   - Dynamic metadata per page.
7. Dashboard analytics expansion:
   - Add recent uploads and activity log.
   - Expand admin dashboard cards and activity feed.
