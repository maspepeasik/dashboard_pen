"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/dashboard/app-shell";
import { LiveLogPanel } from "@/components/dashboard/live-log-panel";
import { ProgressCard } from "@/components/dashboard/progress-card";
import { useAuth } from "@/components/providers/auth-provider";
import { publicEnv } from "@/lib/env";
import { ApiError, apiFetch } from "@/lib/fetcher";
import { getSocket } from "@/lib/socket";
import { formatDateTime } from "@/lib/time";
import type { PentestJobDetail, PentestSocketEvent } from "@/types/pentest";

export default function HistoryDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [job, setJob] = useState<PentestJobDetail | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, router, user]);

  useEffect(() => {
    if (!user || !params.id) {
      return;
    }

    void (async () => {
      try {
        const response = await apiFetch<{ job: PentestJobDetail }>(`/api/pentest/${params.id}`);
        setJob(response.job);
      } catch (loadError) {
        if (loadError instanceof ApiError && loadError.status === 401) {
          router.replace("/login");
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Unable to load job detail.");
      } finally {
        setPageLoading(false);
      }
    })();
  }, [params.id, router, user]);

  useEffect(() => {
    if (!user || !params.id) {
      return;
    }

    const socket = getSocket();

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("job:subscribe", { jobId: params.id });

    const handleUpdate = (event: PentestSocketEvent) => {
      if (event.jobId !== params.id) {
        return;
      }

      setJob((current) => {
        if (!current) {
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
    };

    socket.on("pentest:update", handleUpdate);

    return () => {
      socket.emit("job:unsubscribe", { jobId: params.id });
      socket.off("pentest:update", handleUpdate);
    };
  }, [params.id, user]);

  if (isLoading || (!user && !isLoading) || pageLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-slate-300">
        <div className="inline-flex items-center gap-3 rounded-full border border-stroke bg-white/5 px-5 py-3">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading job detail...
        </div>
      </main>
    );
  }

  return (
    <AppShell
      title="Job Detail"
      subtitle="Inspect the full execution trace, timestamps, and generated report for a single pentest run."
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/history"
            className="inline-flex items-center gap-2 rounded-2xl border border-stroke bg-white/5 px-4 py-3 text-sm text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to history
          </Link>

          {job?.resultFile ? (
            <a
              href={`${publicEnv.apiUrl}/api/pentest/${job.id}/download`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-200"
            >
              <Download className="h-4 w-4" />
              Download report
            </a>
          ) : null}
        </div>

        {error ? (
          <div className="rounded-[24px] border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <ProgressCard job={job} />
          <LiveLogPanel logs={job?.logs ?? []} />
        </div>

        <section className="glass-panel rounded-[28px] border border-stroke p-6 shadow-panel">
          <h2 className="text-lg font-semibold text-white">Report Access</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-stroke bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Target</p>
              <p className="mt-2 text-sm text-slate-200">{job?.target ?? "N/A"}</p>
            </div>
            <div className="rounded-2xl border border-stroke bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Completed at</p>
              <p className="mt-2 text-sm text-slate-200">{formatDateTime(job?.endedAt ?? null)}</p>
            </div>
            <div className="rounded-2xl border border-stroke bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Stored file</p>
              <p className="mt-2 break-all text-sm text-slate-200">
                {job?.resultFile ?? "Pending generation"}
              </p>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
