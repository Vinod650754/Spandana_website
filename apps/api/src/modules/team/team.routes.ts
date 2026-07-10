import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import { query } from "../../db/pool.js";
import { requireAdmin } from "../../middleware/auth.js";
import { deleteImage, uploadImage } from "../../utils/cloudinary.js";
import {
  normalizeTeamMemberRow,
  teamMemberSchema,
  toNullableText,
  type TeamMemberRow,
} from "./team.shared.js";

export const teamRouter = Router();

const upload = multer({ storage: multer.memoryStorage() });

teamRouter.get("/", async (_request, response) => {
  try {
    const result = await query<TeamMemberRow>(
      `select
         m.id,
         m.name,
         m.role_id,
         r.name as role_name,
         r.display_order as role_display_order,
         r.is_active as role_is_active,
         m.department_id,
         d.name as department_name,
         d.display_order as department_display_order,
         d.is_active as department_is_active,
         m.academic_year,
         m.designation,
         m.email,
         m.linkedin,
         m.image_url,
         m.display_order,
         m.is_active,
         m.cloudinary_public_id,
         m.created_at,
         m.updated_at
       from team_members m
       join roles r on r.id = m.role_id
       join departments d on d.id = m.department_id
       where m.is_active = true
         and r.is_active = true
         and d.is_active = true
       order by r.display_order asc, r.name asc, d.display_order asc, d.name asc, m.display_order asc, m.created_at asc`
    );

    response.json({ data: result.rows.map(normalizeTeamMemberRow) });
  } catch {
    response.status(500).json({ message: "Failed to fetch team members." });
  }
});

teamRouter.get("/manage", requireAdmin, async (_request, response) => {
  try {
    const result = await query<TeamMemberRow>(
      `select
         m.id,
         m.name,
         m.role_id,
         r.name as role_name,
         r.display_order as role_display_order,
         r.is_active as role_is_active,
         m.department_id,
         d.name as department_name,
         d.display_order as department_display_order,
         d.is_active as department_is_active,
         m.academic_year,
         m.designation,
         m.email,
         m.linkedin,
         m.image_url,
         m.display_order,
         m.is_active,
         m.cloudinary_public_id,
         m.created_at,
         m.updated_at
       from team_members m
       left join roles r on r.id = m.role_id
       left join departments d on d.id = m.department_id
       order by coalesce(r.display_order, 999999) asc, coalesce(r.name, m.name) asc, coalesce(d.display_order, 999999) asc, coalesce(d.name, m.name) asc, m.display_order asc, m.created_at asc`
    );

    response.json({ data: result.rows.map(normalizeTeamMemberRow) });
  } catch {
    response.status(500).json({ message: "Failed to fetch team members." });
  }
});

teamRouter.post("/", requireAdmin, upload.single("image"), async (request, response) => {
  const body = teamMemberSchema.safeParse(request.body);
  if (!body.success) {
    return response.status(400).json({ message: "Invalid team member data.", issues: body.error.flatten() });
  }

  if (!request.file) {
    return response.status(400).json({ message: "Profile image is required." });
  }

  let uploadedImagePublicId: string | null = null;

  try {
    const memberId = uuidv4();
    const cloudinaryResult = await uploadImage(request.file.buffer, uuidv4(), "team");
    uploadedImagePublicId = cloudinaryResult.public_id;

    await query(
      `insert into team_members (
        id,
        name,
        role_id,
        department_id,
        academic_year,
        designation,
        email,
        linkedin,
        image_url,
        display_order,
        is_active,
        cloudinary_public_id,
        updated_at
      )
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, now())`,
      [
        memberId,
        body.data.name,
        body.data.roleId,
        body.data.departmentId,
        body.data.academicYear,
        toNullableText(body.data.designation),
        toNullableText(body.data.email),
        toNullableText(body.data.linkedin),
        cloudinaryResult.secure_url,
        body.data.displayOrder,
        body.data.isActive,
        cloudinaryResult.public_id,
      ]
    );

    response.status(201).json({
      message: "Team member added successfully.",
      data: {
        id: memberId,
        name: body.data.name,
        roleId: body.data.roleId,
        departmentId: body.data.departmentId,
        academicYear: body.data.academicYear,
        designation: toNullableText(body.data.designation),
        email: toNullableText(body.data.email),
        linkedin: toNullableText(body.data.linkedin),
        imageUrl: cloudinaryResult.secure_url,
        displayOrder: body.data.displayOrder,
        isActive: body.data.isActive,
        cloudinaryPublicId: cloudinaryResult.public_id,
      },
    });
  } catch (error) {
    console.error("Add team error:", error);
    if (uploadedImagePublicId) {
      await deleteImage(uploadedImagePublicId).catch(() => undefined);
    }
    response.status(500).json({ message: "Failed to add team member." });
  }
});

