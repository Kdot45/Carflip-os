export function BottomActionBar({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-20 border-t border-ink-500 bg-ink-900/95 px-4 py-3 backdrop-blur sm:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-2">{children}</div>
    </div>
  );
}
