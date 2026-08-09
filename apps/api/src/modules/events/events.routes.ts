import { Router, type Request, type Response } from "express";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import { query } from "../../db/pool.js";
import { requireAdmin } from "../../middleware/auth.js";
import { deleteImage, uploadImage } from "../../utils/cloudinary.js";
import {
  eventSchema,
  normalizeEventRow,
  slugifyEventTitle,
  toNullableText,
  type EventImage,
  type EventRow,
} from "./events.shared.js";

export const eventRouter = Router();

const upload = multer({ storage: multer.memoryStorage() });

function parseGalleryImages(value: unknown): EventImage[] {
  if (Array.isArray(value)) {
    return value as EventImage[];
  }

  if (typeof value === "string" && value.trim().length > 0) {
    try {
      return JSON.parse(value) as EventImage[];
    } catch {
      return [];
    }
  }

  return [];
}

async function uploadEventFiles(fileList: Express.Multer.File[] | undefined, folder: string) {
  const uploadedFiles: EventImage[] = [];
  if (!fileList || fileList.length === 0) {
    return uploadedFiles;
  }

  for (const file of fileList) {
    const cloudinaryResult = await uploadImage(file.buffer, uuidv4(), folder);
    uploadedFiles.push({
      url: cloudinaryResult.secure_url,
      public_id: cloudinaryResult.public_id,
      uploaded_at: new Date().toISOString(),
    });
  }

  return uploadedFiles;
}

function normalizeEventOrder(eventA: { featured: boolean; eventDate: string; displayOrder: number; title: string }, eventB: { featured: boolean; eventDate: string; displayOrder: number; title: string }) {
  if (eventA.featured !== eventB.featured) {
    return eventA.featured ? -1 : 1;
  }

  const dateDiff = new Date(eventA.eventDate).getTime() - new Date(eventB.eventDate).getTime();
  if (dateDiff !== 0) {
    return dateDiff;
  }

  if (eventA.displayOrder !== eventB.displayOrder) {
    return eventA.displayOrder - eventB.displayOrder;
  }

  return eventA.title.localeCompare(eventB.title);
}

eventRouter.get("/", async (_request, response) => {
  try {
    const result = await query<EventRow>(
      `select id, title, slug, short_description, description, category, venue, event_date, start_time, end_time, cover_image, cover_image_public_id, gallery_images, registration_link, featured, status, display_order, created_at, updated_at
       from events
       where status = 'published'
       order by featured desc, event_date asc, display_order asc, created_at desc`
    );

    response.json({ data: result.rows.map(normalizeEventRow) });
  } catch {
    response.status(500).json({ message: "Failed to fetch events." });
  }
});

eventRouter.get("/manage", requireAdmin, async (_request, response) => {
  try {
    const result = await query<EventRow>(
      `select id, title, slug, short_description, description, category, venue, event_date, start_time, end_time, cover_image, cover_image_public_id, gallery_images, registration_link, featured, status, display_order, created_at, updated_at
       from events
       order by case status when 'published' then 1 when 'draft' then 2 else 3 end, featured desc, event_date desc, display_order asc, created_at desc`
    );

    response.json({ data: result.rows.map(normalizeEventRow) });
  } catch {
    response.status(500).json({ message: "Failed to fetch events." });
  }
});

eventRouter.get("/:slug", async (request, response) => {
  try {
    const result = await query<EventRow>(
      `select id, title, slug, short_description, description, category, venue, event_date, start_time, end_time, cover_image, cover_image_public_id, gallery_images, registration_link, featured, status, display_order, created_at, updated_at
       from events
       where slug = $1 and status = 'published'
       limit 1`,
      [request.params.slug]
    );

    if (result.rows.length === 0) {
      return response.status(404).json({ message: "Event not found." });
    }

    response.json({ data: normalizeEventRow(result.rows[0]) });
  } catch {
    response.status(500).json({ message: "Failed to fetch event." });
  }
});

