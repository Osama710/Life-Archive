const DISMISS_KEY = "life-archive.pwa-install-dismissed";
const DISMISS_MS = 14 * 24 * 60 * 60 * 1000;

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    // iOS Safari standalone
    ("standalone" in window.navigator &&
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true)
  );
}

export function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function isAndroid(): boolean {
  if (typeof window === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
}

export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  return isIOS() || isAndroid() || window.innerWidth < 768;
}

export function wasInstallPromptDismissed(): boolean {
  if (typeof window === "undefined") return true;
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const dismissedAt = Number(raw);
  if (Number.isNaN(dismissedAt)) return false;
  return Date.now() - dismissedAt < DISMISS_MS;
}

export function dismissInstallPrompt(): void {
  localStorage.setItem(DISMISS_KEY, String(Date.now()));
}

export type InstallPromptMode = "native" | "ios" | "android-manual";
