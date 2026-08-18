"use client";

import { motion } from "framer-motion";
import { AppBrandRow } from "@/components/AppBrandRow";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  /** Show app icon + name above the page title (desktop home/settings hero) */
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative mb-8 flex flex-wrap items-end justify-between gap-4"
    >
      <div
        className="pointer-events-none absolute -left-6 -top-8 size-36 rounded-full bg-violet-400/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-4 top-0 size-28 rounded-full bg-accent/15 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative">
        {showBrand && (
          <div className="mb-4 hidden lg:block">
            <AppBrandRow size={44} showTagline />
          </div>
        )}
        {eyebrow && (
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary/80">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
          <span className="gradient-text">{title}</span>
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-lg leading-relaxed text-ink/60">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </motion.header>
  );
}
