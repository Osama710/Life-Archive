"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/Button";
import { usePwaInstall } from "@/hooks/usePwaInstall";

export function PwaInstallPrompt() {
  const { visible, mode, installing, canNativeInstall, install, dismiss } =
    usePwaInstall();

  return (
    <AnimatePresence>
      {visible && mode && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-ink/25 backdrop-blur-sm"
            onClick={dismiss}
            aria-hidden="true"
          />
          <motion.aside
            role="dialog"
            aria-labelledby="pwa-install-title"
            aria-describedby="pwa-install-desc"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-4 bottom-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.5rem))] z-[70] mx-auto max-w-md lg:bottom-8 lg:inset-x-auto lg:right-8 lg:left-auto"
          >
            <div className="glass-card relative overflow-hidden p-5 shadow-lift sm:p-6">
              <div
                className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-violet-400/20 blur-2xl"
                aria-hidden="true"
              />

              <button
                type="button"
                onClick={dismiss}
                className="absolute right-3 top-3 rounded-xl p-2 text-ink/40 transition hover:bg-white/70 hover:text-ink"
                aria-label="Dismiss install prompt"
              >
                <X size={18} />
              </button>

              <div className="flex items-start gap-4 pr-8">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-brand text-2xl shadow-soft">
                  📖
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/80">
                    Install app
                  </p>
                  <h2
                    id="pwa-install-title"
                    className="font-display text-xl font-bold tracking-tight text-ink"
                  >
                    Get Life Archive on your phone
                  </h2>
                </div>
              </div>

              <p id="pwa-install-desc" className="mt-4 text-sm leading-relaxed text-ink/60">
                {mode === "native" &&
                  "Install it like a real app — full screen, home screen icon, offline access. One tap."}
                {mode === "ios" &&
                  "On iPhone, install via Share → Add to Home Screen. It opens full-screen like a native app."}
                {mode === "android-manual" &&
                  "Tap your browser menu (⋮) and choose Install app or Add to Home screen."}
              </p>

              {mode === "ios" && (
                <ol className="mt-4 space-y-2 rounded-2xl bg-white/55 p-4 text-sm text-ink/70">
                  <li className="flex items-center gap-2">
                    <Share size={16} className="shrink-0 text-primary" aria-hidden />
                    1. Tap <strong>Share</strong> in Safari
                  </li>
                  <li>2. Scroll and tap <strong>Add to Home Screen</strong></li>
                  <li>3. Tap <strong>Add</strong> — you&apos;re in</li>
                </ol>
              )}

              {mode === "android-manual" && (
                <ol className="mt-4 space-y-2 rounded-2xl bg-white/55 p-4 text-sm text-ink/70">
                  <li>1. Tap the <strong>⋮</strong> menu (top right)</li>
                  <li>
                    2. Choose <strong>Install app</strong> or{" "}
                    <strong>Add to Home screen</strong>
                  </li>
                  <li>3. Confirm — opens like a native app</li>
                </ol>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                {canNativeInstall && (
                  <Button
                    type="button"
                    onClick={() => void install()}
                    disabled={installing}
                    className="gap-2"
                  >
                    <Download size={18} aria-hidden />
                    {installing ? "Installing…" : "Install now"}
                  </Button>
                )}
                <Button type="button" variant="secondary" onClick={dismiss}>
                  {canNativeInstall ? "Not now" : "Got it"}
                </Button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
