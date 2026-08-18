"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  Home,
  Library,
  LogOut,
  Plus,
  Search,
  Settings,
  Users,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useFamily } from "@/context/FamilyContext";
import { useDisplayName } from "@/hooks/useDisplayName";
import { DashboardPageTransition } from "@/components/DashboardPageTransition";
import { DashboardMobileHeader } from "@/components/DashboardMobileHeader";
import { BrandLogo } from "@/components/BrandLogo";
import { BRAND } from "@/lib/brand";

const navigation = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Timeline", href: "/dashboard/timeline", icon: BookOpen },
  { label: "Calendar", href: "/dashboard/calendar", icon: CalendarDays },
  { label: "Collections", href: "/dashboard/collections", icon: Library },
  { label: "Search", href: "/dashboard/search", icon: Search },
  { label: "Family", href: "/dashboard/family", icon: Users },
  { label: "On This Day", href: "/dashboard/on-this-day", icon: CalendarDays },
  { label: "Letters", href: "/dashboard/letters", icon: BookOpen },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

const mobileNavigation = [
  { ...navigation[0], className: "col-start-1" },
  { ...navigation[1], className: "col-start-2" },
  { ...navigation[3], className: "col-start-4" },
  { ...navigation[8], className: "col-start-5" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const { family, isLoading: familyLoading } = useFamily();
  const { displayName, initials } = useDisplayName();
  const needsSetup = !familyLoading && !family;
  const fabHref = needsSetup ? "/onboarding" : "/dashboard/memory/create";
  const fabLabel = needsSetup ? "Set up family archive" : "Add memory";

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
    router.refresh();
  };

  return (
    <div className="relative min-h-dvh text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-white/60 bg-white/70 px-5 py-6 backdrop-blur-xl lg:flex">
        <Link href="/dashboard" className="mb-8 block px-3">
          <BrandLogo variant="primary" height={34} />
          <span className="mt-2 block text-xs font-medium tracking-wide text-ink/45">
            {BRAND.tagline}
          </span>
        </Link>

        <nav aria-label="Main navigation" className="flex-1 space-y-1">
          {navigation.map(({ label, href, icon: Icon }) => {
            const active =
              href === "/dashboard"
                ? pathname === href
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-2xl px-3 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "nav-active"
                    : "text-ink/55 hover:bg-white/80 hover:text-ink"
                }`}
              >
                <Icon aria-hidden="true" size={19} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 space-y-2 border-t border-ink/5 pt-4">
          <div className="flex items-center gap-3 px-3 py-2">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-brand text-sm font-bold text-white shadow-soft">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">
                {displayName}
              </p>
              <p className="text-xs text-ink/45">Family archivist</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 text-sm font-semibold text-ink/55 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut aria-hidden="true" size={19} />
            Sign out
          </button>
        </div>
      </aside>

      <main id="main-content" className="pb-24 lg:ml-72 lg:pb-0">
        <DashboardMobileHeader />
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <DashboardPageTransition>{children}</DashboardPageTransition>
        </div>
      </main>

      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-white/70 bg-white/85 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden"
      >
        {mobileNavigation.map(({ label, href, icon: Icon, className }) => {
          const active =
            href === "/dashboard"
              ? pathname === href
              : pathname.startsWith(href);
          return (
            <div key={href} className={`${className} row-start-1`}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-12 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition ${
                  active ? "text-primary" : "text-ink/45"
                }`}
              >
                <Icon aria-hidden="true" size={20} />
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
