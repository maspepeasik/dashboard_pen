"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { History, LayoutDashboard, LogOut, Radar } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";

interface AppShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function AppShell({ title, subtitle, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="glass-panel sticky top-4 z-20 mb-8 rounded-[28px] border border-stroke px-5 py-4 shadow-panel">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400/80 to-orange-400/70 text-slate-950">
                <Radar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-slate-400">
                  Pentest Automation Control Plane
                </p>
                <h1 className="text-2xl font-semibold text-white">{title}</h1>
                <p className="text-sm text-slate-400">{subtitle}</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <nav className="flex items-center gap-2 rounded-full border border-stroke bg-white/5 p-1">
                {[
                  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
                  { href: "/history", label: "History", icon: History }
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition",
                      pathname.startsWith(item.href)
                        ? "bg-white text-slate-950"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-3 rounded-2xl border border-stroke bg-white/5 px-4 py-2.5">
                <div>
                  <p className="text-sm font-medium text-white">{user?.name ?? "Operator"}</p>
                  <p className="text-xs text-slate-400">{user?.email ?? "No active session"}</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-xl border border-stroke px-3 py-2 text-sm text-slate-300 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
