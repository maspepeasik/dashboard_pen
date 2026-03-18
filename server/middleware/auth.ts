import type { NextFunction, Request, Response } from "express";
import { AUTH_COOKIE_NAME } from "../../lib/auth/constants";
import { getUserById, verifyAccessToken } from "../modules/auth/auth.service";

export async function requireAuth(request: Request, response: Response, next: NextFunction) {
  const bearerToken = request.headers.authorization?.startsWith("Bearer ")
    ? request.headers.authorization.slice(7)
    : undefined;
  const token = request.cookies[AUTH_COOKIE_NAME] ?? bearerToken;

  if (!token) {
    return response.status(401).json({
      message: "Authentication required."
    });
  }

  try {
    const payload = verifyAccessToken(token);
    request.user = await getUserById(payload.sub);
    return next();
  } catch (_error) {
    return response.status(401).json({
      message: "Invalid or expired session."
    });
  }
}
