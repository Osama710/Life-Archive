"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { LOADER_QUOTES } from "@/lib/quotes";

interface LoaderProps {
  fullScreen?: boolean;
  label?: string;
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function Loader({
  fullScreen = false,
  label = "Loading",
  message,
  size = "md",
}: LoaderProps) {
  const [quote, setQuote] = useState<string>(LOADER_QUOTES[0]);

  useEffect(() => {
    if (message) return;
    setQuote(LOADER_QUOTES[Math.floor(Math.random() * LOADER_QUOTES.length)]!);
  }, [message]);

  const ringSize = size === "sm" ? "size-8" : size === "lg" ? "size-16" : "size-12";

  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 px-6 ${
        fullScreen ? "min-h-dvh" : "min-h-[40dvh] py-12"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="relative">
        <motion.div
          className={`${ringSize} rounded-full bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-accent opacity-20 blur-md`}
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className={`absolute inset-0 ${ringSize} rounded-full border-[3px] border-transparent border-t-violet-500 border-r-fuchsia-400`}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
          aria-hidden="true"
        />
      </div>
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="max-w-xs text-center text-sm font-medium text-ink/55"
      >
        {message ?? quote}
      </motion.p>
      <span className="sr-only">{label}</span>
    </div>
  );
}
