"use client";

import Link from "next/link";
import { FileText, Hourglass, Search } from "lucide-react";
import type { PentestJobSummary } from "@/types/pentest";
import { formatDateTime, formatDuration, formatRelativeTime } from "@/lib/time";
import { cn } from "@/lib/utils";

interface HistoryTableProps {
  jobs: PentestJobSummary[];
  selectedJobId?: string | null;
  onSelect?: (jobId: string) => void;
}

const statusStyles = {
  pending: "border-sky-400/20 bg-sky-500/10 text-sky-200",
  running: "border-amber-400/20 bg-amber-500/10 text-amber-200",
  completed: "border-emerald-400/20 bg-emerald-500/10 text-emerald-200",
  failed: "border-rose-400/20 bg-rose-500/10 text-rose-200",
  cancelled: "border-slate-400/20 bg-slate-500/10 text-slate-200"
};

export function HistoryTable({ jobs, selectedJobId, onSelect }: HistoryTableProps) {
  return (
    <section className="glass-panel rounded-[28px] border border-stroke p-6 shadow-panel">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Pentest History</h2>
          <p className="mt-1 text-sm text-slate-400">
            Review queued and completed jobs, inspect durations, and jump into detailed results.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-stroke bg-white/5 px-3 py-2 text-sm text-slate-300">
          <Hourglass className="h-4 w-4" />
          {jobs.length} total jobs
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-stroke">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/5">
            <thead className="bg-slate-950/65">
              <tr className="text-left text-xs uppercase tracking-[0.22em] text-slate-500">
                <th className="px-4 py-4">Target</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Created</th>
                <th className="px-4 py-4">Duration</th>
                <th className="px-4 py-4">Result</th>
                <th className="px-4 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-slate-950/30">
              {jobs.length ? (
                jobs.map((job) => (
                  <tr
                    key={job.id}
                    className={cn(
                      "transition hover:bg-white/[0.03]",
                      selectedJobId === job.id ? "bg-white/[0.04]" : ""
                    )}
                  >
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-white">{job.target}</p>
                        <p className="mt-1 text-xs text-slate-500">{formatRelativeTime(job.createdAt)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-3 py-1 text-xs capitalize",
                          statusStyles[job.status]
                        )}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-300">{formatDateTime(job.createdAt)}</td>
                    <td className="px-4 py-4 text-sm text-slate-300">{formatDuration(job.durationSeconds)}</td>
                    <td className="px-4 py-4">
                      {job.resultFile ? (
                        <span className="inline-flex items-center gap-2 text-sm text-emerald-200">
                          <FileText className="h-4 w-4" />
                          Ready
                        </span>
                      ) : (
                        <span className="text-sm text-slate-500">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        {onSelect ? (
                          <button
                            type="button"
                            onClick={() => onSelect(job.id)}
                            className="inline-flex items-center gap-2 rounded-xl border border-stroke px-3 py-2 text-sm text-slate-300 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
                          >
                            <Search className="h-4 w-4" />
                            Inspect
                          </button>
                        ) : null}
                        <Link
                          href={`/history/${job.id}`}
                          className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-200"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-10 text-center text-sm text-slate-500" colSpan={6}>
                    No pentest jobs found yet. Start one from the dashboard to populate history.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
