"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/nav/AuthGuard";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { PageSpinner } from "@/components/ui/Spinner";
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

  if (!projects) return <PageSpinner />;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Your deals</h1>
        <Link href="/new-deal">
          <Button size="sm">+ New Deal</Button>
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-1 gap-1.5 overflow-x-auto pb-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={clsx(
                "whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                statusFilter === f.value
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
        <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center">
          <p className="text-slate-500">No deals yet.</p>
          <Link href="/new-deal" className="mt-2 inline-block font-medium text-accent-600">
            Add your first deal →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
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
