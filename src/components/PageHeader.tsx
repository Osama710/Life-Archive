"use client";

import { motion } from "framer-motion";
import { AppBrandRow } from "@/components/AppBrandRow";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  showBrand?: boolean;
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
  showBrand = false,
}: PageHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="mb-7 flex flex-wrap items-end justify-between gap-4"
    >
      <div>
        {showBrand && (
          <div className="mb-4 hidden lg:block">
            <AppBrandRow size={44} showTagline />
          </div>
        )}
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-ink/45">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-[2rem] font-bold leading-tight tracking-tight text-ink sm:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-md text-base leading-relaxed text-ink/55">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </motion.header>
  );
}
