import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/app-error";

export function notFoundHandler(_request: Request, _response: Response, next: NextFunction) {
  next(new AppError("Route not found.", 404));
}

export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction
) {
  if (error instanceof ZodError) {
    return response.status(400).json({
      message: "Validation failed.",
      issues: error.flatten()
    });
  }

  if (error instanceof AppError) {
    return response.status(error.statusCode).json({
      message: error.message
    });
  }

  console.error(error);

  return response.status(500).json({
    message: "Internal server error."
  });
}