teamRouter.put("/:id", requireAdmin, upload.single("image"), async (request, response) => {
  const body = teamMemberSchema.safeParse(request.body);
  if (!body.success) {
    return response.status(400).json({ message: "Invalid team member data.", issues: body.error.flatten() });
  }

  let uploadedImagePublicId: string | null = null;

  try {
    const existing = await query<Pick<TeamMemberRow, "image_url" | "cloudinary_public_id">>(
      "select image_url, cloudinary_public_id from team_members where id = $1",
      [request.params.id]
    );

    if (existing.rows.length === 0) {
      return response.status(404).json({ message: "Team member not found." });
    }

    let nextImageUrl = existing.rows[0].image_url;
    let nextCloudinaryPublicId = existing.rows[0].cloudinary_public_id;

    if (request.file) {
      const cloudinaryResult = await uploadImage(request.file.buffer, uuidv4(), "team");
      uploadedImagePublicId = cloudinaryResult.public_id;
      nextImageUrl = cloudinaryResult.secure_url;
      nextCloudinaryPublicId = cloudinaryResult.public_id;
    }

    await query(
      `update team_members
       set name = $1,
           role_id = $2,
           department_id = $3,
           academic_year = $4,
           designation = $5,
           email = $6,
           linkedin = $7,
           image_url = $8,
           display_order = $9,
           is_active = $10,
           cloudinary_public_id = $11,
           updated_at = now()
       where id = $12`,
      [
        body.data.name,
        body.data.roleId,
        body.data.departmentId,
        body.data.academicYear,
        toNullableText(body.data.designation),
        toNullableText(body.data.email),
        toNullableText(body.data.linkedin),
        nextImageUrl,
        body.data.displayOrder,
        body.data.isActive,
        nextCloudinaryPublicId,
        request.params.id,
      ]
    );

    if (request.file && existing.rows[0].cloudinary_public_id) {
      await deleteImage(existing.rows[0].cloudinary_public_id).catch(() => undefined);
    }

    response.json({ message: "Team member updated successfully." });
  } catch (error) {
    if (uploadedImagePublicId) {
      await deleteImage(uploadedImagePublicId).catch(() => undefined);
    }
    response.status(500).json({ message: "Failed to update team member." });
  }
});

teamRouter.delete("/:id", requireAdmin, async (request, response) => {
  try {
    const existing = await query<Pick<TeamMemberRow, "cloudinary_public_id">>(
      "select cloudinary_public_id from team_members where id = $1",
      [request.params.id]
    );

    const deleteResult = await query("delete from team_members where id = $1", [request.params.id]);

    if (deleteResult.rowCount === 0) {
      return response.status(404).json({ message: "Team member not found." });
    }

    if (existing.rows[0]?.cloudinary_public_id) {
      await deleteImage(existing.rows[0].cloudinary_public_id).catch(() => undefined);
    }

    response.json({ message: "Team member removed successfully." });
  } catch {
    response.status(500).json({ message: "Failed to remove team member." });
  }
});
