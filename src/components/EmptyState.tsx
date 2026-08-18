"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/Button";

interface EmptyStateProps {
  emoji?: string;
  title: string;
  subtitle: string;
  cta?: string;
  href?: string;
  onAction?: () => void;
}

export function EmptyState({
  emoji = "✨",
  title,
  subtitle,
  cta,
  href,
  onAction,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="surface-card px-6 py-12 text-center sm:px-10"
    >
      <span className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-violet-500/10 text-3xl">
        {emoji}
      </span>
      <h3 className="font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink/55">{subtitle}</p>
      {cta && href && (
        <div className="mt-6">
          <Link href={href}>
            <Button>{cta}</Button>
          </Link>
        </div>
      )}
      {cta && onAction && !href && (
        <div className="mt-6">
          <Button onClick={onAction}>{cta}</Button>
        </div>
      )}
    </motion.div>
  );
}
