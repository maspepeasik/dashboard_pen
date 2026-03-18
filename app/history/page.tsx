"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { AppShell } from "@/components/dashboard/app-shell";
import { HistoryTable } from "@/components/history/history-table";
import { useAuth } from "@/components/providers/auth-provider";
import { ApiError, apiFetch } from "@/lib/fetcher";
import type { PentestJobSummary } from "@/types/pentest";

export default function HistoryPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [jobs, setJobs] = useState<PentestJobSummary[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const response = await apiFetch<{ jobs: PentestJobSummary[] }>("/api/pentest/history");
        setJobs(response.jobs);
      } catch (loadError) {
        if (loadError instanceof ApiError && loadError.status === 401) {
          router.replace("/login");
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Unable to load history.");
      } finally {
        setPageLoading(false);
      }
    })();
  }, [router, user]);

  if (isLoading || (!user && !isLoading) || pageLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-slate-300">
        <div className="inline-flex items-center gap-3 rounded-full border border-stroke bg-white/5 px-5 py-3">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading pentest history...
        </div>
      </main>
    );
  }

  return (
    <AppShell
      title="Execution History"
      subtitle="Browse every pentest run, compare durations, and open detailed evidence."
    >
      <div className="space-y-6">
        {error ? (
          <div className="rounded-[24px] border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        <HistoryTable jobs={jobs} />
      </div>
    </AppShell>
  );
}
