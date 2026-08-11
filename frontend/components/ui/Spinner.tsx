import clsx from "@/lib/clsx";

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={clsx(
        "h-5 w-5 animate-spin rounded-full border-2 border-ink-500 border-t-accent-500",
        className
      )}
    />
  );
}

export function PageSpinner() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}
