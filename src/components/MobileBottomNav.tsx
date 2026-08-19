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

const navItems: {
  label: string;
  href: string;
  icon: LucideIcon;
  slot: "left" | "right";
}[] = [
  { label: "Home", href: "/dashboard", icon: Home, slot: "left" },
  { label: "Timeline", href: "/dashboard/timeline", icon: BookOpen, slot: "left" },
  { label: "Explore", href: "/dashboard/more", icon: Compass, slot: "right" },
  { label: "You", href: "/dashboard/settings", icon: Settings, slot: "right" },
];

/** Matches the + button (48px) mapped into the 390-unit-wide viewBox */
const FAB_RADIUS = 24;
const FAB_CENTER_X = 195;

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

function NavTab({
  label,
  href,
  icon: Icon,
  active,
}: {
  label: string;
  href: string;
  icon: LucideIcon;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex flex-col items-center justify-center gap-1 py-2 transition-colors ${
        active ? "text-ink" : "text-ink/35"
      }`}
    >
      <Icon aria-hidden="true" size={22} strokeWidth={active ? 2.25 : 1.75} />
      <span className={`text-[10px] tracking-tight ${active ? "font-semibold" : "font-medium"}`}>
        {label}
      </span>
    </Link>
  );
}

interface MobileBottomNavProps {
  fabHref: string;
  fabLabel: string;
}

export function MobileBottomNav({ fabHref, fabLabel }: MobileBottomNavProps) {
  const pathname = usePathname();
  const left = navItems.filter((item) => item.slot === "left");
  const right = navItems.filter((item) => item.slot === "right");

  const arcStart = FAB_CENTER_X - FAB_RADIUS;
  const arcEnd = FAB_CENTER_X + FAB_RADIUS;
  const borderPath = `M 0 1 H ${arcStart} A ${FAB_RADIUS} ${FAB_RADIUS} 0 0 1 ${arcEnd} 1 H 390`;

  return (
    <nav aria-label="App navigation" className="fixed inset-x-0 bottom-0 z-40 bg-cream">
      {/* Top border: flat edges, then semicircle under the + button */}
      <svg
        className="block h-8 w-full"
        viewBox="0 0 390 32"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d={borderPath}
          fill="none"
          stroke="rgba(26, 22, 37, 0.1)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="relative grid grid-cols-5 items-end px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {left.map((item) => (
          <NavTab key={item.href} {...item} active={isActive(pathname, item.href)} />
        ))}

        <div className="relative flex justify-center">
          <Link
            href={fabHref}
            aria-label={fabLabel}
            className="absolute -top-6 z-10 flex size-12 items-center justify-center rounded-full bg-gradient-brand text-white shadow-[0_4px_16px_rgba(124,58,237,0.28)] transition active:scale-95"
          >
            <Plus aria-hidden="true" size={22} strokeWidth={2.5} />
          </Link>
        </div>

        {right.map((item) => (
          <NavTab key={item.href} {...item} active={isActive(pathname, item.href)} />
        ))}
      </div>
    </nav>
  );
}
