"use client";

import { AppBrandRow } from "@/components/AppBrandRow";

export function DashboardMobileHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/60 bg-cream/85 backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex w-full max-w-6xl items-center px-4 py-3 pt-[max(0.75rem,var(--safe-top))] sm:px-6">
        <AppBrandRow href="/dashboard" size={34} />
      </div>
    </header>
  );
}
