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
      aria-label={label}
      className={`flex items-center justify-center rounded-full transition-all duration-200 active:scale-95 ${
        active
          ? "gap-2 bg-primary px-4 py-2.5 text-white shadow-[0_4px_14px_rgba(124,58,237,0.35)]"
          : "size-11 text-ink/35 hover:text-ink/55"
      }`}
    >
      <Icon aria-hidden="true" size={20} strokeWidth={active ? 2.25 : 1.75} />
      {active && <span className="text-xs font-semibold">{label}</span>}
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
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto mx-auto flex max-w-lg items-center gap-3">
        <nav
          aria-label="App navigation"
          className="flex min-w-0 flex-1 items-center justify-between rounded-full border border-ink/[0.06] bg-white px-2 py-2 shadow-[0_8px_32px_rgba(26,22,37,0.1)]"
        >
          {navItems.map((item) => (
            <NavTab key={item.href} {...item} active={isActive(pathname, item.href)} />
          ))}
        </nav>

        <Link
          href={fabHref}
          aria-label={fabLabel}
          className="flex size-14 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-white shadow-[0_8px_28px_rgba(124,58,237,0.38)] transition active:scale-95"
        >
          <Plus aria-hidden="true" size={24} strokeWidth={2.5} />
        </Link>
      </div>
    </div>
  );
}
