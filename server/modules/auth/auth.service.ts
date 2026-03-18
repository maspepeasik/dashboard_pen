import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Response } from "express";
import { prisma } from "../../config/prisma";
import { env, isProduction } from "../../config/env";
import { AppError } from "../../utils/app-error";
import { AUTH_COOKIE_NAME } from "../../../lib/auth/constants";
import type { AuthUser } from "../../../types/auth";
import type { LoginInput, RegisterInput } from "../../../lib/validation/auth";

interface JwtPayload {
  sub: string;
  email: string;
  role: "user";
}

export function serializeUser(user: {
  id: string;
  email: string;
  name: string;
  role: "USER";
  createdAt: Date;
}): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: "user",
    createdAt: user.createdAt.toISOString()
  };
}

export function signAccessToken(user: { id: string; email: string }) {
  return jwt.sign(
    {
      email: user.email,
      role: "user"
    },
    env.JWT_SECRET,
    {
      subject: user.id,
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]
    } satisfies jwt.SignOptions
  );
}

export function verifyAccessToken(token: string): JwtPayload {
  const payload = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;

  if (!payload.sub || payload.role !== "user" || !payload.email) {
    throw new AppError("Invalid session token.", 401);
  }

  return {
    sub: payload.sub,
    email: payload.email as string,
    role: "user"
  };
}

export function setAuthCookie(response: Response, token: string) {
  response.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 1000 * 60 * 60 * 12
  });
}

export function clearAuthCookie(response: Response) {
  response.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/"
  });
}

export async function registerUser(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: input.email
    }
  });

  if (existingUser) {
    throw new AppError("Email is already registered.", 409);
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      passwordHash
    }
  });

  return serializeUser(user);
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: {
      email: input.email
    }
  });

  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password.", 401);
  }

  return {
    user: serializeUser(user),
    token: signAccessToken(user)
  };
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  return serializeUser(user);
}
