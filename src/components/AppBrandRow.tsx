"use client";

import Link from "next/link";
import { AppIcon } from "@/components/BrandLogo";
import { BRAND } from "@/lib/brand";

interface AppBrandRowProps {
  size?: number;
  showTagline?: boolean;
  href?: string;
  className?: string;
}

export function AppBrandRow({
  size = 36,
  showTagline = false,
  href,
  className = "",
}: AppBrandRowProps) {
  const content = (
    <>
      <AppIcon size={size} className="shrink-0" />
      <div className="min-w-0">
        <p className="truncate font-display text-base font-bold tracking-tight text-ink sm:text-lg">
          {BRAND.name}
        </p>
        {showTagline && (
          <p className="truncate text-xs font-medium text-ink/45">{BRAND.tagline}</p>
        )}
      </div>
    </>
  );

  const rowClass = `flex items-center gap-3 ${className}`;

  if (href) {
    return (
      <Link href={href} className={`${rowClass} transition-opacity hover:opacity-80`}>
        {content}
      </Link>
    );
  }

  return <div className={rowClass}>{content}</div>;
}