eventRouter.post(
  "/",
  requireAdmin,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 20 },
  ]),
  async (request, response) => {
    const body = eventSchema.safeParse(request.body);
    if (!body.success) {
      return response.status(400).json({ message: "Invalid event payload.", issues: body.error.flatten() });
    }

    const files = request.files as Record<string, Express.Multer.File[]> | undefined;
    const coverImageFile = files?.coverImage?.[0];

    if (!coverImageFile) {
      return response.status(400).json({ message: "Cover image is required." });
    }

    let coverImagePublicId: string | null = null;
    const uploadedGalleryImages: EventImage[] = [];

    try {
      const eventId = uuidv4();
      const slug = body.data.slug?.trim() || slugifyEventTitle(body.data.title);
      const coverImage = await uploadImage(coverImageFile.buffer, uuidv4(), "events");
      coverImagePublicId = coverImage.public_id;

      uploadedGalleryImages.push(...(await uploadEventFiles(files?.galleryImages, "events")));

      const result = await query<EventRow>(
        `insert into events (
          id,
          title,
          slug,
          short_description,
          description,
          category,
          venue,
          event_date,
          start_time,
          end_time,
          cover_image,
          cover_image_public_id,
          gallery_images,
          registration_link,
          featured,
          status,
          display_order
        )
         values ($1, $2, $3, $4, $5, $6, $7, $8, nullif($9, ''), nullif($10, ''), $11, $12, $13, $14, $15, $16, $17)
         returning id, title, slug, short_description, description, category, venue, event_date, start_time, end_time, cover_image, cover_image_public_id, gallery_images, registration_link, featured, status, display_order, created_at, updated_at`,
        [
          eventId,
          body.data.title,
          slug,
          toNullableText(body.data.shortDescription),
          body.data.description,
          body.data.category,
          body.data.venue,
          body.data.eventDate,
          body.data.startTime ?? "",
          body.data.endTime ?? "",
          coverImage.secure_url,
          coverImage.public_id,
          JSON.stringify(uploadedGalleryImages),
          toNullableText(body.data.registrationLink),
          body.data.featured,
          body.data.status,
          body.data.displayOrder,
        ]
      );

      response.status(201).json({ message: "Event created successfully.", data: normalizeEventRow(result.rows[0]) });
    } catch (error) {
      console.error("Create event error:", error);
      if (coverImagePublicId) {
        await deleteImage(coverImagePublicId).catch(() => undefined);
      }
      await Promise.allSettled(uploadedGalleryImages.map((image) => deleteImage(image.public_id)));
      response.status(500).json({ message: "Failed to create event." });
    }
  }
);

eventRouter.put(
  "/:id",
  requireAdmin,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 20 },
  ]),
  async (request, response) => {
    const body = eventSchema.safeParse(request.body);
    if (!body.success) {
      return response.status(400).json({ message: "Invalid event payload.", issues: body.error.flatten() });
    }

    const files = request.files as Record<string, Express.Multer.File[]> | undefined;
    const coverImageFile = files?.coverImage?.[0];

    let newCoverImagePublicId: string | null = null;
    const uploadedGalleryImages: EventImage[] = [];

    try {
      const existingResult = await query<EventRow>(
        `select id, cover_image, cover_image_public_id, gallery_images
         from events
         where id = $1
         limit 1`,
        [request.params.id]
      );

      if (existingResult.rows.length === 0) {
        return response.status(404).json({ message: "Event not found." });
      }

      const existing = existingResult.rows[0];
      let nextCoverImage = existing.cover_image;
      let nextCoverImagePublicId = existing.cover_image_public_id;
      const nextGalleryImages = parseGalleryImages(existing.gallery_images);

      if (coverImageFile) {
        const coverImage = await uploadImage(coverImageFile.buffer, uuidv4(), "events");
        newCoverImagePublicId = coverImage.public_id;
        nextCoverImage = coverImage.secure_url;
        nextCoverImagePublicId = coverImage.public_id;
      }

      const appendedGalleryImages = await uploadEventFiles(files?.galleryImages, "events");
      uploadedGalleryImages.push(...appendedGalleryImages);
      nextGalleryImages.push(...appendedGalleryImages);

      const slug = body.data.slug?.trim() || slugifyEventTitle(body.data.title);

      const result = await query<EventRow>(
        `update events
         set title = $1,
             slug = $2,
             short_description = $3,
             description = $4,
             category = $5,
             venue = $6,
             event_date = $7,
             start_time = nullif($8, ''),
             end_time = nullif($9, ''),
             cover_image = $10,
             cover_image_public_id = $11,
             gallery_images = $12,
             registration_link = $13,
             featured = $14,
             status = $15,
             display_order = $16,
             updated_at = now()
         where id = $17
         returning id, title, slug, short_description, description, category, venue, event_date, start_time, end_time, cover_image, cover_image_public_id, gallery_images, registration_link, featured, status, display_order, created_at, updated_at`,
        [
          body.data.title,
          slug,
          toNullableText(body.data.shortDescription),
          body.data.description,
          body.data.category,
          body.data.venue,
          body.data.eventDate,
          body.data.startTime ?? "",
          body.data.endTime ?? "",
          nextCoverImage,
          nextCoverImagePublicId,
          JSON.stringify(nextGalleryImages),
          toNullableText(body.data.registrationLink),
          body.data.featured,
          body.data.status,
          body.data.displayOrder,
          request.params.id,
        ]
      );

      if (coverImageFile && existing.cover_image_public_id) {
        await deleteImage(existing.cover_image_public_id).catch(() => undefined);
      }

      response.json({ message: "Event updated successfully.", data: normalizeEventRow(result.rows[0]) });
    } catch (error) {
      if (newCoverImagePublicId) {
        await deleteImage(newCoverImagePublicId).catch(() => undefined);
      }
      await Promise.allSettled(uploadedGalleryImages.map((image) => deleteImage(image.public_id)));
      response.status(500).json({ message: "Failed to update event." });
    }
  }
);

