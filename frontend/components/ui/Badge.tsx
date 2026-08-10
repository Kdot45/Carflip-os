import clsx from "@/lib/clsx";
import { DealLabel, ProjectStatus, Severity } from "@/lib/types";

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "good" | "marginal" | "bad" | "accent";
}) {
  const toneClasses: Record<string, string> = {
    neutral: "bg-slate-100 text-slate-700",
    good: "bg-emerald-50 text-good",
    marginal: "bg-amber-50 text-marginal",
    bad: "bg-red-50 text-bad",
    accent: "bg-accent-50 text-accent-700",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        toneClasses[tone]
      )}
    >
      {children}
    </span>
  );
}

const STATUS_LABELS: Record<ProjectStatus, string> = {
  lead: "Lead",
  bought: "Bought",
  repairing: "Repairing",
  listed: "Listed",
  sold: "Sold",
  abandoned: "Abandoned",
};

const STATUS_TONE: Record<ProjectStatus, "neutral" | "good" | "marginal" | "bad" | "accent"> = {
  lead: "neutral",
  bought: "accent",
  repairing: "marginal",
  listed: "accent",
  sold: "good",
  abandoned: "bad",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{STATUS_LABELS[status]}</Badge>;
}

const DEAL_LABEL_TEXT: Record<DealLabel, string> = {
  good: "Good deal",
  marginal: "Marginal",
  bad: "Bad deal",
  unknown: "Add resale price",
};

export function DealLabelBadge({ label }: { label: DealLabel }) {
  const tone = label === "good" ? "good" : label === "marginal" ? "marginal" : label === "bad" ? "bad" : "neutral";
  return <Badge tone={tone}>{DEAL_LABEL_TEXT[label]}</Badge>;
}

const SEVERITY_TONE: Record<Severity, "bad" | "marginal" | "neutral"> = {
  safety: "bad",
  required: "marginal",
  cosmetic: "neutral",
};

const SEVERITY_LABEL: Record<Severity, string> = {
  safety: "Safety",
  required: "Required",
  cosmetic: "Cosmetic",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return <Badge tone={SEVERITY_TONE[severity]}>{SEVERITY_LABEL[severity]}</Badge>;
}
