"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { AppBrandRow } from "@/components/AppBrandRow";

interface DashboardMobileHeaderProps {
  displayName?: string;
}

export function DashboardMobileHeader({ displayName }: DashboardMobileHeaderProps) {
  return (
    <header className="app-chrome sticky top-0 z-20 border-b shadow-[0_1px_0_rgba(26,22,37,0.04)]">
      <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <AppBrandRow href="/dashboard" size={32} />
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/search"
            aria-label="Search memories"
            className="flex size-10 items-center justify-center rounded-full text-ink/50 transition hover:bg-ink/[0.04] hover:text-ink"
          >
            <Search size={20} strokeWidth={2} />
          </Link>
          {displayName && (
            <Link
              href="/dashboard/settings"
              aria-label="Settings"
              className="flex size-10 items-center justify-center rounded-full bg-ink text-xs font-bold text-white"
            >
              {displayName.slice(0, 1).toUpperCase()}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
