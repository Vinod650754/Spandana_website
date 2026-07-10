import { z } from "zod";

export const eventStatusSchema = z.enum(["draft", "published", "archived"]);

export const eventSchema = z.object({
  title: z.string().trim().min(2).max(180),
  slug: z.string().trim().min(2).max(220).optional().or(z.literal("")),
  shortDescription: z.string().trim().max(280).optional().or(z.literal("")),
  description: z.string().trim().min(20),
  category: z.string().trim().min(2).max(120),
  venue: z.string().trim().min(2).max(180),
  eventDate: z.string().datetime(),
  startTime: z.string().trim().optional().or(z.literal("")),
  endTime: z.string().trim().optional().or(z.literal("")),
  registrationLink: z.string().trim().url().optional().or(z.literal("")),
  featured: z.preprocess((value) => value === true || value === "true" || value === "1", z.boolean()).default(false),
  status: eventStatusSchema.default("draft"),
  displayOrder: z.coerce.number().int().nonnegative().default(0),
});

export type EventImage = {
  url: string;
  public_id: string;
  uploaded_at: string;
};

export type EventRow = {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string;
  category: string;
  venue: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  cover_image: string | null;
  cover_image_public_id: string | null;
  gallery_images: EventImage[] | string | null;
  registration_link: string | null;
  featured: boolean;
  status: "draft" | "published" | "archived";
  display_order: number;
  created_at: string;
  updated_at: string;
};

export function normalizeEventRow(row: EventRow) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    shortDescription: row.short_description,
    description: row.description,
    category: row.category,
    venue: row.venue,
    eventDate: row.event_date,
    startTime: row.start_time,
    endTime: row.end_time,
    coverImage: row.cover_image,
    coverImagePublicId: row.cover_image_public_id,
    galleryImages: Array.isArray(row.gallery_images)
      ? row.gallery_images
      : typeof row.gallery_images === "string"
        ? (JSON.parse(row.gallery_images || "[]") as EventImage[])
        : [],
    registrationLink: row.registration_link,
    featured: row.featured,
    status: row.status,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function slugifyEventTitle(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/["']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 220);
}

export function toNullableText(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
