"use client";

import { useEffect, useRef } from "react";
import type { PentestLogEntry } from "@/types/pentest";
import { formatDateTime } from "@/lib/time";

interface LiveLogPanelProps {
  logs: PentestLogEntry[];
}

export function LiveLogPanel({ logs }: LiveLogPanelProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    element.scrollTop = element.scrollHeight;
  }, [logs]);

  return (
    <section className="glass-panel rounded-[28px] border border-stroke p-6 shadow-panel">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Live Logs</h2>
          <p className="mt-1 text-sm text-slate-400">
            Incremental worker logs stream here over Socket.IO without a page refresh.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-emerald-200">
          <span className="h-2 w-2 rounded-full bg-emerald-300" />
          Stream
        </div>
      </div>

      <div
        ref={containerRef}
        className="terminal-scrollbar mt-5 h-[420px] space-y-3 overflow-y-auto rounded-3xl border border-stroke bg-slate-950/90 p-4 font-mono text-sm"
      >
        {logs.length ? (
          logs.map((entry) => (
            <div
              key={entry.id}
              className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 text-slate-300"
            >
              <p className="text-xs uppercase tracking-[0.22em] text-teal-300">{entry.stage}</p>
              <p className="mt-1 leading-6 text-slate-200">{entry.message}</p>
              <p className="mt-2 text-xs text-slate-500">{formatDateTime(entry.createdAt)}</p>
            </div>
          ))
        ) : (
          <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-stroke text-center text-sm text-slate-500">
            Logs will appear here once a pentest job begins execution.
          </div>
        )}
      </div>
    </section>
  );
}
