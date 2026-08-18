"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { AppBrandRow } from "@/components/AppBrandRow";

interface DashboardMobileHeaderProps {
  displayName?: string;
}

export function DashboardMobileHeader({ displayName }: DashboardMobileHeaderProps) {
  return (
    <header className="app-chrome sticky top-0 z-20 border-b border-ink/5">
      <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <AppBrandRow href="/dashboard" size={32} />
        <div className="flex items-center gap-1.5">
          <Link
            href="/dashboard/search"
            aria-label="Search memories"
            className="flex size-10 items-center justify-center rounded-xl border border-ink/5 bg-white/50 text-ink/55 transition hover:border-primary/15 hover:text-primary"
          >
            <Search size={20} />
          </Link>
          {displayName && (
            <Link
              href="/dashboard/settings"
              aria-label="Settings"
              className="flex size-10 items-center justify-center rounded-xl bg-gradient-brand text-xs font-bold text-white shadow-soft"
            >
              {displayName.slice(0, 1).toUpperCase()}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
