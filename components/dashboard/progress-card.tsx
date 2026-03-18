import { AlertTriangle, CheckCircle2, LoaderCircle, Timer } from "lucide-react";
import type { PentestJobDetail, PentestJobSummary } from "@/types/pentest";
import { cn } from "@/lib/utils";
import { formatDateTime, formatDuration } from "@/lib/time";

interface ProgressCardProps {
  job: PentestJobSummary | PentestJobDetail | null;
}

const statusStyles = {
  pending: "border-sky-400/20 bg-sky-500/10 text-sky-200",
  running: "border-amber-400/20 bg-amber-500/10 text-amber-200",
  completed: "border-emerald-400/20 bg-emerald-500/10 text-emerald-200",
  failed: "border-rose-400/20 bg-rose-500/10 text-rose-200"
};

const statusIcons = {
  pending: LoaderCircle,
  running: Timer,
  completed: CheckCircle2,
  failed: AlertTriangle
};

export function ProgressCard({ job }: ProgressCardProps) {
  if (!job) {
    return (
      <section className="glass-panel rounded-[28px] border border-stroke p-6 shadow-panel">
        <h2 className="text-lg font-semibold text-white">Live Progress</h2>
        <p className="mt-3 text-sm text-slate-400">
          Start a pentest job to see stage telemetry, completion time, and report state here.
        </p>
      </section>
    );
  }

  const Icon = statusIcons[job.status];

  return (
    <section className="glass-panel rounded-[28px] border border-stroke p-6 shadow-panel">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Active Job</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{job.target}</h2>
          <p className="mt-2 text-sm text-slate-400">
            Stage: <span className="text-slate-200">{job.currentStage}</span>
          </p>
        </div>

        <div
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm capitalize",
            statusStyles[job.status]
          )}
        >
          <Icon className={cn("h-4 w-4", job.status === "pending" ? "animate-spin" : "")} />
          {job.status}
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-stroke bg-slate-950/70 p-4">
        <div className="flex items-center justify-between text-sm text-slate-300">
          <span>Pipeline progress</span>
          <span>{job.progress}%</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-400 via-cyan-400 to-orange-400 transition-all duration-500"
            style={{ width: `${job.progress}%` }}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-stroke bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Queued</p>
          <p className="mt-2 text-sm text-slate-200">{formatDateTime(job.createdAt)}</p>
        </div>
        <div className="rounded-2xl border border-stroke bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Started</p>
          <p className="mt-2 text-sm text-slate-200">{formatDateTime(job.startedAt)}</p>
        </div>
        <div className="rounded-2xl border border-stroke bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Duration</p>
          <p className="mt-2 text-sm text-slate-200">{formatDuration(job.durationSeconds)}</p>
        </div>
      </div>
    </section>
  );
}
