# Life Archive — Brand Sheet (Logo Design Brief)

Use this document to create logos, app icons, and wordmarks for **Life Archive** — a family memory PWA (Progressive Web App). The aesthetic is modern, warm, Gen-Z friendly, glassy, and emotional (not corporate or cold).

---

## App identity

| Field | Value |
|-------|-------|
| **App name** | Life Archive |
| **Short name** | Archive |
| **Tagline options** | "Your family story, kept close" · "Core memories only" · "Where your family's story lives forever" |
| **Product type** | Family memory archive — photos, stories, timeline, letters, growth records |
| **Audience** | Young families, Gen Z / millennials, warm & relatable tone |
| **Vibe** | Modern, soft, premium, nostalgic-but-fresh, not generic SaaS blue |

---

## Color palette (hex codes)

### Primary (use these most)

| Swatch | Name | Hex | RGB | Usage |
|--------|------|-----|-----|-------|
| 🟣 | **Primary Violet** | `#7C3AED` | 124, 58, 237 | Main brand color, icons, buttons, PWA theme bar |
| 🟣 | **Primary Dark** | `#6D28D9` | 109, 40, 217 | Depth, shadows, pressed states |
| 🩷 | **Fuchsia (gradient mid)** | `#EC4899` | 236, 72, 153 | Gradient middle tone |
| 🩷 | **Light Violet (gradient)** | `#A855F7` | 168, 85, 247 | Gradient highlight |
| 🪸 | **Accent Coral** | `#FF6B6B` | 255, 107, 107 | Warm accent, gradient end |
| ⬛ | **Ink (text dark)** | `#1A1625` | 26, 22, 37 | Wordmarks, dark logo marks |
| 🤍 | **Cream (background)** | `#FDF8F3` | 253, 248, 243 | Light backgrounds, icon padding |

### Secondary accents (optional in logo)

| Swatch | Name | Hex | RGB | Usage |
|--------|------|-----|-----|-------|
| 🌿 | **Mint** | `#34D399` | 52, 211, 153 | Soft ambient accent (background glows) |
| 🟣 | **Violet Soft** | `#8B5CF6` | 139, 92, 246 | Blob/glow effects at low opacity |
| 💜 | **Lavender Tint** | `#F6F0FF` | 246, 240, 255 | Soft background wash |

### Semantic (avoid in main logo unless needed)

| Name | Hex |
|------|-----|
| Success green | `#10B981` |
| Error red | `#EF4444` |
| Warning amber | `#F59E0B` |
| Warm orange | `#F97316` |

---

## Signature brand gradient

**Direction:** 135° (top-left → bottom-right)

**Primary brand gradient (most important):**
```
#7C3AED  →  #EC4899  →  #FF6B6B
Violet       Fuchsia       Coral
```

**Alternate button gradient:**
```
#7C3AED  →  #A855F7  →  #EC4899
```

**CSS reference:**
```css
background: linear-gradient(135deg, #7C3AED 0%, #EC4899 55%, #FF6B6B 100%);
```

Use this gradient for: app icon fills, logo marks, avatar placeholders, hero accents.

---

## Typography

| Role | Font | Style |
|------|------|-------|
| **Display / logo wordmark** | **Outfit** (Google Font) | Bold (700), tight letter-spacing (-2%) |
| **Body / UI** | **Plus Jakarta Sans** | Regular–Semibold |

**Wordmark example:** `Life Archive` in Outfit Bold, color `#1A1625` on cream, OR white on gradient background.

---

## Logo direction & concepts

### What to design
1. **Primary logo** — icon + wordmark (horizontal)
2. **App icon** — square, works at 512×512 and 192×192
3. **Monochrome version** — ink `#1A1625` on cream `#FDF8F3`
4. **Reversed version** — white/cream on violet `#7C3AED` or gradient

