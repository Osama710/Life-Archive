"use client";

import { useState } from "react";
import { BRAND, LOGO_SOURCES, type BrandLogoVariant } from "@/lib/brand";

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  height?: number;
  className?: string;
  priority?: boolean;
}

function pngForHeight(height: number) {
  if (height <= 48) return BRAND.icons.favicon;
  if (height <= 192) return BRAND.logos.mark;
  if (height <= 512) return BRAND.logos.icon512;
  return BRAND.logos.icon1024;
}

export function BrandLogo({
  variant = "mark",
  height = 40,
  className = "",
  priority = false,
}: BrandLogoProps) {
  const { svg, png } = LOGO_SOURCES[variant];
  const [src, setSrc] = useState<string>(svg);
  const fallback = variant === "primary" ? png : pngForHeight(height);
  const width = variant === "primary" ? Math.round(height * 1.78) : height;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={BRAND.name}
      width={width}
      height={height}
      onError={() => {
        if (src !== fallback) setSrc(fallback);
      }}
      className={`object-contain ${className}`}
      style={{ width, height: variant === "primary" ? "auto" : height, maxHeight: height }}
      fetchPriority={priority ? "high" : undefined}
    />
  );
}

interface AppIconProps {
  size?: number;
  className?: string;
  priority?: boolean;
}

export function AppIcon({ size = 48, className = "", priority = false }: AppIconProps) {
  const [src, setSrc] = useState<string>(BRAND.svg.icon);
  const fallback =
    size <= 48
      ? BRAND.icons.favicon
      : size <= 192
        ? BRAND.icons.pwa192
        : size <= 512
          ? BRAND.icons.pwa512
          : BRAND.logos.icon1024;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={BRAND.name}
      width={size}
      height={size}
      onError={() => {
        if (src !== fallback) setSrc(fallback);
      }}
      className={`rounded-2xl object-contain ${className}`}
      style={{ width: size, height: size }}
      fetchPriority={priority ? "high" : undefined}
    />
  );
}
