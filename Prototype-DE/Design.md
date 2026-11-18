# Design System: Tovna24 (ទៅណា២៤)

## Brand
Cambodia travel guide: places to visit, eat, and stay.
Friendly, modern, photo-led. Khmer first, with English and 中文.

## Stack
- UI components: [shadcn/ui](https://ui.shadcn.com/)
- Styling: Tailwind CSS + CSS variables (tokens below)
- Icons: lucide-react

## Typography
- English: Google Sans
- Khmer: Kantumruy Pro (fallback: Noto Sans Khmer, Battambang)
- Chinese: Noto Sans SC

```css
font-family: "Google Sans", "Kantumruy Pro", "Noto Sans SC", system-ui, sans-serif;
```

### Type scale
```
 TOKEN     SIZE   WEIGHT   LINE-HEIGHT   USE
 --------  -----  -------  ------------  ---------------------------------
 display   40px   600      1.2           Hero title
 h1        32px   600      1.25          Page title
 h2        24px   600      1.3           Section title
 h3        20px   600      1.4           Card title, subsections
 body      16px   400      1.7           Paragraphs, UI text
 small     14px   400      1.7           Address, hours, meta (Khmer minimum)
 caption   12px   500      1.5           Badges, counts (English/numbers only)
```
Khmer override: headings use line-height 1.5 or more, because the stacked
marks above and below the line get clipped at 1.2.

### Weights
```
 400 Regular  ──  body, addresses, descriptions
 500 Medium   ──  badges, captions, nav items
 600 Semibold ──  all headings, buttons, card titles
 (no 700+, keeps the look light and friendly)
```

### Typography rules
- Latin font goes first in the stack, so Khmer falls through to Kantumruy Pro automatically
- Minimum size for Khmer text: 14px (12px is for English and numbers only)
- Do not set letter-spacing on Khmer text
- Do not use fixed widths on text containers; Khmer, English and Chinese lengths differ a lot
- Do not use all-caps for headings (it doesn't exist in Khmer)
- Text color comes from tokens only: `text` for main text, `text-muted` for secondary

## Colors
No pure white (#FFFFFF) or pure black (#000000) anywhere, including text on
buttons and image overlays.

### Light mode
| Role            | Value    | Use for                                           |
|-----------------|----------|---------------------------------------------------|
| background      | #F1F2FB  | Page background (soft indigo-tinted white)        |
| surface         | #F8F8FE  | Cards, header, footer, inputs (lighter than page) |
| surface-raised  | #F8F8FE  | Dropdowns, modals (add a soft shadow)             |
| border          | #D9DCF0  | Dividers, card outlines                           |
| text            | #1B1D2E  | Headings and body (soft indigo-black)             |
| text-muted      | #636880  | Addresses, hours, view counts                     |
| primary         | #5C6BF3  | Brand color, icons, large UI, active states       |
| primary-strong  | #4A58D8  | Text links, small accents                         |
| primary-button  | #4A58D8  | Button fill                                       |
| primary-hover   | #3F4BC4  | Hover / pressed                                   |
| primary-tint    | #E6E9FD  | Tags, selected states                             |
| primary-border  | #C5CBF8  | Outlines on tinted elements                       |
| on-primary      | #F8F8FE  | Text on buttons                                   |
| rating          | #F59E0B  | Stars                                             |
| success         | #16A34A  | "24 hours" badge                                  |
| danger          | #DC2626  | Errors                                            |

### Dark mode (Facebook-style)
Neutral dark grays. Depth comes from lighter surfaces, not shadows.

| Role            | Value    | Use for                                           |
|-----------------|----------|---------------------------------------------------|
| background      | #18191A  | Page background                                   |
| surface         | #242526  | Cards, header, footer, inputs                     |
| surface-raised  | #3A3B3C  | Dropdowns, modals, hovered cards                  |
| border          | #3E4042  | Dividers, card outlines                           |
| text            | #E4E6EB  | Headings and body                                 |
| text-muted      | #B0B3B8  | Addresses, hours, view counts                     |
| primary         | #5C6BF3  | Brand color, icons, large UI                      |
| primary-strong  | #8C98F8  | Text links, small accents (lightened for contrast)|
| primary-button  | #4A58D8  | Button fill                                       |
| primary-hover   | #A5AFFA  | Link hover (buttons go to #5C6BF3)                |
| primary-tint    | #2B2E4A  | Tags, selected states                             |
| primary-border  | #3A4296  | Outlines on tinted elements                       |
| on-primary      | #F8F8FE  | Text on buttons                                   |
| rating          | #FBBF24  | Stars                                             |
| success         | #4ADE80  | "24 hours" badge                                  |
| danger          | #F87171  | Errors                                            |

### Color rules
- Use `primary-strong` for small text; use `primary` only for large or bold elements
- Primary is an accent (buttons, links, active states). Never a full-page background
- Surfaces are lighter than the page in both modes
- Always use the variables; never hardcode colors in components
- No new colors outside these tables

## Spacing and shape
- 4px base: 4, 8, 12, 16, 24, 32, 48, 64
- Radius: 8px buttons and inputs, 12px cards, 999px badges/tags
- Light mode: `0 1px 3px rgba(27,29,46,0.08)` on cards, slightly stronger on hover
- Dark mode: no shadows

## Layout
- Mobile-first; breakpoints 640 / 768 / 1024 / 1280
- Max content width 1200px, centered
- Safe-area padding (viewport-fit=cover): `env(safe-area-inset-*)`
- Header: logo, date, login / sign up, language switcher (ភាសាខ្មែរ / English / 中文), theme toggle
- Nav: Home, Promotions, Visit, Food, Hotels, Services, Events, Blog
- Home = stacked sections: title + horizontal row of place cards

## Components (shadcn)
| Need                   | shadcn component                      |
|------------------------|---------------------------------------|
| Buttons                | Button                                |
| Place card             | Card + AspectRatio + Badge            |
| Category / hours tags  | Badge                                 |
| Search                 | Input                                 |
| Language switcher      | DropdownMenu or Select                |
| Desktop nav            | NavigationMenu                        |
| Mobile nav             | Sheet                                 |
| Card rows              | Carousel                              |
| Loading                | Skeleton                              |
| Toasts                 | Sonner                                |

**Button**
- Primary: `primary-button` fill, `on-primary` text, 44px tall, 16px horizontal padding, 8px radius
- Secondary: `surface` fill, 1px `primary` border, `primary-strong` text
- Hover: `primary-hover`. Focus: 2px `primary` ring, 2px offset

**Place card**
- Image on top (4:3), 12px radius, `surface` background
- Province label, name, address (`text-muted`), category tag (`primary-tint` bg, `primary-strong` text)
- Badge "24 hours" in `success`; rating star in `rating`
- Footer row: likes, comments, views in `text-muted`

**Nav item:** `text-muted`; active = `primary-strong` text with a 2px `primary` underline.
**Input / search:** `surface` bg, 1px `border`, 1px `primary` ring on focus.

## Do / Don't
- Do keep every label available in all 3 languages; avoid fixed text widths
- Do let photos carry the visual weight; keep UI chrome quiet
- Do keep one primary action per view
- Don't use #FFFFFF or #000000 anywhere
- Don't put small text in `primary` (#5C6BF3); use `primary-strong`
- Don't show rating or hours when data is missing

## CSS variables
```css
:root {
  --bg: #F1F2FB;
  --surface: #F8F8FE;
  --surface-raised: #F8F8FE;
  --border: #D9DCF0;
  --text: #1B1D2E;
  --text-muted: #636880;
  --primary: #5C6BF3;
  --primary-strong: #4A58D8;
  --primary-button: #4A58D8;
  --primary-hover: #3F4BC4;
  --primary-tint: #E6E9FD;
  --primary-border: #C5CBF8;
  --on-primary: #F8F8FE;
  --rating: #F59E0B;
  --success: #16A34A;
  --danger: #DC2626;
  color-scheme: light;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #18191A;
    --surface: #242526;
    --surface-raised: #3A3B3C;
    --border: #3E4042;
    --text: #E4E6EB;
    --text-muted: #B0B3B8;
    --primary-strong: #8C98F8;
    --primary-hover: #A5AFFA;
    --primary-tint: #2B2E4A;
    --primary-border: #3A4296;
    --rating: #FBBF24;
    --success: #4ADE80;
    --danger: #F87171;
    color-scheme: dark;
  }
}

:root[data-theme="dark"] {
  --bg: #18191A;
  --surface: #242526;
  --surface-raised: #3A3B3C;
  --border: #3E4042;
  --text: #E4E6EB;
  --text-muted: #B0B3B8;
  --primary-strong: #8C98F8;
  --primary-hover: #A5AFFA;
  --primary-tint: #2B2E4A;
  --primary-border: #3A4296;
  --rating: #FBBF24;
  --success: #4ADE80;
  --danger: #F87171;
  color-scheme: dark;
}

/* shadcn aliases: components read these names */
:root {
  --background: var(--bg);
  --foreground: var(--text);
  --card: var(--surface);
  --card-foreground: var(--text);
  --popover: var(--surface-raised);
  --popover-foreground: var(--text);
  --primary-foreground: var(--on-primary);
  --secondary: var(--primary-tint);
  --secondary-foreground: var(--primary-strong);
  --muted: var(--primary-tint);
  --muted-foreground: var(--text-muted);
  --accent: var(--primary-tint);
  --accent-foreground: var(--text);
  --destructive: var(--danger);
  --input: var(--border);
  --ring: var(--primary);
  --radius: 0.75rem;
}
```