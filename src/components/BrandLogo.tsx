"use client";

import Image from "next/image";
import { useState } from "react";
import { BRAND, LOGO_SOURCES, type BrandLogoVariant } from "@/lib/brand";

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  /** Height in pixels for mark/icon; primary uses width-based scaling */
  height?: number;
  className?: string;
  priority?: boolean;
}

export function BrandLogo({
  variant = "mark",
  height = 40,
  className = "",
  priority = false,
}: BrandLogoProps) {
  const { svg, png } = LOGO_SOURCES[variant];
  const [src, setSrc] = useState<string>(svg);

  if (variant === "primary") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={BRAND.name}
        onError={() => setSrc(png)}
        className={`h-auto w-auto object-contain ${className}`}
        style={{ maxHeight: height * 1.4 }}
        fetchPriority={priority ? "high" : undefined}
      />
    );
  }

  if (src.endsWith(".svg")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={`${BRAND.name} logo`}
        width={height}
        height={height}
        onError={() => setSrc(png)}
        className={`object-contain ${className}`}
        style={{ width: height, height }}
        fetchPriority={priority ? "high" : undefined}
      />
    );
  }

  return (
    <Image
      src={png}
      alt={`${BRAND.name} logo`}
      width={height}
      height={height}
      priority={priority}
      className={`object-contain ${className}`}
      style={{ width: height, height }}
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

  if (src.endsWith(".svg")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={BRAND.name}
        width={size}
        height={size}
        onError={() => setSrc(BRAND.icons.pwa192)}
        className={`rounded-2xl object-contain shadow-soft ${className}`}
        style={{ width: size, height: size }}
        fetchPriority={priority ? "high" : undefined}
      />
    );
  }

  return (
    <Image
      src={BRAND.icons.pwa192}
      alt={BRAND.name}
      width={size}
      height={size}
      priority={priority}
      className={`rounded-2xl object-contain shadow-soft ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
