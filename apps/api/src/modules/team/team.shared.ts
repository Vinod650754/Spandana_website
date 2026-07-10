import { z } from "zod";

export const catalogSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  displayOrder: z.coerce.number().int().nonnegative().default(0),
  isActive: z.preprocess((value) => value === true || value === "true" || value === "1", z.boolean()).default(true),
});

export const teamMemberSchema = z.object({
  name: z.string().trim().min(2).max(120),
  roleId: z.string().uuid(),
  departmentId: z.string().uuid(),
  academicYear: z.coerce.number().int().min(1900).max(2100),
  designation: z.string().trim().max(180).optional().or(z.literal("")),
  email: z.string().trim().email().optional().or(z.literal("")),
  linkedin: z.string().trim().url().optional().or(z.literal("")),
  displayOrder: z.coerce.number().int().nonnegative().default(0),
  isActive: z.preprocess((value) => value === true || value === "true" || value === "1", z.boolean()).default(true),
});

export type CatalogRow = {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type TeamMemberRow = {
  id: string;
  name: string;
  role_id: string | null;
  role_name: string | null;
  role_display_order: number | null;
  role_is_active: boolean | null;
  department_id: string | null;
  department_name: string | null;
  department_display_order: number | null;
  department_is_active: boolean | null;
  academic_year: number | null;
  designation: string | null;
  email: string | null;
  linkedin: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  cloudinary_public_id: string | null;
  created_at: string;
  updated_at: string;
};

export function toNullableText(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeCatalogRow(row: CatalogRow) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    displayOrder: row.display_order,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function normalizeTeamMemberRow(row: TeamMemberRow) {
  return {
    id: row.id,
    name: row.name,
    roleId: row.role_id,
    roleName: row.role_name,
    roleDisplayOrder: row.role_display_order,
    roleIsActive: row.role_is_active,
    departmentId: row.department_id,
    departmentName: row.department_name,
    departmentDisplayOrder: row.department_display_order,
    departmentIsActive: row.department_is_active,
    academicYear: row.academic_year,
    designation: row.designation,
    email: row.email,
    linkedin: row.linkedin,
    imageUrl: row.image_url,
    displayOrder: row.display_order,
    isActive: row.is_active,
    cloudinaryPublicId: row.cloudinary_public_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}