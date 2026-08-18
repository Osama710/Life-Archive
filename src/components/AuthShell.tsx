"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AUTH_TAGLINES } from "@/lib/quotes";
import { MeshBackground } from "@/components/MeshBackground";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  const [tagline, setTagline] = useState<string>(AUTH_TAGLINES[0]);

  useEffect(() => {
    setTagline(AUTH_TAGLINES[Math.floor(Math.random() * AUTH_TAGLINES.length)]!);
  }, []);

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <MeshBackground />
      <div className="relative mx-auto flex min-h-dvh max-w-6xl flex-col lg:flex-row">
        <motion.aside
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col justify-between px-6 py-10 sm:px-10 lg:w-[42%] lg:py-14"
        >
          <div>
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-gradient-brand text-lg shadow-lift">
                📖
              </span>
              <span className="font-display text-xl font-bold tracking-tight text-ink">
                Life Archive
              </span>
            </Link>
          </div>

          <div className="my-10 hidden lg:block">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-display text-4xl font-bold leading-tight tracking-tight text-ink xl:text-5xl"
            >
              {tagline}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="mt-4 max-w-sm text-lg leading-relaxed text-ink/60"
            >
              Save the moments that actually matter — messy, magical, and very
              you.
            </motion.p>
          </div>

          <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink/40">
            Built for families who get it
          </p>
        </motion.aside>

        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-1 items-center justify-center px-4 pb-10 sm:px-8 lg:pb-14"
        >
          <div className="glass-card w-full max-w-md p-6 sm:p-8">
            <div className="mb-8 text-center lg:text-left">
              <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
                {title}
              </h1>
              <p className="mt-2 text-ink/60">{subtitle}</p>
            </div>
            {children}
          </div>
        </motion.main>
      </div>
    </div>
  );
}
