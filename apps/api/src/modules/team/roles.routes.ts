import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { query } from "../../db/pool.js";
import { requireAdmin } from "../../middleware/auth.js";
import {
  catalogSchema,
  normalizeCatalogRow,
  type CatalogRow,
  toNullableText,
} from "./team.shared.js";

export const rolesRouter = Router();

rolesRouter.get("/", async (_request, response) => {
  try {
    const result = await query<CatalogRow>(
      `select id, name, description, display_order, is_active, created_at, updated_at
       from roles
       where is_active = true
       order by display_order asc, name asc, created_at asc`
    );

    response.json({
      data: result.rows.map(normalizeCatalogRow),
    });
  } catch (error) {
    console.error("\n========== ROLE FETCH ERROR ==========");
    console.error(error);
    console.error("======================================\n");

    response.status(500).json({
      message:
        error instanceof Error ? error.message : "Failed to fetch roles.",
    });
  }
});

rolesRouter.get("/manage", requireAdmin, async (_request, response) => {
  try {
    const result = await query<CatalogRow>(
      `select id, name, description, display_order, is_active, created_at, updated_at
       from roles
       order by display_order asc, name asc, created_at asc`
    );

    response.json({
      data: result.rows.map(normalizeCatalogRow),
    });
  } catch (error) {
    console.error("\n========== ROLE MANAGE FETCH ERROR ==========");
    console.error(error);
    console.error("=============================================\n");

    response.status(500).json({
      message:
        error instanceof Error ? error.message : "Failed to fetch roles.",
    });
  }
});

rolesRouter.post("/", requireAdmin, async (request, response) => {
  const body = catalogSchema.safeParse(request.body);

  if (!body.success) {
    return response.status(400).json({
      message: "Invalid role data.",
      issues: body.error.flatten(),
    });
  }

  try {
    const result = await query<CatalogRow>(
      `insert into roles
      (id, name, description, display_order, is_active)
      values ($1, $2, $3, $4, $5)
      returning
      id,
      name,
      description,
      display_order,
      is_active,
      created_at,
      updated_at`,
      [
        uuidv4(),
        body.data.name,
        toNullableText(body.data.description),
        body.data.displayOrder,
        body.data.isActive,
      ]
    );

    response.status(201).json({
      message: "Role created successfully.",
      data: normalizeCatalogRow(result.rows[0]),
    });
  } catch (error) {
    console.error("\n========== ROLE CREATE ERROR ==========");
    console.error("Request Body:");
    console.error(request.body);
    console.error("---------------------------------------");
    console.error(error);
    console.error("=======================================\n");

    response.status(500).json({
      message:
        error instanceof Error ? error.message : "Failed to create role.",
    });
  }
});

rolesRouter.put("/:id", requireAdmin, async (request, response) => {
  const body = catalogSchema.safeParse(request.body);

  if (!body.success) {
    return response.status(400).json({
      message: "Invalid role data.",
      issues: body.error.flatten(),
    });
  }

  try {
    const result = await query<CatalogRow>(
      `update roles
       set
         name = $1,
         description = $2,
         display_order = $3,
         is_active = $4,
         updated_at = now()
       where id = $5
       returning
         id,
         name,
         description,
         display_order,
         is_active,
         created_at,
         updated_at`,
      [
        body.data.name,
        toNullableText(body.data.description),
        body.data.displayOrder,
        body.data.isActive,
        request.params.id,
      ]
    );

    if (result.rows.length === 0) {
      return response.status(404).json({
        message: "Role not found.",
      });
    }

    response.json({
      message: "Role updated successfully.",
      data: normalizeCatalogRow(result.rows[0]),
    });
  } catch (error) {
    console.error("\n========== ROLE UPDATE ERROR ==========");
    console.error(error);
    console.error("=======================================\n");

    response.status(500).json({
      message:
        error instanceof Error ? error.message : "Failed to update role.",
    });
  }
});

rolesRouter.delete("/:id", requireAdmin, async (request, response) => {
  try {
    const usage = await query<{ count: number }>(
      `select count(*)::int as count
       from team_members
       where role_id = $1`,
      [request.params.id]
    );

    if ((usage.rows[0]?.count ?? 0) > 0) {
      return response.status(409).json({
        message: "This role is assigned to one or more team members.",
      });
    }

    const result = await query<CatalogRow>(
      `delete from roles
       where id = $1
       returning
         id,
         name,
         description,
         display_order,
         is_active,
         created_at,
         updated_at`,
      [request.params.id]
    );

    if (result.rows.length === 0) {
      return response.status(404).json({
        message: "Role not found.",
      });
    }

    response.json({
      message: "Role deleted successfully.",
    });
  } catch (error) {
    console.error("\n========== ROLE DELETE ERROR ==========");
    console.error(error);
    console.error("=======================================\n");

    response.status(500).json({
      message:
        error instanceof Error ? error.message : "Failed to delete role.",
    });
  }
});