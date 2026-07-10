import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../../config/env.js";
import { requireAdmin, type AuthRequest } from "../../middleware/auth.js";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

authRouter.post("/login", (request, response) => {
  const body = loginSchema.safeParse(request.body);
  if (!body.success) {
    return response.status(400).json({ message: "Invalid credentials payload.", issues: body.error.flatten() });
  }

  const isValid = body.data.email === env.adminEmail && body.data.password === env.adminPassword;
  if (!isValid) {
    return response.status(401).json({ message: "Invalid credentials." });
  }

  const token = jwt.sign({ sub: "admin-1", role: "admin", email: body.data.email }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  });

  response.json({ token, user: { email: body.data.email, role: "admin" } });
});

authRouter.get("/me", requireAdmin, (request: AuthRequest, response) => {
  response.json({ user: request.user });
});
