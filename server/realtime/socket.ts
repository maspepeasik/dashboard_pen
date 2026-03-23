import type { Server as HttpServer } from "node:http";
import cookie from "cookie";
import { Server } from "socket.io";
import { AUTH_COOKIE_NAME } from "../../lib/auth/constants";
import { env } from "../config/env";
import { createRedisClient } from "../config/redis";
import { prisma } from "../config/prisma";
import { getUserById, verifyAccessToken } from "../modules/auth/auth.service";
import { PENTEST_EVENTS_CHANNEL } from "../modules/pentest/pentest.events";

export function registerSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true
    },
    path: "/socket.io"
  });

  io.use(async (socket, next) => {
    try {
      const parsedCookies = cookie.parse(socket.handshake.headers.cookie ?? "");
      const token = parsedCookies[AUTH_COOKIE_NAME];

      if (!token) {
        return next(new Error("Unauthorized"));
      }

      const payload = verifyAccessToken(token);
      const user = await getUserById(payload.sub);
      socket.data.user = user;
      return next();
    } catch (_error) {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.data.user.id}`);

    socket.on("job:subscribe", async ({ jobId }: { jobId: string }) => {
      const job = await prisma.pentestJob.findFirst({
        where: {
          id: jobId,
          userId: socket.data.user.id
        },
        select: {
          id: true
        }
      });

      if (job) {
        socket.join(`job:${jobId}`);
      }
    });

    socket.on("job:unsubscribe", ({ jobId }: { jobId: string }) => {
      socket.leave(`job:${jobId}`);
    });
  });

  const subscriber = createRedisClient();

  subscriber.subscribe(PENTEST_EVENTS_CHANNEL).catch((error) => {
    console.error("Failed to subscribe to pentest event channel:", error);
  });

  subscriber.on("message", (_channel, message) => {
    try {
      const event = JSON.parse(message) as {
        userId: string;
        jobId: string;
      };

      io.to(`user:${event.userId}`).to(`job:${event.jobId}`).emit("pentest:update", event);
    } catch (error) {
      console.error("Failed to emit socket event:", error);
    }
  });

  return io;
}
