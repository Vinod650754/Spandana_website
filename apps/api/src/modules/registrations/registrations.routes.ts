import { Router } from "express";
import { z } from "zod";
import { requireAdmin } from "../../middleware/auth.js";
import { toCsv } from "../../utils/csv.js";
import { query } from "../../db/pool.js";

export const registrationsRouter = Router();

const registrationSchema = z.object({
  eventId: z.string().uuid(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  branch: z.string().optional(),
  year: z.string().optional(),
  message: z.string().optional(),
});

registrationsRouter.post("/event", async (request, response) => {
  const parsed = registrationSchema.safeParse(request.body);
  if (!parsed.success) {
    return response.status(400).json({ message: "Invalid registration payload.", issues: parsed.error.flatten() });
  }

  try {
    await query(
      `insert into event_registrations (event_id, name, email, phone, branch, year, message)
       values ($1, $2, $3, $4, $5, $6, $7)`,
      [
        parsed.data.eventId,
        parsed.data.name,
        parsed.data.email,
        parsed.data.phone,
        parsed.data.branch,
        parsed.data.year,
        parsed.data.message,
      ]
    );
    response.status(201).json({ message: "Registration recorded." });
  } catch (error) {
    response.status(500).json({ message: "Failed to record registration." });
  }
});

registrationsRouter.get("/export", requireAdmin, async (_request, response) => {
  const result = await query(
    `select er.name, er.email, er.phone, er.branch, er.year, er.status, e.title as event
     from event_registrations er
     join events e on e.id = er.event_id
     order by er.created_at desc`
  );

  response.setHeader("Content-Type", "text/csv");
  response.send(toCsv(result.rows));
});
