# Life Archive — Brand Assets

Static files in **`public/`** (not Cloudinary).

## Keep list (13 files)

| File | Why |
|------|-----|
| `favicon.png` | Browser tab |
| `icon-192.png` | PWA, Apple touch, SVG fallback |
| `icon-512.png` | PWA install & splash |
| `icon-maskable.png` | Android adaptive icon |
| `brand/svg/life-archive-primary.svg` | UI logo (sidebar, auth) |
| `brand/svg/life-archive-mark.svg` | Standalone mark |
| `brand/svg/life-archive-icon.svg` | In-app icon |
| `brand/svg/life-archive-monochrome.svg` | Future print/dark use |
| `brand/svg/life-archive-reversed.svg` | Future dark header |
| `brand/logo-primary-560.png` | PNG fallback if SVG fails |
| `brand/logo-mark-192.png` | PNG fallback if SVG fails |

## In code

```tsx
import { BrandLogo, AppIcon } from "@/components/BrandLogo";
```

SVG loads first; PNG fallback only on error.

## Cloudinary?

User memory photos only — never app branding.