eventRouter.delete("/:id", requireAdmin, async (request, response) => {
  try {
    const existingResult = await query<EventRow>(
      `select cover_image_public_id, gallery_images
       from events
       where id = $1
       limit 1`,
      [request.params.id]
    );

    if (existingResult.rows.length === 0) {
      return response.status(404).json({ message: "Event not found." });
    }

    const existing = existingResult.rows[0];
    const galleryImages = parseGalleryImages(existing.gallery_images);

    await query("delete from events where id = $1", [request.params.id]);

    if (existing.cover_image_public_id) {
      await deleteImage(existing.cover_image_public_id).catch(() => undefined);
    }

    await Promise.allSettled(galleryImages.map((image) => deleteImage(image.public_id)));

    response.status(204).send();
  } catch {
    response.status(500).json({ message: "Failed to delete event." });
  }
});

async function updateEventStatus(request: Request, response: Response, status: "draft" | "published" | "archived") {
  const result = await query<EventRow>(
    `update events
     set status = $1,
         updated_at = now()
     where id = $2
     returning id, title, slug, short_description, description, category, venue, event_date, start_time, end_time, cover_image, cover_image_public_id, gallery_images, registration_link, featured, status, display_order, created_at, updated_at`,
    [status, request.params.id]
  );

  if (result.rows.length === 0) {
    response.status(404).json({ message: "Event not found." });
    return;
  }

  response.json({ message: `Event ${status} successfully.`, data: normalizeEventRow(result.rows[0]) });
}

eventRouter.post("/:id/publish", requireAdmin, async (request, response) => {
  try {
    await updateEventStatus(request, response, "published");
  } catch {
    response.status(500).json({ message: "Failed to publish event." });
  }
});

eventRouter.post("/:id/archive", requireAdmin, async (request, response) => {
  try {
    await updateEventStatus(request, response, "archived");
  } catch {
    response.status(500).json({ message: "Failed to archive event." });
  }
});

eventRouter.post("/:id/draft", requireAdmin, async (request, response) => {
  try {
    await updateEventStatus(request, response, "draft");
  } catch {
    response.status(500).json({ message: "Failed to mark event as draft." });
  }
});

eventRouter.post("/:id/cover", requireAdmin, upload.single("coverImage"), async (request, response) => {
  try {
    if (!request.file) {
      return response.status(400).json({ message: "Cover image file is required." });
    }

    const existingResult = await query<EventRow>(
      `select id, title, slug, short_description, description, category, venue, event_date, start_time, end_time, cover_image, cover_image_public_id, gallery_images, registration_link, featured, status, display_order, created_at, updated_at
       from events
       where id = $1
       limit 1`,
      [request.params.id]
    );

    if (existingResult.rows.length === 0) {
      return response.status(404).json({ message: "Event not found." });
    }

    const existing = existingResult.rows[0];
    const newCover = await uploadImage(request.file.buffer, uuidv4(), "events");

    const result = await query<EventRow>(
      `update events
       set cover_image = $1,
           cover_image_public_id = $2,
           updated_at = now()
       where id = $3
       returning id, title, slug, short_description, description, category, venue, event_date, start_time, end_time, cover_image, cover_image_public_id, gallery_images, registration_link, featured, status, display_order, created_at, updated_at`,
      [newCover.secure_url, newCover.public_id, request.params.id]
    );

    if (existing.cover_image_public_id) {
      await deleteImage(existing.cover_image_public_id).catch(() => undefined);
    }

    response.status(201).json({ message: "Event cover updated successfully.", data: normalizeEventRow(result.rows[0]) });
  } catch (error) {
    response.status(500).json({ message: "Failed to update event cover image." });
  }
});

eventRouter.post("/:id/gallery", requireAdmin, upload.array("galleryImages", 20), async (request, response) => {
  try {
    const existingResult = await query<EventRow>(
      `select id, gallery_images
       from events
       where id = $1
       limit 1`,
      [request.params.id]
    );

    if (existingResult.rows.length === 0) {
      return response.status(404).json({ message: "Event not found." });
    }

    if (!request.files || request.files.length === 0) {
      return response.status(400).json({ message: "No gallery image files provided." });
    }

    const event = existingResult.rows[0];
    const galleryImages = parseGalleryImages(event.gallery_images);
    const uploadedImages = await uploadEventFiles(request.files as Express.Multer.File[], "events");
    galleryImages.push(...uploadedImages);

    const result = await query<EventRow>(
      `update events
       set gallery_images = $1,
           updated_at = now()
       where id = $2
       returning id, title, slug, short_description, description, category, venue, event_date, start_time, end_time, cover_image, cover_image_public_id, gallery_images, registration_link, featured, status, display_order, created_at, updated_at`,
      [JSON.stringify(galleryImages), request.params.id]
    );

    response.status(201).json({ message: `Added ${uploadedImages.length} images to event gallery.`, data: normalizeEventRow(result.rows[0]) });
  } catch (error) {
    console.error("Event gallery upload error:", error);
    response.status(500).json({ message: "Failed to upload event gallery images." });
  }
});
