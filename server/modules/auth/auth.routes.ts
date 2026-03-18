import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { loginSchema, registerSchema } from "../../../lib/validation/auth";
import {
  clearAuthCookie,
  loginUser,
  registerUser,
  setAuthCookie
} from "./auth.service";
import { requireAuth } from "../../middleware/auth";

export const authRouter = Router();

authRouter.post(
  "/register",
  asyncHandler(async (request, response) => {
    const input = registerSchema.parse(request.body);
    const user = await registerUser(input);
    const token = await loginUser({
      email: input.email,
      password: input.password
    });

    setAuthCookie(response, token.token);

    return response.status(201).json({
      user
    });
  })
);

authRouter.post(
  "/login",
  asyncHandler(async (request, response) => {
    const input = loginSchema.parse(request.body);
    const { user, token } = await loginUser(input);

    setAuthCookie(response, token);

    return response.json({
      user
    });
  })
);

authRouter.post("/logout", (_request, response) => {
  clearAuthCookie(response);
  return response.status(204).send();
});

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (request, response) => {
    return response.json({
      user: request.user
    });
  })
);
