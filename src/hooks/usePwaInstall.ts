"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type BeforeInstallPromptEvent,
  type InstallPromptMode,
  dismissInstallPrompt,
  isAndroid,
  isIOS,
  isMobileDevice,
  isStandalone,
  wasInstallPromptDismissed,
} from "@/lib/pwa";

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<InstallPromptMode | null>(null);
  const [installing, setInstalling] = useState(false);
  const nativePromptReceived = useRef(false);

  useEffect(() => {
    if (!isMobileDevice() || isStandalone() || wasInstallPromptDismissed()) {
      return;
    }

    let fallbackTimer: ReturnType<typeof setTimeout> | undefined;

    const showPrompt = (nextMode: InstallPromptMode) => {
      setMode(nextMode);
      setVisible(true);
    };

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      nativePromptReceived.current = true;
      const promptEvent = event as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      if (fallbackTimer) clearTimeout(fallbackTimer);
      setTimeout(() => showPrompt("native"), 1200);
    };

    const onInstalled = () => {
      setVisible(false);
      setDeferredPrompt(null);
      localStorage.removeItem("life-archive.pwa-install-dismissed");
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    // iOS has no beforeinstallprompt — show Share → Add to Home Screen guide
    if (isIOS()) {
      fallbackTimer = setTimeout(() => showPrompt("ios"), 2200);
    } else if (isAndroid()) {
      fallbackTimer = setTimeout(() => {
        if (!nativePromptReceived.current) {
          showPrompt("android-manual");
        }
      }, 5000);
    }

    return () => {
      if (fallbackTimer) clearTimeout(fallbackTimer);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return false;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setVisible(false);
        setDeferredPrompt(null);
        return true;
      }
      return false;
    } finally {
      setInstalling(false);
    }
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    dismissInstallPrompt();
    setVisible(false);
  }, []);

  return {
    visible,
    mode,
    installing,
    canNativeInstall: mode === "native" && !!deferredPrompt,
    install,
    dismiss,
  };
}
