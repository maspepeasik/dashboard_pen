import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import { env } from "../../config/env";
import type { PentestJobDetail } from "../../../types/pentest";

function ensureStorageDir() {
  const storagePath = path.resolve(process.cwd(), env.REPORT_STORAGE_PATH);

  if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true });
  }

  return storagePath;
}

export function buildReportFileName(jobId: string) {
  return `pentest-report-${jobId}.pdf`;
}

export function resolveReportPath(fileName: string) {
  return path.join(ensureStorageDir(), fileName);
}

export async function storeExternalPdfReport(jobId: string, data: Buffer) {
  const fileName = buildReportFileName(jobId);
  const destinationPath = resolveReportPath(fileName);

  await fs.promises.writeFile(destinationPath, data);

  return fileName;
}

export async function createPdfReport(job: PentestJobDetail) {
  const fileName = buildReportFileName(job.id);
  const destinationPath = resolveReportPath(fileName);

  await new Promise<void>((resolve, reject) => {
    const document = new PDFDocument({ margin: 48 });
    const writeStream = fs.createWriteStream(destinationPath);

    document.pipe(writeStream);

    document
      .fontSize(22)
      .text("Pentest Automation Report", { underline: true })
      .moveDown();
    document.fontSize(12).text(`Job ID: ${job.id}`);
    document.text(`Target: ${job.target}`);
    document.text(`Status: ${job.status}`);
    document.text(`Progress: ${job.progress}%`);
    document.text(`Stage: ${job.currentStage}`);
    document.text(`Started: ${job.startedAt ?? "N/A"}`);
    document.text(`Finished: ${job.endedAt ?? "N/A"}`);
    document.moveDown();
    document.fontSize(16).text("Execution Log");
    document.moveDown(0.5);

    for (const entry of job.logs) {
      document
        .fontSize(10)
        .text(`[${entry.createdAt}] [${entry.stage}] ${entry.message}`, {
          lineGap: 3
        });
    }

    document.end();

    writeStream.on("finish", () => resolve());
    writeStream.on("error", reject);
  });

  return fileName;
}
