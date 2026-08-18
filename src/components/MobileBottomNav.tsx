"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { BookOpen, Compass, Home, Plus, Settings } from "lucide-react";

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

const mobileNavigation: {
  label: string;
  href: string;
  icon: LucideIcon;
}[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Timeline", href: "/dashboard/timeline", icon: BookOpen },
  { label: "Explore", href: "/dashboard/more", icon: Compass },
  { label: "You", href: "/dashboard/settings", icon: Settings },
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

interface MobileBottomNavProps {
  fabHref: string;
  fabLabel: string;
}

export function MobileBottomNav({ fabHref, fabLabel }: MobileBottomNavProps) {
  const pathname = usePathname();
  const leftItems = mobileNavigation.slice(0, 2);
  const rightItems = mobileNavigation.slice(2);

  return (
    <div className="bottom-nav-shell fixed inset-x-0 bottom-0 z-40 mx-auto max-w-lg px-3 pb-[max(0.65rem,env(safe-area-inset-bottom))]">
      <div className="relative">
        <Link
          href={fabHref}
          aria-label={fabLabel}
          className="bottom-nav-fab absolute left-1/2 top-0 z-30 flex size-[3.35rem] -translate-x-1/2 -translate-y-[42%] items-center justify-center rounded-full bg-gradient-brand text-white shadow-[0_10px_28px_rgba(124,58,237,0.35)] ring-[5px] ring-cream/95 transition active:scale-95"
        >
          <Plus aria-hidden="true" size={24} strokeWidth={2.75} />
        </Link>

        <nav
          aria-label="App navigation"
          className="bottom-nav-bar relative overflow-visible rounded-[1.65rem] px-1 pb-1.5 pt-4"
        >
          <div
            className="bottom-nav-notch pointer-events-none absolute left-1/2 top-0 z-10 h-[1.65rem] w-[4.75rem] -translate-x-1/2 -translate-y-[38%] rounded-full"
            aria-hidden="true"
          />

          <div className="grid grid-cols-4 items-end">
            {leftItems.map(({ label, href, icon: Icon }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`bottom-nav-item flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-1 text-[10px] font-semibold transition ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-ink/45 hover:text-ink/70"
                  }`}
                >
                  <Icon aria-hidden="true" size={20} strokeWidth={active ? 2.5 : 2} />
                  {label}
                </Link>
              );
            })}
            {rightItems.map(({ label, href, icon: Icon }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`bottom-nav-item flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-1 text-[10px] font-semibold transition ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-ink/45 hover:text-ink/70"
                  }`}
                >
                  <Icon aria-hidden="true" size={20} strokeWidth={active ? 2.5 : 2} />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
