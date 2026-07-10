import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { query } from "../../db/pool.js";
import { requireAdmin } from "../../middleware/auth.js";
import { catalogSchema, normalizeCatalogRow, type CatalogRow, toNullableText } from "./team.shared.js";

export const departmentsRouter = Router();

departmentsRouter.get("/", async (_request, response) => {
  try {
    const result = await query<CatalogRow>(
      `select id, name, description, display_order, is_active, created_at, updated_at
       from departments
       where is_active = true
       order by display_order asc, name asc, created_at asc`
    );

    response.json({ data: result.rows.map(normalizeCatalogRow) });
  } catch {
    response.status(500).json({ message: "Failed to fetch departments." });
  }
});

departmentsRouter.get("/manage", requireAdmin, async (_request, response) => {
  try {
    const result = await query<CatalogRow>(
      `select id, name, description, display_order, is_active, created_at, updated_at
       from departments
       order by display_order asc, name asc, created_at asc`
    );

    response.json({ data: result.rows.map(normalizeCatalogRow) });
  } catch {
    response.status(500).json({ message: "Failed to fetch departments." });
  }
});

departmentsRouter.post("/", requireAdmin, async (request, response) => {
  const body = catalogSchema.safeParse(request.body);
  if (!body.success) {
    return response.status(400).json({ message: "Invalid department data.", issues: body.error.flatten() });
  }

  try {
    const result = await query<CatalogRow>(
      `insert into departments (id, name, description, display_order, is_active)
       values ($1, $2, $3, $4, $5)
       returning id, name, description, display_order, is_active, created_at, updated_at`,
      [uuidv4(), body.data.name, toNullableText(body.data.description), body.data.displayOrder, body.data.isActive]
    );

    response.status(201).json({ message: "Department created successfully.", data: normalizeCatalogRow(result.rows[0]) });
  } catch {
    response.status(500).json({ message: "Failed to create department." });
  }
});

departmentsRouter.put("/:id", requireAdmin, async (request, response) => {
  const body = catalogSchema.safeParse(request.body);
  if (!body.success) {
    return response.status(400).json({ message: "Invalid department data.", issues: body.error.flatten() });
  }

  try {
    const result = await query<CatalogRow>(
      `update departments
       set name = $1,
           description = $2,
           display_order = $3,
           is_active = $4,
           updated_at = now()
       where id = $5
       returning id, name, description, display_order, is_active, created_at, updated_at`,
      [body.data.name, toNullableText(body.data.description), body.data.displayOrder, body.data.isActive, request.params.id]
    );

    if (result.rows.length === 0) {
      return response.status(404).json({ message: "Department not found." });
    }

    response.json({ message: "Department updated successfully.", data: normalizeCatalogRow(result.rows[0]) });
  } catch {
    response.status(500).json({ message: "Failed to update department." });
  }
});

departmentsRouter.delete("/:id", requireAdmin, async (request, response) => {
  try {
    const usage = await query<{ count: number }>("select count(*)::int as count from team_members where department_id = $1", [request.params.id]);
    if ((usage.rows[0]?.count ?? 0) > 0) {
      return response.status(409).json({ message: "This department is assigned to one or more team members." });
    }

    const result = await query<CatalogRow>(
      "delete from departments where id = $1 returning id, name, description, display_order, is_active, created_at, updated_at",
      [request.params.id]
    );

    if (result.rows.length === 0) {
      return response.status(404).json({ message: "Department not found." });
    }

    response.json({ message: "Department deleted successfully." });
  } catch {
    response.status(500).json({ message: "Failed to delete department." });
  }
});