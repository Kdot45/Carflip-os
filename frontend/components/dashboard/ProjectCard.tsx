import Link from "next/link";
import { ProjectListItem } from "@/lib/types";
import { formatCurrency, formatMiles } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import clsx from "@/lib/clsx";

export function ProjectCard({ project }: { project: ProjectListItem }) {
  const profit = project.expectedProfitAtAsking;
  const profitTone = profit === null ? "text-slate-500" : profit >= 0 ? "text-good" : "text-bad";

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-slate-900">
              {project.year} {project.make} {project.model}
              {project.trim ? ` ${project.trim}` : ""}
            </h3>
            <p className="mt-0.5 text-sm text-slate-500">
              {formatMiles(project.miles)} · {project.zipForDeal}
            </p>
          </div>
          <StatusBadge status={project.status} />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center">
          <div>
            <p className="text-xs text-slate-500">Asking</p>
            <p className="text-sm font-semibold text-slate-900">{formatCurrency(project.askingPrice)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Max bid</p>
            <p className="text-sm font-semibold text-slate-900">{formatCurrency(project.suggestedMaxBid)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Profit</p>
            <p className={clsx("text-sm font-semibold", profitTone)}>{formatCurrency(profit)}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
