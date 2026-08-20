export const BRAND = {
  name: "Life Archive",
  shortName: "Life Archive",
  tagline: "Your family story, kept close",
  colors: {
    primary: "#7C3AED",
    ink: "#1A1625",
    cream: "#FDF8F3",
  },
  icons: {
    favicon: "/favicon.png",
    pwa192: "/icon-192.png",
    pwa512: "/icon-512.png",
    maskable: "/icon-maskable.png",
  },
  svg: {
    primary: "/brand/svg/life-archive-primary.svg",
    mark: "/brand/svg/life-archive-mark.svg",
    icon: "/brand/svg/life-archive-icon.svg",
    monochrome: "/brand/svg/life-archive-monochrome.svg",
    reversed: "/brand/svg/life-archive-reversed.svg",
  },
  logos: {
    primary: "/brand/logo-primary-560.png",
    primaryLarge: "/brand/logo-primary-1120.png",
    mark: "/brand/logo-mark-192.png",
    markLarge: "/brand/logo-mark-560.png",
    icon512: "/brand/logo-icon-512.png",
    icon1024: "/brand/logo-icon-1024.png",
  },
} as const;

export type BrandLogoVariant = "primary" | "mark" | "icon" | "reversed";

export const LOGO_SOURCES: Record<
  BrandLogoVariant,
  { svg: string; png: string }
> = {
  primary: { svg: BRAND.svg.primary, png: BRAND.logos.primaryLarge },
  mark: { svg: BRAND.svg.mark, png: BRAND.logos.mark },
  icon: { svg: BRAND.svg.icon, png: BRAND.logos.icon512 },
  reversed: { svg: BRAND.svg.reversed, png: BRAND.logos.mark },
};
