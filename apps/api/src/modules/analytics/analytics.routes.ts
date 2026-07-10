import { Router } from "express";
import { requireAdmin } from "../../middleware/auth.js";
import { query } from "../../db/pool.js";

export const analyticsRouter = Router();

analyticsRouter.get("/dashboard", requireAdmin, async (_request, response) => {
  try {
    const [registrations, galleryUploads, activeEvents] = await Promise.all([
      query("select count(*)::int as count from event_registrations"),
      query("select count(*)::int as count from gallery_images"),
      query("select count(*)::int as count from events where status in ('upcoming', 'ongoing')"),
    ]);

    response.json({
      registrations: registrations.rows[0]?.count ?? 0,
      galleryUploads: galleryUploads.rows[0]?.count ?? 0,
      activeEvents: activeEvents.rows[0]?.count ?? 0,
      volunteerConversions: 0,
    });
  } catch (error) {
    response.status(500).json({ message: "Failed to fetch dashboard metrics." });
  }
});
