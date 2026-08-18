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

/** Single outline: flat top → notch around FAB → flat top → rounded dock */
const DOCK_OUTLINE =
  "M 22 34 L 118 34 C 118 34 132 8 180 8 C 228 8 242 34 242 34 L 338 34 Q 352 34 352 48 L 352 66 Q 352 76 338 76 L 22 76 Q 8 76 8 66 L 8 48 Q 8 34 22 34 Z";

export function MobileBottomNav({ fabHref, fabLabel }: MobileBottomNavProps) {
  const pathname = usePathname();
  const leftItems = mobileNavigation.slice(0, 2);
  const rightItems = mobileNavigation.slice(2);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 mx-auto max-w-lg px-3 pb-[max(0.65rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto relative h-[4.75rem]">
        <svg
          className="absolute inset-0 h-full w-full drop-shadow-[0_-4px_20px_rgba(26,22,37,0.06)]"
          viewBox="0 0 360 84"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d={DOCK_OUTLINE} className="fill-cream" />
          <path
            d={DOCK_OUTLINE}
            fill="none"
            className="stroke-ink/[0.08]"
            strokeWidth="1.25"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <Link
          href={fabHref}
          aria-label={fabLabel}
          className="absolute left-1/2 top-0 z-20 flex size-[3.35rem] -translate-x-1/2 -translate-y-[38%] items-center justify-center rounded-full bg-gradient-brand text-white shadow-[0_10px_28px_rgba(124,58,237,0.32)] ring-[5px] ring-cream transition active:scale-95"
        >
          <Plus aria-hidden="true" size={24} strokeWidth={2.75} />
        </Link>

        <nav
          aria-label="App navigation"
          className="relative z-10 grid h-full grid-cols-4 items-end px-1 pb-2 pt-5"
        >
          {leftItems.map(({ label, href, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-1 text-[10px] font-semibold transition ${
                  active ? "bg-primary/10 text-primary" : "text-ink/45 hover:text-ink/70"
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
                className={`flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-1 text-[10px] font-semibold transition ${
                  active ? "bg-primary/10 text-primary" : "text-ink/45 hover:text-ink/70"
                }`}
              >
                <Icon aria-hidden="true" size={20} strokeWidth={active ? 2.5 : 2} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
