import IORedis from "ioredis";
import { env } from "./env";

const redisUrl = new URL(env.REDIS_URL);

export const bullmqConnection = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port || 6379),
  username: redisUrl.username || undefined,
  password: redisUrl.password || undefined,
  db: redisUrl.pathname ? Number(redisUrl.pathname.replace("/", "")) || 0 : 0
};

export function createRedisClient() {
  return new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
  });
}
