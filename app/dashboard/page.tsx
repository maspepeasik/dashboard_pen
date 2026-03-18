"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, FileDown, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/dashboard/app-shell";
import { LiveLogPanel } from "@/components/dashboard/live-log-panel";
import { ProgressCard } from "@/components/dashboard/progress-card";
import { StartPentestForm } from "@/components/dashboard/start-pentest-form";
import { HistoryTable } from "@/components/history/history-table";
import { useAuth } from "@/components/providers/auth-provider";
import { publicEnv } from "@/lib/env";
import { ApiError, apiFetch } from "@/lib/fetcher";
import { getSocket } from "@/lib/socket";
import type { PentestJobDetail, PentestJobSummary, PentestSocketEvent } from "@/types/pentest";

function upsertJobSummary(
  existingJobs: PentestJobSummary[],
  nextJob: PentestJobSummary
): PentestJobSummary[] {
  const nextJobs = [...existingJobs];
  const existingIndex = nextJobs.findIndex((job) => job.id === nextJob.id);

  if (existingIndex === -1) {
    return [nextJob, ...nextJobs];
  }

  nextJobs[existingIndex] = {
    ...nextJobs[existingIndex],
    ...nextJob
  };

  return nextJobs;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [jobs, setJobs] = useState<PentestJobSummary[]>([]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [activeJob, setActiveJob] = useState<PentestJobDetail | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadHistory() {
    const response = await apiFetch<{ jobs: PentestJobSummary[] }>("/api/pentest/history");
    setJobs(response.jobs);

    if (!activeJobId && response.jobs.length) {
      const prioritizedJob =
        response.jobs.find((job) => job.status === "running" || job.status === "pending") ??
        response.jobs[0];
      setActiveJobId(prioritizedJob.id);
    }
  }

  async function loadJob(jobId: string) {
    const response = await apiFetch<{ job: PentestJobDetail }>(`/api/pentest/${jobId}`);
    setActiveJob(response.job);
  }

  async function handleStartPentest(target: string) {
    setIsStarting(true);
    setError(null);

    try {
      const response = await apiFetch<{ job: PentestJobSummary }>("/api/pentest/start", {
        method: "POST",
        body: JSON.stringify({ target })
      });

      setJobs((current) => upsertJobSummary(current, response.job));
      setActiveJobId(response.job.id);
      setActiveJob({
        ...response.job,
        logs: []
      });
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : "Failed to start pentest.");
    } finally {
      setIsStarting(false);
    }
  }

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, router, user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    void (async () => {
      try {
        await loadHistory();
      } catch (loadError) {
        if (loadError instanceof ApiError && loadError.status === 401) {
          router.replace("/login");
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard data.");
      } finally {
        setIsPageLoading(false);
      }
    })();
  }, [router, user]);

  useEffect(() => {
    if (!user || !activeJobId) {
      return;
    }

    void loadJob(activeJobId).catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : "Unable to load job detail.");
    });
  }, [activeJobId, user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const socket = getSocket();

    if (!socket.connected) {
      socket.connect();
    }

    const handleUpdate = (event: PentestSocketEvent) => {
      const previousJob = jobs.find((job) => job.id === event.jobId);

      if (previousJob) {
        setJobs((current) =>
          upsertJobSummary(current, {
            ...previousJob,
            status: event.status,
            progress: event.progress,
            currentStage: event.currentStage,
            endedAt: event.endedAt ?? previousJob.endedAt,
            resultFile: event.resultFile ?? previousJob.resultFile
          })
        );
      }

      setActiveJob((current) => {
        if (!current || current.id !== event.jobId) {
          return current;
        }

        return {
          ...current,
          status: event.status,
          progress: event.progress,
          currentStage: event.currentStage,
          endedAt: event.endedAt ?? current.endedAt,
          resultFile: event.resultFile ?? current.resultFile,
          logs:
            event.log && !current.logs.some((entry) => entry.id === event.log?.id)
              ? [...current.logs, event.log]
              : current.logs
        };
      });

      if (event.jobId === activeJobId && (event.status === "completed" || event.status === "failed")) {
        void loadJob(event.jobId).catch(() => undefined);
      }
    };

    socket.on("pentest:update", handleUpdate);

    return () => {
      socket.off("pentest:update", handleUpdate);
    };
  }, [activeJobId, jobs, user]);

  useEffect(() => {
    if (!activeJobId || !user) {
      return;
    }

    const socket = getSocket();
    socket.emit("job:subscribe", { jobId: activeJobId });

    return () => {
      socket.emit("job:unsubscribe", { jobId: activeJobId });
    };
  }, [activeJobId, user]);

  if (isLoading || (!user && !isLoading) || isPageLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-slate-300">
        <div className="inline-flex items-center gap-3 rounded-full border border-stroke bg-white/5 px-5 py-3">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading secure dashboard...
        </div>
      </main>
    );
  }

  return (
    <AppShell
      title="Operations Dashboard"
      subtitle="Dispatch queued pentest jobs, monitor live telemetry, and access durable reports."
    >
      <div className="space-y-6">
        {error ? (
          <div className="rounded-[24px] border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <StartPentestForm isSubmitting={isStarting} onSubmit={handleStartPentest} />

          <section className="glass-panel rounded-[28px] border border-stroke p-6 shadow-panel">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-teal-500/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-teal-200">
                <Activity className="h-3.5 w-3.5" />
                Realtime Overview
              </div>
              <div className="grid gap-4">
                <div className="rounded-2xl border border-stroke bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Jobs queued</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{jobs.length}</p>
                </div>
                <div className="rounded-2xl border border-stroke bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Active executions</p>
                  <p className="mt-2 text-3xl font-semibold text-white">
                    {jobs.filter((job) => job.status === "running" || job.status === "pending").length}
                  </p>
                </div>
                <div className="rounded-2xl border border-stroke bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Reports ready</p>
                  <p className="mt-2 text-3xl font-semibold text-white">
                    {jobs.filter((job) => job.status === "completed").length}
                  </p>
                </div>
              </div>

              {activeJob?.resultFile ? (
                <a
                  href={`${publicEnv.apiUrl}/api/pentest/${activeJob.id}/download`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-200"
                >
                  <FileDown className="h-4 w-4" />
                  Download current report
                </a>
              ) : (
                <div className="rounded-2xl border border-dashed border-stroke px-4 py-3 text-sm text-slate-500">
                  Reports become available here as soon as the Reporting stage finishes.
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <ProgressCard job={activeJob} />
          <LiveLogPanel logs={activeJob?.logs ?? []} />
        </div>

        <HistoryTable jobs={jobs} selectedJobId={activeJobId} onSelect={setActiveJobId} />
      </div>
    </AppShell>
  );
}
