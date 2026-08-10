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
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500 text-sm font-bold text-white">
            CF
          </span>
          <span className="text-base font-semibold text-slate-900">CarFlip OS</span>
        </Link>

        <nav className="flex items-center gap-0.5 sm:gap-1">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "rounded-lg px-2 py-2 text-xs font-medium transition-colors sm:px-3 sm:text-sm",
                pathname?.startsWith(link.href)
                  ? "bg-accent-50 text-accent-700"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={logout}
            className="ml-0.5 rounded-lg px-2 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 sm:ml-2 sm:px-3 sm:text-sm"
          >
            Log out
          </button>
        </nav>
      </div>
    </header>
  );
}
