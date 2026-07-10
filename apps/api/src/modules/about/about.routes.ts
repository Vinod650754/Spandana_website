import { Router } from "express";
import { z } from "zod";
import { query } from "../../db/pool.js";
import { requireAdmin, type AuthRequest } from "../../middleware/auth.js";

export const aboutRouter = Router();

const impactSchema = z.object({
  label: z.string().min(1),
  value: z.coerce.number().int().nonnegative(),
  suffix: z.string().max(8).default(""),
});

const timelineItemSchema = z.object({
  period: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(10),
  sortOrder: z.coerce.number().int().nonnegative(),
});

const aboutSchema = z.object({
  yearEstablished: z.coerce.number().int().min(1900).max(2100),
  introduction: z.string().min(40),
  mission: z.string().min(20),
  vision: z.string().min(20),
  objectives: z.array(z.string().min(5)).min(1),
  impact: z.array(impactSchema).min(1),
  instagramUrl: z.string().url().optional().or(z.literal("")),
  timeline: z.array(timelineItemSchema).default([]),
  futureMessage: z.string().min(10),
});

type AboutRow = {
  id: string;
  year_established: number;
  introduction: string;
  mission: string;
  vision: string;
  objectives: unknown;
  impact: unknown;
  instagram_url: string;
  timeline: unknown;
  future_message: string;
  updated_at: string;
};

function normalizeAbout(row: AboutRow) {
  return {
    id: row.id,
    yearEstablished: row.year_established,
    introduction: row.introduction,
    mission: row.mission,
    vision: row.vision,
    objectives: row.objectives,
    impact: row.impact,
    instagramUrl: row.instagram_url,
    timeline: row.timeline,
    futureMessage: row.future_message,
    updatedAt: row.updated_at,
  };
}

aboutRouter.get("/", async (_request, response) => {
  try {
    const result = await query<AboutRow>(
      `select id, year_established, introduction, mission, vision, objectives, impact, instagram_url, timeline, future_message, updated_at
       from about_content
       where content_key = 'primary'
       limit 1`
    );

    if (result.rows.length === 0) {
      return response.status(404).json({ message: "About content has not been configured." });
    }

    const content = normalizeAbout(result.rows[0]);
    const parsed = aboutSchema.safeParse(content);

    if (!parsed.success) {
      return response.status(500).json({ message: "About content is invalid.", issues: parsed.error.flatten() });
    }

    response.json({ data: { ...content, ...parsed.data } });
  } catch (error) {
    response.status(500).json({ message: "Failed to fetch about content." });
  }
});

aboutRouter.put("/", requireAdmin, async (request: AuthRequest, response) => {
  const body = aboutSchema.safeParse(request.body);

  if (!body.success) {
    return response.status(400).json({ message: "Invalid about content.", issues: body.error.flatten() });
  }

  try {
    const result = await query<AboutRow>(
      `insert into about_content (content_key, year_established, introduction, mission, vision, objectives, impact, instagram_url, timeline, future_message, updated_by)
       values ('primary', $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       on conflict (content_key) do update set
         year_established = excluded.year_established,
         introduction = excluded.introduction,
         mission = excluded.mission,
         vision = excluded.vision,
         objectives = excluded.objectives,
         impact = excluded.impact,
         instagram_url = excluded.instagram_url,
         timeline = excluded.timeline,
         future_message = excluded.future_message,
         updated_by = excluded.updated_by,
         updated_at = now()
       returning id, year_established, introduction, mission, vision, objectives, impact, instagram_url, timeline, future_message, updated_at`,
      [
        body.data.yearEstablished,
        body.data.introduction,
        body.data.mission,
        body.data.vision,
        JSON.stringify(body.data.objectives),
        JSON.stringify(body.data.impact),
        body.data.instagramUrl,
        JSON.stringify(body.data.timeline),
        body.data.futureMessage,
        request.user?.email ?? "admin",
      ]
    );

    response.json({ message: "About content updated successfully.", data: normalizeAbout(result.rows[0]) });
  } catch (error) {
    response.status(500).json({ message: "Failed to update about content." });
  }
});
