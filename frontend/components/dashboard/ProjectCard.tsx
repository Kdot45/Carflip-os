import Link from "next/link";
import { ProjectListItem } from "@/lib/types";
import { formatCurrency, formatMiles } from "@/lib/format";
import clsx from "@/lib/clsx";

const STATUS_LABELS: Record<string, string> = {
  lead: "Lead",
  bought: "Bought",
  repairing: "Repairing",
  listed: "Listed",
  sold: "Sold",
  abandoned: "Abandoned",
};

function marginPct(project: ProjectListItem): number | null {
  if (project.expectedResalePrice === null || project.expectedProfitAtAsking === null) return null;
  if (project.expectedResalePrice <= 0) return null;
  return (project.expectedProfitAtAsking / project.expectedResalePrice) * 100;
}

function vehicleTitle(project: ProjectListItem): string {
  return `${project.year} ${project.make} ${project.model}${project.trim ? ` ${project.trim}` : ""}`;
}

/** The top result in the current sort/filter gets the hero treatment —
 * oversized price, its own tag, everything else in a tighter list below. */
export function FeaturedDealCard({ project }: { project: ProjectListItem }) {
  const margin = marginPct(project);
  const profit = project.expectedProfitAtAsking;

  return (
    <Link href={`/projects/${project.id}`} className="block">
      <div className="relative overflow-hidden rounded-2xl border border-ink-500 bg-gradient-to-br from-ink-700 to-ink-800 p-4 sm:p-5">
        <div
          className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,122,26,0.14), transparent 70%)" }}
        />
        <div className="relative flex items-start justify-between gap-2">
          <span className="rounded-md border border-ink-400 bg-gradient-to-b from-ink-600 to-ink-800 px-2 py-1 font-mono text-[11px] font-bold uppercase tracking-wide text-ink-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            {STATUS_LABELS[project.status] ?? project.status}
          </span>
          {margin !== null && (
            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wide text-good">
              <span className="h-1.5 w-1.5 rounded-full bg-good shadow-[0_0_6px_rgba(53,208,192,0.8)]" />
              {margin.toFixed(1)}%
            </span>
          )}
        </div>

        <p className="relative mt-2.5 text-lg font-extrabold tracking-tight text-ink-50">{vehicleTitle(project)}</p>
        <p className="relative mt-0.5 text-sm text-ink-200">
          {formatMiles(project.miles)} &middot; {project.zipForDeal}
        </p>

        <div className="relative mt-3 flex flex-wrap items-baseline gap-2">
          <span className="font-mono text-4xl font-extrabold tracking-tight text-white">
            {formatCurrency(project.suggestedMaxBid)}
          </span>
          <span className="font-mono text-[11px] uppercase tracking-wide text-ink-300">suggested max bid</span>
        </div>

        <div className="relative mt-3 flex gap-5 border-t border-ink-500 pt-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wide text-ink-300">Asking</p>
            <p className="font-mono text-sm font-bold text-ink-50">{formatCurrency(project.askingPrice)}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wide text-ink-300">Profit</p>
            <p className={clsx("font-mono text-sm font-bold", profit !== null && profit >= 0 ? "text-good" : "text-ink-50")}>
              {formatCurrency(profit)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

/** Flatter, Linear-style row for everything after the featured deal. */
export function DealRow({ project }: { project: ProjectListItem }) {
  const profit = project.expectedProfitAtAsking;

  return (
    <Link href={`/projects/${project.id}`} className="block">
      <div className="flex items-center gap-3 bg-ink-800 px-3.5 py-3 transition-colors hover:bg-ink-700">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink-50">{vehicleTitle(project)}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-300">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ink-300" />
            {STATUS_LABELS[project.status] ?? project.status} &middot; {formatMiles(project.miles)}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-mono text-sm font-bold text-ink-50">{formatCurrency(project.askingPrice)}</p>
          {profit !== null && (
            <p className={clsx("font-mono text-xs font-semibold", profit >= 0 ? "text-good" : "text-bad")}>
              {profit >= 0 ? "+" : ""}
              {formatCurrency(profit)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

export { marginPct };
