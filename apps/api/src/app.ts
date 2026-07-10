import express from "express";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { notFound, errorHandler } from "./middleware/error.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { departmentsRouter } from "./modules/team/departments.routes.js";
import { eventRouter } from "./modules/events/events.routes.js";
import { galleryRouter } from "./modules/gallery/gallery.routes.js";
import { rolesRouter } from "./modules/team/roles.routes.js";
import { teamRouter } from "./modules/team/team.routes.js";
import { homeRouter } from "./modules/home/home.routes.js";
import { aboutRouter } from "./modules/about/about.routes.js";
import { contactRouter } from "./modules/contact/contact.routes.js";
import { registrationsRouter } from "./modules/registrations/registrations.routes.js";
import { analyticsRouter } from "./modules/analytics/analytics.routes.js";
import { env } from "./config/env.js";

export function createApp() {
  const app = express();

  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(cors({ origin: env.frontendUrl, credentials: true }));
  app.use(compression());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.get("/health", (_request, response) => {
    response.json({ ok: true, service: "spandana-api", timestamp: new Date().toISOString() });
  });

  app.use("/auth", authRouter);
  app.use("/roles", rolesRouter);
  app.use("/departments", departmentsRouter);
  app.use("/events", eventRouter);
  app.use("/gallery", galleryRouter);
  app.use("/team", teamRouter);
  app.use("/home", homeRouter);
  app.use("/about", aboutRouter);
  app.use("/contact", contactRouter);
  app.use("/registrations", registrationsRouter);
  app.use("/analytics", analyticsRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
