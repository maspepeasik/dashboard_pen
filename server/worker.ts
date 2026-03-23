import { Worker } from "bullmq";
import { env } from "./config/env";
import { bullmqConnection } from "./config/redis";
import { executePentestJob } from "./modules/pentest/pentest.executor";
import { pentestQueueName } from "./queue/pentest.queue";

const worker = new Worker(
  pentestQueueName,
  async (job) => {
    await executePentestJob(job.data.jobId as string);
  },
  {
    connection: bullmqConnection,
    concurrency: 4
  }
);

worker.on("completed", (job) => {
  console.log(`Worker completed pentest job ${job.id}`);
});

worker.on("failed", (job, error) => {
  console.error(`Worker failed pentest job ${job?.id}:`, error.message);
});

console.log(`Pentest worker booted in ${env.NODE_ENV} mode.`);
