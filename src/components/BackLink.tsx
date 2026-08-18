import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface BackLinkProps {
  href: string;
  label?: string;
}

export function BackLink({ href, label = "Back" }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-primary transition hover:gap-2"
    >
      <ChevronLeft size={18} aria-hidden="true" />
      {label}
    </Link>
  );
}
