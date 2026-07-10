import { Router } from "express";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import { requireAdmin } from "../../middleware/auth.js";
import { uploadImage, deleteImage, type CloudinaryUploadResult } from "../../utils/cloudinary.js";
import { query } from "../../db/pool.js";

export const galleryRouter = Router();

const upload = multer({ storage: multer.memoryStorage() });

const uploadSchema = z.object({
  title: z.string().min(2),
  category: z.string().min(2),
  caption: z.string().optional(),
});

galleryRouter.get("/", async (_request, response) => {
  try {
    const result = await query("select * from gallery_images order by sort_order asc, created_at desc");
    response.json({ data: result.rows });
  } catch (error) {
    response.status(500).json({ message: "Failed to fetch gallery images." });
  }
});

galleryRouter.post("/upload", requireAdmin, upload.single("image"), async (request, response) => {
  if (!request.file) {
    return response.status(400).json({ message: "No image file provided." });
  }

  const body = uploadSchema.safeParse(request.body);
  if (!body.success) {
    return response.status(400).json({ message: "Invalid upload metadata.", issues: body.error.flatten() });
  }

  let cloudinaryResult: CloudinaryUploadResult | null = null;

  try {
    cloudinaryResult = await uploadImage(request.file.buffer, uuidv4(), "gallery");
    const imageId = uuidv4();

    await query(
      `insert into gallery_images (id, title, caption, category, image_url, cloudinary_public_id, width, height, featured, sort_order)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [imageId, body.data.title, body.data.caption, body.data.category, cloudinaryResult.secure_url, cloudinaryResult.public_id, cloudinaryResult.width, cloudinaryResult.height, false, 0]
    );

    response.status(201).json({
      message: "Image uploaded successfully.",
      data: {
        id: imageId,
        title: body.data.title,
        image_url: cloudinaryResult.secure_url,
        cloudinary_public_id: cloudinaryResult.public_id,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    if (cloudinaryResult?.public_id) {
      await deleteImage(cloudinaryResult.public_id).catch((cleanupError) => {
        console.error("Cloudinary cleanup after failed upload insert:", cleanupError);
      });
    }
    response.status(500).json({ message: "Failed to upload image." });
  }
});

galleryRouter.post("/bulk-upload", requireAdmin, upload.array("images", 50), async (request, response) => {
  if (!request.files || request.files.length === 0) {
    return response.status(400).json({ message: "No image files provided." });
  }

  const category = request.body.category || "uncategorized";
  const cloudinaryUploads: CloudinaryUploadResult[] = [];

  try {
    const uploadedImages = [];

    for (const file of request.files as Express.Multer.File[]) {
      const cloudinaryResult = await uploadImage(file.buffer, uuidv4(), "gallery");
      cloudinaryUploads.push(cloudinaryResult);
      const imageId = uuidv4();

      await query(
        `insert into gallery_images (id, title, caption, category, image_url, cloudinary_public_id, width, height, featured, sort_order)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [imageId, file.originalname, "", category, cloudinaryResult.secure_url, cloudinaryResult.public_id, cloudinaryResult.width, cloudinaryResult.height, false, 0]
      );

      uploadedImages.push({
        id: imageId,
        title: file.originalname,
        image_url: cloudinaryResult.secure_url,
      });
    }

    response.status(201).json({
      message: `Successfully uploaded ${uploadedImages.length} images.`,
      data: uploadedImages,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    await Promise.allSettled(cloudinaryUploads.map((image) => deleteImage(image.public_id)));
    response.status(500).json({ message: "Failed to upload some images." });
  }
});

galleryRouter.delete("/:id", requireAdmin, async (request, response) => {
  try {
    const imageResult = await query("select cloudinary_public_id from gallery_images where id = $1", [request.params.id]);

    if (imageResult.rows.length === 0) {
      return response.status(404).json({ message: "Image not found." });
    }

    const publicId = imageResult.rows[0].cloudinary_public_id;
    if (publicId) {
      await deleteImage(publicId);
    }
    await query("delete from gallery_images where id = $1", [request.params.id]);

    response.json({ message: "Image deleted successfully." });
  } catch (error) {
    response.status(500).json({ message: "Failed to delete image." });
  }
});

galleryRouter.put("/:id/reorder", requireAdmin, async (request, response) => {
  const { sortOrder } = request.body;

  try {
    await query("update gallery_images set sort_order = $1 where id = $2", [sortOrder, request.params.id]);
    response.json({ message: "Image reordered successfully." });
  } catch (error) {
    response.status(500).json({ message: "Failed to reorder image." });
  }
});

galleryRouter.put("/:id/tag", requireAdmin, async (request, response) => {
  const { category, featured } = request.body;

  try {
    await query("update gallery_images set category = $1, featured = $2 where id = $3", [category, featured ?? false, request.params.id]);
    response.json({ message: "Image tagged successfully." });
  } catch (error) {
    response.status(500).json({ message: "Failed to tag image." });
  }
});
