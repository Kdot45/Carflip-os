"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/nav/AuthGuard";
import { FeaturedDealCard, DealRow, marginPct } from "@/components/dashboard/ProjectCard";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { PageSpinner } from "@/components/ui/Spinner";
import { Gauge } from "@/components/ui/Gauge";
import { formatCurrency } from "@/lib/format";
import { api } from "@/lib/api";
import { ProjectListItem, ProjectStatus } from "@/lib/types";
import clsx from "@/lib/clsx";

const STATUS_FILTERS: { value: ProjectStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "lead", label: "Lead" },
  { value: "bought", label: "Bought" },
  { value: "repairing", label: "Repairing" },
  { value: "listed", label: "Listed" },
  { value: "sold", label: "Sold" },
  { value: "abandoned", label: "Abandoned" },
];

function DashboardContent() {
  const [projects, setProjects] = useState<ProjectListItem[] | null>(null);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");
  const [sort, setSort] = useState<"created_at" | "profit" | "asking_price">("created_at");

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ sort, order: "desc" });
    if (statusFilter !== "all") params.set("status", statusFilter);

    api.get<{ projects: ProjectListItem[] }>(`/projects?${params.toString()}`).then((res) => {
      if (!cancelled) setProjects(res.projects);
    });
    return () => {
      cancelled = true;
    };
  }, [statusFilter, sort]);

  const stats = useMemo(() => {
    if (!projects || projects.length === 0) return null;
    const margins = projects.map(marginPct).filter((m): m is number => m !== null);
    const avgMargin = margins.length > 0 ? margins.reduce((a, b) => a + b, 0) / margins.length : null;
    const totalProfit = projects.reduce((sum, p) => sum + (p.expectedProfitAtAsking ?? 0), 0);
    return { avgMargin, totalProfit, count: projects.length };
  }, [projects]);

  if (!projects) return <PageSpinner />;

  const [featured, ...rest] = projects;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-extrabold tracking-tight text-ink-50">Your deals</h1>
        <Link href="/new-deal">
          <Button size="sm">+ New Deal</Button>
        </Link>
      </div>

      {stats && (
        <div className="brushed relative mb-4 grid grid-cols-[auto_1fr] items-center gap-4 rounded-2xl border border-ink-500 bg-gradient-to-b from-ink-700 via-ink-800 to-ink-900 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(0,0,0,0.4)]">
          <span className="absolute left-2 top-2 h-1 w-1 rounded-full bg-gradient-to-br from-ink-300 to-ink-800" />
          <span className="absolute right-2 top-2 h-1 w-1 rounded-full bg-gradient-to-br from-ink-300 to-ink-800" />
          <span className="absolute bottom-2 left-2 h-1 w-1 rounded-full bg-gradient-to-br from-ink-300 to-ink-800" />
          <span className="absolute bottom-2 right-2 h-1 w-1 rounded-full bg-gradient-to-br from-ink-300 to-ink-800" />
          <Gauge
            fillPct={stats.avgMargin !== null ? Math.min(100, (stats.avgMargin / 40) * 100) : 0}
            valueLabel={stats.avgMargin !== null ? `${stats.avgMargin.toFixed(0)}%` : "—"}
            caption="Avg Margin"
            tone="teal"
          />
          <div className="flex flex-col gap-2">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wide text-ink-300">Deals shown</p>
              <p className="font-mono text-lg font-extrabold text-ink-50">{String(stats.count).padStart(2, "0")}</p>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wide text-ink-300">Total projected profit</p>
              <p className="font-mono text-lg font-extrabold text-accent-500 [text-shadow:0_0_10px_rgba(255,139,61,0.4)]">
                {formatCurrency(stats.totalProfit)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-1 gap-1.5 overflow-x-auto pb-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={clsx(
                "whitespace-nowrap rounded-full px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wide transition-colors",
                statusFilter === f.value ? "bg-accent-500 text-ink-950" : "bg-ink-700 text-ink-200 hover:bg-ink-600"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="w-auto shrink-0"
        >
          <option value="created_at">Newest</option>
          <option value="profit">Profit</option>
          <option value="asking_price">Asking price</option>
        </Select>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-500 py-16 text-center">
          <p className="text-ink-300">No deals yet.</p>
          <Link href="/new-deal" className="mt-2 inline-block font-medium text-accent-500">
            Add your first deal →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <FeaturedDealCard project={featured} />
          {rest.length > 0 && (
            <div className="divide-y divide-ink-600 overflow-hidden rounded-2xl border border-ink-500">
              {rest.map((p) => (
                <DealRow key={p.id} project={p} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
