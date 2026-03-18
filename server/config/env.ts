import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default("12h"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  API_URL: z.string().url().default("http://localhost:4000"),
  SOCKET_URL: z.string().url().default("http://localhost:4000"),
  PORT: z.coerce.number().default(4000),
  REPORT_STORAGE_PATH: z.string().default("./storage/reports"),
  CORS_ORIGIN: z.string().url().default("http://localhost:3000")
});

export const env = envSchema.parse(process.env);
export const isProduction = env.NODE_ENV === "production";
