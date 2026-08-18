"use client";

import { useFamily } from "@/context/FamilyContext";
import { useDisplayName } from "@/hooks/useDisplayName";
import { DashboardPageTransition } from "@/components/DashboardPageTransition";
import { DashboardMobileHeader } from "@/components/DashboardMobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { family, isLoading: familyLoading } = useFamily();
  const { displayName } = useDisplayName();
  const needsSetup = !familyLoading && !family;
  const fabHref = needsSetup ? "/onboarding" : "/dashboard/memory/create";
  const fabLabel = needsSetup ? "Set up family archive" : "Add memory";

  return (
    <div className="relative mx-auto min-h-dvh max-w-lg text-ink">
      <main id="main-content" className="pb-[calc(5.25rem+env(safe-area-inset-bottom))]">
        <DashboardMobileHeader displayName={displayName} />
        <div className="px-4 py-5">
          <DashboardPageTransition>{children}</DashboardPageTransition>
        </div>
      </main>

      <MobileBottomNav fabHref={fabHref} fabLabel={fabLabel} />
    </div>
  );
}
