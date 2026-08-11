import clsx from "@/lib/clsx";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("rounded-2xl border border-ink-500 bg-ink-800 p-4 sm:p-5", className)}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold text-ink-50">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-ink-200">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
