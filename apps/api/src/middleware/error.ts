import type { NextFunction, Request, Response } from "express";

export function notFound(_request: Request, response: Response) {
  response.status(404).json({ message: "Route not found." });
}

export function errorHandler(
  error: unknown,
  request: Request,
  response: Response,
  _next: NextFunction,
) {
  console.error("=================================");
  console.error("API ERROR");
  console.error(`${request.method} ${request.originalUrl}`);
  console.error(error);
  console.error("=================================");

  if (error instanceof Error) {
    response.status(500).json({
      message: error.message,
    });
    return;
  }

  response.status(500).json({
    message: "Internal server error.",
  });
}
