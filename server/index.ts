import http from "node:http";
import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { prisma } from "./config/prisma";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import { authRouter } from "./modules/auth/auth.routes";
import { pentestRouter } from "./modules/pentest/pentest.routes";
import { registerSocketServer } from "./realtime/socket";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true
  })
);
app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));

app.get("/health", async (_request, response) => {
  await prisma.$queryRaw`SELECT 1`;
  return response.json({
    ok: true,
    service: "backend",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/auth", authRouter);
app.use("/api/pentest", pentestRouter);
app.use(notFoundHandler);
app.use(errorHandler);

const server = http.createServer(app);
registerSocketServer(server);

server.listen(env.PORT, () => {
  console.log(`API and Socket.IO server listening on ${env.API_URL}`);
});
