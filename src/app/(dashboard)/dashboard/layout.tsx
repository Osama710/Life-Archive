"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Compass,
  Home,
  Plus,
  Settings,
} from "lucide-react";
import { useFamily } from "@/context/FamilyContext";
import { useDisplayName } from "@/hooks/useDisplayName";
import { DashboardPageTransition } from "@/components/DashboardPageTransition";
import { DashboardMobileHeader } from "@/components/DashboardMobileHeader";

const explorePaths = [
  "/dashboard/more",
  "/dashboard/calendar",
  "/dashboard/search",
  "/dashboard/family",
  "/dashboard/growth",
  "/dashboard/on-this-day",
  "/dashboard/letters",
  "/dashboard/collections",
];

const mobileNavigation = [
  { label: "Home", href: "/dashboard", icon: Home, className: "col-start-1" },
  { label: "Timeline", href: "/dashboard/timeline", icon: BookOpen, className: "col-start-2" },
  { label: "Explore", href: "/dashboard/more", icon: Compass, className: "col-start-4" },
  { label: "You", href: "/dashboard/settings", icon: Settings, className: "col-start-5" },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  if (href === "/dashboard/more") {
    return (
      explorePaths.some((path) => pathname.startsWith(path)) ||
      /^\/dashboard\/collections\/[^/]+/.test(pathname)
    );
  }
  if (href === "/dashboard/settings") {
    return pathname.startsWith("/dashboard/settings");
  }
  return pathname.startsWith(href);
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { family, isLoading: familyLoading } = useFamily();
  const { displayName } = useDisplayName();
  const needsSetup = !familyLoading && !family;
  const fabHref = needsSetup ? "/onboarding" : "/dashboard/memory/create";
  const fabLabel = needsSetup ? "Set up family archive" : "Add memory";

  return (
    <div className="relative mx-auto min-h-dvh max-w-lg text-ink">
      <main id="main-content" className="pb-24">
        <DashboardMobileHeader displayName={displayName} />
        <div className="px-4 py-5">
          <DashboardPageTransition>{children}</DashboardPageTransition>
        </div>
      </main>

      <nav
        aria-label="App navigation"
        className="fixed inset-x-0 bottom-0 z-40 mx-auto grid max-w-lg grid-cols-5 border-t border-white/70 bg-white/90 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl"
      >
        {mobileNavigation.map(({ label, href, icon: Icon, className }) => {
          const active = isActive(pathname, href);

          return (
            <div key={href} className={`${className} row-start-1`}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-12 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition ${
                  active ? "text-primary" : "text-ink/45"
                }`}
              >
                <Icon aria-hidden="true" size={21} strokeWidth={active ? 2.5 : 2} />
                {label}
              </Link>
            </div>
          );
        })}

        <Link
          href={fabHref}
          aria-label={fabLabel}
          className="absolute left-1/2 top-0 flex size-14 -translate-x-1/2 -translate-y-5 items-center justify-center rounded-full bg-gradient-brand text-white shadow-lift ring-4 ring-cream"
        >
          <Plus aria-hidden="true" size={26} />
        </Link>
      </nav>
    </div>
  );
}