### Visual themes to explore (pick 1–2)
- **Open book / journal** — family stories, archiving memories
- **Heart + timeline dot** — emotional + chronological
- **Abstract “memory spark”** — soft star or glow orb in brand gradient
- **Photo frame with soft gradient border** — captures + preserves
- **Stacked layers / archive folder** — organized family history

### Style rules
- ✅ Rounded, friendly shapes (border-radius ~16–24px feel)
- ✅ Soft gradients, not flat corporate blue
- ✅ Clean, minimal, readable at small sizes
- ✅ Warm and human — for families, not enterprise
- ❌ No generic blue `#2563EB` tech-SaaS look
- ❌ No overly complex detail (must work at 48px app icon)
- ❌ No clip-art baby icons unless very refined

### Current placeholder
The app temporarily uses a 📖 emoji on a gradient square (`#7C3AED → #EC4899 → #FF6B6B`). Replace with a proper vector mark.

---

## App icon / PWA specs

| Spec | Value |
|------|-------|
| **Theme color (status bar — match app background)** | `#FDF8F3` |
| **Brand accent (buttons, not status bar)** | `#7C3AED` |
| **Background color (splash)** | `#FDF8F3` |
| **Required sizes** | 512×512 px, 192×192 px |
| **Maskable icon** | Keep important content in center 80% safe zone (Android adaptive icons crop edges) |
| **Format** | PNG with transparency OR solid cream `#FDF8F3` background |
| **Corner style** | Rounded square (iOS/Android apply their own rounding) |

---

## Background & glass aesthetic (for mockups)

The UI uses a **cream mesh background** with soft colored blobs:
- Violet glow: `#8B5CF6` at ~20% opacity
- Coral glow: `#FF6B6B` at ~15% opacity
- Mint glow: `#34D399` at ~12% opacity

Cards use **frosted glass**: white at ~78% opacity, soft shadow, rounded 24px corners.

When presenting the logo, mock it on `#FDF8F3` cream background for brand accuracy.

---

## Copy-paste prompt for ChatGPT / AI logo tools

```
Create a modern app logo and icon set for "Life Archive" — a family memory archive PWA.

BRAND COLORS (exact hex):
- Primary violet: #7C3AED
- Primary dark: #6D28D9
- Gradient mid fuchsia: #EC4899
- Gradient light violet: #A855F7
- Accent coral: #FF6B6B
- Text ink: #1A1625
- Background cream: #FDF8F3
- Optional mint accent: #34D399

SIGNATURE GRADIENT (135°): #7C3AED → #EC4899 → #FF6B6B

TYPOGRAPHY: Outfit Bold for wordmark, Plus Jakarta Sans for taglines.

STYLE: Modern, warm, Gen-Z friendly, soft rounded shapes, premium but emotional — NOT generic corporate blue. Think family memories, journaling, timeline, nostalgia. Glassy/soft aesthetic.

DELIVER:
1. Logo: icon + "Life Archive" wordmark (horizontal)
2. App icon 512×512 on cream #FDF8F3 background
3. App icon 192×192
4. Monochrome version (ink #1A1625 on cream)
5. Reversed version (white on gradient)

ICON CONCEPT: Open book, memory spark, or abstract archive symbol using the violet-to-coral gradient. Must be readable at 48px. Keep maskable safe zone (center 80%).

AVOID: Generic SaaS blue, clip-art babies, overly complex details, cold corporate look.
```

---

## Quick reference card

```
Primary:     #7C3AED
Dark:        #6D28D9
Fuchsia:     #EC4899
Coral:       #FF6B6B
Ink:         #1A1625
Cream:       #FDF8F3
Mint:        #34D399
Gradient:    #7C3AED → #EC4899 → #FF6B6B
Font:        Outfit (display) + Plus Jakarta Sans (body)
Theme bar:   #FDF8F3  (cream — blends with app; use #7C3AED for brand accents only)
```

---

*Life Archive · Brand sheet v1 · For logo & icon design*
