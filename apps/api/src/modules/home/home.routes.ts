import { Router } from "express";
import { z } from "zod";
import { query } from "../../db/pool.js";
import { requireAdmin, type AuthRequest } from "../../middleware/auth.js";

export const homeRouter = Router();

const buttonSchema = z.object({
  label: z.string().min(1),
  url: z.string().min(1),
  variant: z.enum(["primary", "secondary"]).default("primary"),
});

const heroSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1),
  body: z.string().min(20),
  buttons: z.array(buttonSchema).min(1).max(4),
  rotatingLines: z.array(z.string().min(1)).min(1).max(8),
  chips: z.array(z.string().min(1)).max(6).default([]),
});

const impactSchema = z.object({
  label: z.string().min(1),
  value: z.coerce.number().int().nonnegative(),
  suffix: z.string().max(8).default(""),
});

const featuredSectionSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(10),
});

const heroBackgroundSchema = z.object({
  type: z.literal("reactbits").default("reactbits"),
  effects: z.array(z.string().min(1)).default([]),
});

const homepageSchema = z.object({
  hero: heroSchema,
  impact: z.array(impactSchema).min(1).max(8),
  featuredSections: z.array(featuredSectionSchema).min(1).max(6),
  heroBackground: heroBackgroundSchema.default({ type: "reactbits", effects: [] }),
});

type HomepageRow = {
  id: string;
  hero: unknown;
  impact: unknown;
  featured_sections: unknown;
  hero_background: unknown;
  updated_at: string;
};

function normalizeHomepage(row: HomepageRow) {
  return {
    id: row.id,
    hero: row.hero,
    impact: row.impact,
    featuredSections: row.featured_sections,
    heroBackground: row.hero_background,
    updatedAt: row.updated_at,
  };
}

homeRouter.get("/", async (_request, response) => {
  try {
    const result = await query<HomepageRow>(
      `select id, hero, impact, featured_sections, hero_background, updated_at
       from homepage_content
       where content_key = 'primary'
       limit 1`
    );

    if (result.rows.length === 0) {
      return response.status(404).json({ message: "Homepage content has not been configured." });
    }

    const content = normalizeHomepage(result.rows[0]);
    const parsed = homepageSchema.safeParse(content);

    if (!parsed.success) {
      return response.status(500).json({ message: "Homepage content is invalid.", issues: parsed.error.flatten() });
    }

    response.json({ data: { ...content, ...parsed.data } });
  } catch (error) {
    response.status(500).json({ message: "Failed to fetch homepage content." });
  }
});

homeRouter.put("/", requireAdmin, async (request: AuthRequest, response) => {
  const body = homepageSchema.safeParse(request.body);

  if (!body.success) {
    return response.status(400).json({ message: "Invalid homepage content.", issues: body.error.flatten() });
  }

  try {
    const result = await query<HomepageRow>(
      `insert into homepage_content (content_key, hero, impact, featured_sections, hero_background, updated_by)
       values ('primary', $1, $2, $3, $4, $5)
       on conflict (content_key) do update set
         hero = excluded.hero,
         impact = excluded.impact,
         featured_sections = excluded.featured_sections,
         hero_background = excluded.hero_background,
         updated_by = excluded.updated_by,
         updated_at = now()
       returning id, hero, impact, featured_sections, hero_background, updated_at`,
      [
        JSON.stringify(body.data.hero),
        JSON.stringify(body.data.impact),
        JSON.stringify(body.data.featuredSections),
        JSON.stringify(body.data.heroBackground),
        request.user?.email ?? "admin",
      ]
    );

    response.json({ message: "Homepage content updated successfully.", data: normalizeHomepage(result.rows[0]) });
  } catch (error) {
    response.status(500).json({ message: "Failed to update homepage content." });
  }
});
