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
  col: string;
}[] = [
  { label: "Home", href: "/dashboard", icon: Home, col: "col-start-1" },
  { label: "Timeline", href: "/dashboard/timeline", icon: BookOpen, col: "col-start-2" },
  { label: "Explore", href: "/dashboard/more", icon: Compass, col: "col-start-4" },
  { label: "You", href: "/dashboard/settings", icon: Settings, col: "col-start-5" },
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

function NavItem({
  label,
  href,
  icon: Icon,
  active,
  className,
}: {
  label: string;
  href: string;
  icon: LucideIcon;
  active: boolean;
  className: string;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`${className} flex min-h-[3.25rem] flex-col items-center justify-end gap-1 px-1 pb-1.5 pt-2 transition-colors`}
    >
      <Icon
        aria-hidden="true"
        size={22}
        strokeWidth={active ? 2.25 : 1.75}
        className={active ? "text-ink" : "text-ink/35"}
      />
      <span
        className={`text-[10px] font-medium tracking-tight ${
          active ? "text-ink" : "text-ink/40"
        }`}
      >
        {label}
      </span>
      <span
        aria-hidden="true"
        className={`h-0.5 rounded-full transition-all duration-200 ${
          active ? "w-5 bg-primary" : "w-0 bg-transparent"
        }`}
      />
    </Link>
  );
}

interface MobileBottomNavProps {
  fabHref: string;
  fabLabel: string;
}

export function MobileBottomNav({ fabHref, fabLabel }: MobileBottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="App navigation"
      className="app-chrome fixed inset-x-0 bottom-0 z-40 border-t shadow-[0_-4px_24px_rgba(26,22,37,0.04)]"
    >
      <div className="relative mx-auto grid max-w-lg grid-cols-5 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1">
        {mobileNavigation.map(({ label, href, icon, col }) => (
          <NavItem
            key={href}
            label={label}
            href={href}
            icon={icon}
            active={isActive(pathname, href)}
            className={col}
          />
        ))}

        <div className="col-start-3 flex items-end justify-center pb-1">
          <Link
            href={fabHref}
            aria-label={fabLabel}
            className="flex size-[3.25rem] -translate-y-3 items-center justify-center rounded-full bg-gradient-brand text-white shadow-lift transition active:scale-95"
          >
            <Plus aria-hidden="true" size={24} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </nav>
  );
}
