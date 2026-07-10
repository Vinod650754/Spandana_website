import { Router } from "express";
import { z } from "zod";
import { requireAdmin, type AuthRequest } from "../../middleware/auth.js";
import { query } from "../../db/pool.js";

export const contactRouter = Router();

const contactSettingsSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(3),
  whatsapp: z.string().url().optional().or(z.literal("")),
  instagram: z.string().url().optional().or(z.literal("")),
  linkedin: z.string().url().optional().or(z.literal("")),
  youtube: z.string().url().optional().or(z.literal("")),
  facebook: z.string().url().optional().or(z.literal("")),
  mapsUrl: z.string().url().optional().or(z.literal("")),
  address: z.string().min(3),
  officeHours: z.string().optional().or(z.literal("")),
  contactFormEnabled: z.boolean(),
  successMessage: z.string().min(5),
});

const messageSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});

const messageStatusSchema = z.object({
  status: z.enum(["new", "read", "archived"]),
});

type ContactSettingsRow = {
  id: string;
  email: string;
  phone: string;
  whatsapp: string | null;
  instagram: string | null;
  linkedin: string | null;
  youtube: string | null;
  facebook: string | null;
  maps_url: string | null;
  address: string | null;
  office_hours: string | null;
  contact_form_enabled: boolean;
  success_message: string;
  updated_at: string;
};

type ContactMessageRow = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: "new" | "read" | "archived";
  created_at: string;
  updated_at: string;
};

function toNullableText(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeSettings(row: ContactSettingsRow) {
  return {
    id: row.id,
    email: row.email,
    phone: row.phone,
    whatsapp: row.whatsapp,
    instagram: row.instagram,
    linkedin: row.linkedin,
    youtube: row.youtube,
    facebook: row.facebook,
    mapsUrl: row.maps_url,
    address: row.address,
    officeHours: row.office_hours,
    contactFormEnabled: row.contact_form_enabled,
    successMessage: row.success_message,
    updatedAt: row.updated_at,
  };
}

function normalizeMessage(row: ContactMessageRow) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function readContactSettings() {
  const result = await query<ContactSettingsRow>(
    `select id, email, phone, whatsapp, instagram, linkedin, youtube, facebook, maps_url, address, office_hours, contact_form_enabled, success_message, updated_at
     from contact_settings
     where settings_key = 'primary'
     limit 1`
  );

  return result.rows[0] ?? null;
}

contactRouter.get("/details", async (_request, response) => {
  try {
    const settings = await readContactSettings();
    if (!settings) {
      return response.status(404).json({ message: "Contact settings have not been configured." });
    }

    response.json({ data: normalizeSettings(settings) });
  } catch {
    response.status(500).json({ message: "Failed to fetch contact settings." });
  }
});

contactRouter.get("/details/manage", requireAdmin, async (_request, response) => {
  try {
    const settings = await readContactSettings();
    if (!settings) {
      return response.status(404).json({ message: "Contact settings have not been configured." });
    }

    response.json({ data: normalizeSettings(settings) });
  } catch {
    response.status(500).json({ message: "Failed to fetch contact settings." });
  }
});

contactRouter.post("/message", async (request, response) => {
  const parsed = messageSchema.safeParse(request.body);
  if (!parsed.success) {
    return response.status(400).json({ message: "Invalid message payload.", issues: parsed.error.flatten() });
  }

  try {
    const settings = await readContactSettings();
    if (settings && !settings.contact_form_enabled) {
      return response.status(403).json({ message: "Contact form is currently disabled." });
    }

    await query("insert into contact_messages (name, email, message) values ($1, $2, $3)", [
      parsed.data.name,
      parsed.data.email,
      parsed.data.message,
    ]);
    response.status(201).json({ message: "Message submitted successfully." });
  } catch (error) {
    response.status(500).json({ message: "Failed to submit message." });
  }
});

contactRouter.put("/details", requireAdmin, async (request: AuthRequest, response) => {
  const parsed = contactSettingsSchema.safeParse(request.body);
  if (!parsed.success) {
    return response.status(400).json({ message: "Invalid contact settings.", issues: parsed.error.flatten() });
  }

  try {
    const result = await query<ContactSettingsRow>(
      `insert into contact_settings (
        settings_key,
        email,
        phone,
        whatsapp,
        instagram,
        linkedin,
        youtube,
        facebook,
        maps_url,
        address,
        office_hours,
        contact_form_enabled,
        success_message,
        updated_by
      )
       values ('primary', $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       on conflict (settings_key) do update set
         email = excluded.email,
         phone = excluded.phone,
         whatsapp = excluded.whatsapp,
         instagram = excluded.instagram,
         linkedin = excluded.linkedin,
         youtube = excluded.youtube,
         facebook = excluded.facebook,
         maps_url = excluded.maps_url,
         address = excluded.address,
         office_hours = excluded.office_hours,
         contact_form_enabled = excluded.contact_form_enabled,
         success_message = excluded.success_message,
         updated_by = excluded.updated_by,
         updated_at = now()
       returning id, email, phone, whatsapp, instagram, linkedin, youtube, facebook, maps_url, address, office_hours, contact_form_enabled, success_message, updated_at`,
      [
        parsed.data.email,
        parsed.data.phone,
        toNullableText(parsed.data.whatsapp),
        toNullableText(parsed.data.instagram),
        toNullableText(parsed.data.linkedin),
        toNullableText(parsed.data.youtube),
        toNullableText(parsed.data.facebook),
        toNullableText(parsed.data.mapsUrl),
        parsed.data.address,
        toNullableText(parsed.data.officeHours),
        parsed.data.contactFormEnabled,
        parsed.data.successMessage,
        request.user?.email ?? "admin",
      ]
    );

    response.json({ message: "Contact settings updated successfully.", data: normalizeSettings(result.rows[0]) });
  } catch {
    response.status(500).json({ message: "Failed to update contact settings." });
  }
});

contactRouter.get("/messages", requireAdmin, async (_request, response) => {
  try {
    const result = await query<ContactMessageRow>(
      `select id, name, email, message, status, created_at, updated_at
       from contact_messages
       order by case status when 'new' then 1 when 'read' then 2 else 3 end, created_at desc`
    );

    response.json({ data: result.rows.map(normalizeMessage) });
  } catch {
    response.status(500).json({ message: "Failed to fetch contact messages." });
  }
});

contactRouter.put("/messages/:id/status", requireAdmin, async (request, response) => {
  const parsed = messageStatusSchema.safeParse(request.body);
  if (!parsed.success) {
    return response.status(400).json({ message: "Invalid message status.", issues: parsed.error.flatten() });
  }

  try {
    const result = await query<ContactMessageRow>(
      `update contact_messages
       set status = $1,
           updated_at = now()
       where id = $2
       returning id, name, email, message, status, created_at, updated_at`,
      [parsed.data.status, request.params.id]
    );

    if (result.rows.length === 0) {
      return response.status(404).json({ message: "Contact message not found." });
    }

    response.json({ message: "Contact message status updated.", data: normalizeMessage(result.rows[0]) });
  } catch {
    response.status(500).json({ message: "Failed to update contact message status." });
  }
});

contactRouter.delete("/messages/:id", requireAdmin, async (request, response) => {
  try {
    const result = await query("delete from contact_messages where id = $1", [request.params.id]);

    if (result.rowCount === 0) {
      return response.status(404).json({ message: "Contact message not found." });
    }

    response.status(204).send();
  } catch {
    response.status(500).json({ message: "Failed to delete contact message." });
  }
});
