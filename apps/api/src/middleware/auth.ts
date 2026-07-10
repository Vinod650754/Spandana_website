import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export type AuthPayload = {
  sub: string;
  role: string;
  email: string;
};

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export function requireAdmin(request: AuthRequest, response: Response, next: NextFunction) {
  const header = request.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : request.cookies?.adminToken;

  if (!token) {
    return response.status(401).json({ message: "Missing authentication token." });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as AuthPayload;
    request.user = payload;
    if (payload.role !== "admin") {
      return response.status(403).json({ message: "Admin access required." });
    }
    return next();
  } catch {
    return response.status(401).json({ message: "Invalid or expired token." });
  }
}
