# Life Archive — Brand Assets

Generated from two master files:

| Source | Use |
|--------|-----|
| `assets/logo-icon-source.png` | Square book icon (transparent) |
| `assets/logo-primary-source.png` | Horizontal lockup with name |

## Regenerate all sizes

```bash
npm run brand:assets
```

## Outputs

- **PWA:** `favicon.png`, `icon-192.png`, `icon-512.png`, `icon-maskable.png`
- **Icon:** `logo-icon-1024.png`, `logo-icon-512.png`, `logo-mark-192.png`, `logo-mark-560.png`
- **Primary:** `logo-primary-560.png`, `logo-primary-1120.png`
- **SVG:** `svg/life-archive-*.svg` (wrappers referencing PNG masters)
