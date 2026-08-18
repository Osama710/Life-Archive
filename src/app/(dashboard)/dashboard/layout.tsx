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

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
    router.refresh();
  };

  return (
    <div className="min-h-dvh bg-stone-50 text-stone-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-stone-200 bg-white px-5 py-6 lg:flex">
        <Link href="/dashboard" className="mb-10 px-3">
          <span className="font-serif text-2xl font-bold text-primary">
            Life Archive
          </span>
          <span className="mt-1 block text-xs tracking-wide text-stone-500">
            Your family story, kept close
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
                className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${
                  active
                    ? "bg-blue-50 text-primary"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-950"
                }`}
              >
                <Icon aria-hidden="true" size={19} />
                {label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={handleSignOut}
          className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-stone-600 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut aria-hidden="true" size={19} />
          Sign out
        </button>
      </aside>

      <main id="main-content" className="pb-24 lg:ml-72 lg:pb-0">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </div>
      </main>

      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-stone-200 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden"
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
                className={`flex min-h-12 flex-col items-center justify-center gap-1 text-[11px] font-medium ${
                  active ? "text-primary" : "text-stone-500"
                }`}
              >
                <Icon aria-hidden="true" size={20} />
                {label}
              </Link>
            </div>
          );
        })}
        <Link
          href="/dashboard/memory/create"
          aria-label="Add memory"
          className="absolute left-1/2 top-0 flex size-14 -translate-x-1/2 -translate-y-5 items-center justify-center rounded-full bg-primary text-white shadow-lg ring-4 ring-stone-50"
        >
          <Plus aria-hidden="true" size={26} />
        </Link>
      </nav>
    </div>
  );
}
