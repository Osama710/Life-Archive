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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card relative overflow-hidden px-6 py-14 text-center sm:px-10"
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-violet-400/10 blur-2xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-10 -left-6 size-28 rounded-full bg-accent/8 blur-2xl"
        aria-hidden="true"
      />
      <motion.span
        className="mb-4 inline-block text-5xl"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      >
        {emoji}
      </motion.span>
      <h3 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        {title}
      </h3>
      <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-ink/60">
        {subtitle}
      </p>
      {cta && href && (
        <div className="mt-8">
          <Link href={href}>
            <Button>{cta}</Button>
          </Link>
        </div>
      )}
      {cta && onAction && !href && (
        <div className="mt-8">
          <Button onClick={onAction}>{cta}</Button>
        </div>
      )}
    </motion.div>
  );
}
