"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "@/lib/clsx";
import { useAuth } from "@/lib/auth-context";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/new-deal", label: "New Deal" },
  { href: "/settings", label: "Settings" },
];

export function TopNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 border-b border-ink-500/60 bg-ink-900/95 backdrop-blur relative">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-60"
        style={{
          background:
            "linear-gradient(90deg, transparent, #4a4d54 20%, #8b8e94 50%, #4a4d54 80%, transparent)",
        }}
      />
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-ink-400 bg-gradient-to-b from-ink-600 to-ink-800 shadow-[inset_0_0_0_2px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,139,61,0.15)]">
            <span className="font-mono text-[10px] font-extrabold text-accent-500">CF</span>
          </span>
          <span className="text-base font-extrabold tracking-tight text-ink-50">
            Car<span className="text-accent-500">Flip</span>
          </span>
        </Link>

        <nav className="flex items-center gap-0.5 sm:gap-1">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "rounded-lg px-2 py-2 font-mono text-xs font-medium uppercase tracking-wide transition-colors sm:px-3",
                pathname?.startsWith(link.href)
                  ? "bg-accent-500/10 text-accent-500"
                  : "text-ink-200 hover:bg-ink-700 hover:text-ink-50"
              )}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={logout}
            className="ml-0.5 rounded-lg px-2 py-2 font-mono text-xs font-medium uppercase tracking-wide text-ink-300 hover:bg-ink-700 hover:text-ink-50 sm:ml-2 sm:px-3"
          >
            Log out
          </button>
        </nav>
      </div>
    </header>
  );
}
