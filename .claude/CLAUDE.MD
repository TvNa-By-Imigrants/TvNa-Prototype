# TvNa — Project Review & Technical Specification

**Project Name:** TvNa — Community-Driven Place Discovery Platform  
**Authors:** LancD, ashxio, VorngViseth  
**Last Updated:** July 24, 2026  

---

## Executive Summary

**TvNa** (ត្វាណា — "Where to go?" in Khmer) is a community-driven web platform for discovering hangout spots and food places in **Phnom Penh, Cambodia**. It targets **Gen Z users (ages 16–25)**, specifically high school and university students who face the problem of "information is everywhere but there isn't a specific platform" to find places to go.

The platform categorizes places into three Khmer-named sections:
- **DerLg** (ដើរលេង) — "go hang out" (parks, bookstores, gaming venues)
- **NhamEy** (ញ៉ាំអី) — "eat what" (restaurants, food spots)
- **NhJolJit** (ចូលចិត្ត) — "favourites" (saved places)

Built as a **frontend-only static site** using vanilla HTML/CSS/JS with **Tailwind CSS v4** and **Leaflet.js** for interactive maps. No backend, no database, no framework — pure web standards with a custom fetch-based component injection system.

---

## System Architecture & File Tree

```
TvNa.v2/
├── .env                          # Google Maps API key (unused — Leaflet uses OSM)
├── .gitignore                    # node_modules, logs, OS files
├── package.json                  # Project config & build scripts
├── package-lock.json             # Dependency lock file
├── README.md                     # Minimal project readme
├── CLAUDE.md                     # This file — project review & specification
├── tailwind.config.js            # Empty (0 bytes) — all config in input.css
│
├── src/                          # Source files
│   ├── css/
│   │   └── input.css             # Tailwind entry + theme + component classes (428 lines)
│   ├── js/
│   │   ├── script.js             # Core: header/footer load, auth, tabs, cards (390 lines)
│   │   ├── data.js               # All data arrays & objects (92 lines)
│   │   ├── renderCards.js        # Card & feed post rendering functions (66 lines)
│   │   ├── community.js          # Community feed logic (44 lines)
│   │   ├── map.js                # Leaflet map + search (81 lines)
│   │   └── profile.js            # Profile page logic (78 lines)
│   ├── pages/
│   │   ├── index.html            # Home page with tabs (115 lines)
│   │   ├── community.html        # Facebook-style community feed (44 lines)
│   │   ├── map.html              # Interactive map page (51 lines)
│   │   ├── profile.html          # User profile page (71 lines)
│   │   └── favourited.html       # Favourites page (34 lines)
│   ├── components/
│   │   ├── header.html           # Nav header + mobile overlay + auth overlays (53 lines)
│   │   ├── footer.html           # Footer with links (11 lines)
│   │   ├── signin.html           # Sign-in modal (91 lines)
│   │   ├── signup.html           # Sign-up modal (108 lines)
│   │   └── addPlace.html         # Add place form overlay (63 lines)
│   └── assets/img/               # 24 WebP images (places, avatars, logos, social)
│
├── dist/                         # Build output
│   ├── css/output.css            # Compiled Tailwind CSS (minified)
│   ├── js/                       # Copied JS files
│   ├── pages/                    # Copied HTML files
│   └── assets/img/               # Copied images
│
└── node_modules/                 # tailwindcss + @tailwindcss/cli + dependencies
```

---

## Tech Stack

| Category | Technology | Version | Notes |
|----------|-----------|---------|-------|
| **CSS Framework** | Tailwind CSS | ^4.1.17 | v4 with `@import "tailwindcss"` syntax |
| **CLI** | @tailwindcss/cli | ^4.1.17 | Build tool for CSS compilation |
| **Maps** | Leaflet.js | 1.9.4 | Loaded via CDN (unpkg), OpenStreetMap tiles |
| **Icons** | Material Symbols Outlined | — | Google Fonts, loaded via CDN |
| **Module System** | ES Modules | Native | `type="module"` in script tags |
| **Runtime** | Node.js (dev) | — | For build tooling only |
| **Build Copy** | cpx | — | File copying (via npm scripts) |

**Notable:** No bundler (Webpack/Vite), no framework (React/Vue), no backend, no database. Pure vanilla HTML/CSS/JS with Tailwind.

---

## Dual-Theme Visual Identity & Design System

The visual identity operates seamlessly in both **Dark Mode** and **Light Mode** with smooth 500ms color transitions.

### Color Token Specifications

| Token Name | Dark Mode | Light Mode | Purpose |
| :--- | :--- | :--- | :--- |
| **Background** | `#121212` | `#F9FAFB` | Primary page canvas |
| **Text Primary** | `white` | `#080069` | Headings, card titles |
| **Card Background** | `#262626` | `white` | Card surfaces |
| **Card Description** | `#d1d5db` | `#374151` | Body text in cards |
| **Muted** | `oklch(62% 0.020 260)` | `oklch(68% 0.018 260)` | Subtle text, placeholders |
| **Footer Background** | `#171717` | `oklch(93% 0.034 272.788)` | Footer surface |
| **Sign-in Background** | `oklch(27.8% 0.033 256.848)` | `#F9FAFB` | Modal backgrounds |
| **Input Background** | `oklch(37.3% 0.034 259.733)` | `oklch(96.7% 0.003 264.542)` | Form input fields |

### Brand Colors

| Token | Hex | Usage |
| :--- | :--- | :--- |
| **Indigo (Primary)** | `#741EFF` | Buttons, active tabs, links, accents |
| **Hover Button** | `oklch(60.6% 0.25 292.717)` | Button hover state |
| **Hover Text** | `oklch(58.5% 0.233 277.117)` | Link hover state |

### Design Tokens

```css
@theme {
    --max-width: 1100px;
    --shadow: 0 5px 5px rgba(0,0,0,0.15);
}
```

### Custom Animations

| Class | Animation | Duration | Usage |
| :--- | :--- | :--- | :--- |
| `.animate-press` | Scale 1 → 0.96 → 1 | 120ms | Button press feedback |
| `.animated-slide` | Infinite 3-image carousel | 8s cycle | Home page hero slider |
| `.animated-slideIn` | Slide from left (-100% → 0) | 300ms | Mobile menu open |
| `.animated-slideOut` | Slide to left (0 → -100%) | 300ms | Mobile menu close |

### Global Transition

```css
* { @apply transition-colors duration-500; }
```

All elements smoothly transition colors when toggling between dark/light modes.

---

## Technical Implementation Details

### Component Loading System (No Framework)

The app uses a **custom fetch-based component injection** pattern:

1. **`script.js`** is loaded on every page via `<script type="module">`
2. On init, it fetches `header.html` and `footer.html` and injects them into `<div id="header">` and `<div id="footer">`
3. The header contains empty overlay containers (`signinOverlay`, `signupOverlay`) that get populated by additional fetches
4. Each page can load additional JS modules (e.g., `community.js`, `profile.js`, `map.js`)

```
Page Load → script.js init() → loadHeader() + loadFooter() → inject components
                                    ↓
                              loadAuth('signin') + loadAuth('signup')
                                    ↓
                              Page-specific modules (community.js, map.js, profile.js)
```

### Routing

**No router.** Navigation is via standard `<a href>` links between static HTML pages:

| Page | Path | Navigation Source |
| :--- | :--- | :--- |
| Home | `index.html` | Header nav "TvNa" |
| Community | `community.html` | Header nav "Community" |
| Map | `map.html` | Header nav "Map" |
| Profile | `profile.html?user=slug` | Community post usernames |
| Favourites | `favourited.html` | Header nav "Favourited" |

### Tab System (index.html)

Client-side tab switching using `data-target` attributes:
- Three tabs: `tvna` (home with carousels), `derlg` (hangout grid), `nhamey` (food grid)
- Clicking a tab shows/hides `<section>` elements with `.hidden-content` class
- Updates the main title text dynamically
- Hides the animated slider when not on the `tvna` tab
- First tab auto-clicks on page load

### Data Flow

```
data.js (static arrays) → renderCards.js / community.js / profile.js → DOM generation → HTML containers
```

All data is **static/hardcoded**. No API calls, no localStorage for user data. Theme preference is stored in `localStorage.theme`.

---

## Pages & Features

### Home Page (`index.html`)

- **Animated hero slider**: 3 images auto-rotating on an 8s cycle
- **Tab navigation**: TvNa / DerLg / NhamEy with Material Symbols icons
- **TvNa tab**: Two horizontal scrollable carousels (DerLg + NhamEy) with left/right scroll buttons (400px scroll amount)
- **DerLg tab**: Card grid of hangout places
- **NhamEy tab**: Card grid of food places
- **Cards**: 360×480px, image + title + description + "Jam Tv" (Go together) and "Tv Lv" (Go now) buttons

### Community Page (`community.html`)

- **Facebook-style single-column feed** (~500px centered)
- **Create post card**: "What's on your mind?" button (opens add-place overlay) + Photo/Place action buttons
- **Feed posts**: User avatar + name (clickable → profile), description, full-width image, Like/Comment/Share buttons
- **Floating "ADD PLACE" button**: Fixed bottom-right, opens add-place overlay
- **Profile linking**: Clicking username/avatar navigates to `profile.html?user=slug`

### Map Page (`map.html`)

- **Search bar**: Autocomplete dropdown filtering 8 Phnom Penh landmarks
- **Leaflet map**: Centered on Phnom Penh `[11.5564, 104.9282]`, zoom 13, OpenStreetMap tiles
- **8 markers**: Royal Palace, Central Market, Wat Phnom, Independence Monument, Sisowath Quay, Tuol Sleng Museum, Russian Market, AEON Mall
- **Interactions**: Type to filter → click result → map flies to location + opens popup
- **Z-index**: Map set to `z-0` to stay behind header (`z-50`) and mobile overlay (`z-9999`)

### Profile Page (`profile.html`)

- **Dynamic profile**: Loaded from URL query parameter `?user=slug`
- **Cover photo**: Colored background (per-profile hex color)
- **Avatar**: 120px circular, overlapping cover boundary
- **User info**: Name, username, bio, location, join date
- **Stats row**: Posts, Followers, Following counts
- **Posts feed**: Filters community posts by matching `profileSlug`
- **Edit profile button**: Non-functional (demo)
- **Not found state**: For invalid slugs, shows "User Not Found" with back link

### Favourites Page (`favourited.html`)

- **Card grid**: 1 col mobile, 2 cols sm, 3 cols lg
- **Favourited places**: Same card component as index page
- **Data**: Static `favouriteData` array from `data.js`

---

## Components

### Header (`header.html`)

- Sticky header with logo, brand name "TvNa" in indigo
- **Hamburger menu** (visible below `lg` breakpoint) for mobile
- **Theme toggle**: Dark/light mode with `localStorage` persistence
- **Desktop nav**: TvNa, Favourited, Community, Map links
- **Sign-in button**: Purple (#741EFF), opens sign-in modal
- **Mobile overlay**: Slide-in panel (animated with `animated-slideIn`/`animated-slideOut`)
- **Auth overlay containers**: Empty divs populated by `loadAuth()` fetches

### Footer (`footer.html`)

- Logo + links: About us, Facebook, Instagram, Contact
- Compact 12px text with indigo hover states

### Sign-in Modal (`signin.html`)

- Email/password fields with Material Symbols icons
- Show/hide password toggle
- "Remember me" checkbox, "Forgot password?" link
- Social login buttons (Google, Facebook) — non-functional
- "Sign up" link to switch to signup modal

### Sign-up Modal (`signup.html`)

- Username, email, password, confirm password fields
- **Password match validation**: Real-time comparison with error message
- Social login buttons — non-functional
- "Sign in" link to switch back to signin modal

### Add Place Form (`addPlace.html`)

- Form titled "HvKneaDerJmuy" (ហៅកន្លែងដ៏រីករាយ — "Call an interesting place")
- Fields: Name, Address, Category buttons (DerLg/NhamEy)
- **Image upload**: Drag-drop area with multi-image preview grid (3 cols mobile, 5 cols md+)
- Textarea for additional info (price range, hours, environment)
- "Save & Submit" button

---

## JavaScript Modules

### `script.js` — Core Module (390 lines)

Loaded on **every page**. Responsibilities:

| Function | Purpose |
| :--- | :--- |
| `init()` | Entry point — calls `loadHeader()` + `loadFooter()` |
| `loadHeader()` | Fetches `header.html`, injects into `#header`, initializes header logic |
| `loadFooter()` | Fetches `footer.html`, injects into `#footer` |
| `loadAuth(type)` | Fetches `signin.html`/`signup.html` into overlay containers |
| `initAuth(type)` | Wires close button + backdrop click to close modals |
| `initSignInButton()` | Opens sign-in overlay on button click |
| `initAuthSwitch()` | Toggles between signin/signup modals |
| `initHeader()` | Theme toggle (localStorage), hamburger menu open/close |
| `loadAddplace()` | Fetches add-place form, wires close button, image upload preview |
| Tab switching | `.tab-link` click handlers, show/hide tab content |
| Card rendering | Renders favourite, derlg, nhamey cards on DOMContentLoaded |
| Scroll buttons | Horizontal scroll with 400px amount, visibility toggle |
| Password toggle | Show/hide password on signin/signup forms |
| Password validation | Real-time password match checking on signup |

### `data.js` — Static Data Store (92 lines)

Exports all data arrays:

| Export | Type | Count | Description |
| :--- | :--- | :--- | :--- |
| `derlgData` | `Place[]` | 5 | Hangout places (Tatsuya Bookstore, Funnifun, Playroom, KohNorea, Coconut Park) |
| `nhameyData` | `Place[]` | 5 | Food places (MiMtes, Kaixin, Little Ceaser, Mi Teanh, Saj Ko Ang) |
| `favouriteData` | `Place[]` | 4 | Favourited items |
| `communityData` | `CommunityPost[]` | 4 | Community posts with user info + profileSlug |
| `profilesData` | `Object` | 4 | User profiles (chayy, dara, sophea, ashxioo) |

### `renderCards.js` — DOM Rendering (66 lines)

| Function | Purpose |
| :--- | :--- |
| `renderCards(data, container)` | Renders place cards (image, title, description, action buttons) |
| `renderCardsCommunity(data, container)` | Renders Facebook-style feed posts (avatar, name, description, image, like/comment/share) |

### `community.js` — Community Feed (44 lines)

- Injects "create post" card at top of `#CommunityFeed`
- Creates posts wrapper with `flex flex-col gap-5` layout
- Calls `renderCardsCommunity()` to render posts
- Wires create-post button to trigger the add-place overlay

### `map.js` — Map Logic (81 lines)

- Initializes Leaflet map centered on Phnom Penh
- Adds 8 markers with popups
- Implements search input with autocomplete dropdown
- `selectPlace(place)`: Flies to location (zoom 15, 0.8s animation) + opens popup + closes dropdown

### `profile.js` — Profile Page (78 lines)

- Reads `?user=slug` from URL params
- Populates cover color, avatar, name, username, bio, location, join date, stats
- Filters community posts by `profileSlug` and renders them
- Shows "User Not Found" state for invalid slugs with back link

---

## Data Model

### Place Object
```js
{
    title: string,           // Display name
    image: "../assets/img/xxx.webp",  // Relative image path
    description: string      // Place description
}
```

### Community Post Object
```js
{
    title: string,           // Post title
    image: string,           // Image path
    description: string,     // Post text content
    userName: string,        // Display name of author
    userPfp: string,         // Author avatar image path
    profileSlug: string      // URL slug for profile linking (e.g., "chayy")
}
```

### Profile Object
```js
{
    name: string,            // Full display name
    username: string,        // @handle
    bio: string,             // Short biography
    location: string,        // City, Country
    joinDate: string,        // "Month Year"
    followers: number,       // Follower count
    following: number,       // Following count
    posts: number,           // Post count
    pfp: string,             // Profile picture path
    cover: string            // Hex color for cover banner (e.g., "#741EFF")
}
```

### Map Place Object
```js
{
    name: string,            // Location name
    lat: number,             // Latitude
    lng: number,             // Longitude
    desc: string             // Short description
}
```

---

## Build Process

### npm Scripts

```json
"scripts": {
    "build-css": "tailwindcss -i ./src/css/input.css -o ./dist/css/output.css --minify",
    "watch-css": "tailwindcss -i ./src/css/input.css -o ./dist/css/output.css --watch",
    "copy-html": "cpx \"src/*.html\" dist/",
    "copy-js": "cpx \"src/js/**/*\" dist/js",
    "copy-assets": "cpx \"src/assets/**/*\" dist/assets",
    "build": "npm run build-css && npm run copy-html && npm run copy-js && npm run copy-assets",
    "dev": "npm run watch-css"
}
```

### Build Pipeline

1. **`build-css`** — Compiles Tailwind from `src/css/input.css` → `dist/css/output.css` (minified)
2. **`copy-html`** — Copies HTML files to `dist/`
3. **`copy-js`** — Copies `src/js/**/*` → `dist/js/`
4. **`copy-assets`** — Copies `src/assets/**/*` → `dist/assets/`

### Dev Mode

```
npm run dev    # Watches CSS for changes, auto-recompiles
```

No live-reload server — static files are opened directly or served separately.

---

## Component Classes Reference

All custom component classes defined in `@layer components`:

| Class | Usage | Key Styles |
| :--- | :--- | :--- |
| `.btn` | Primary buttons | Indigo bg, white text, rounded-full, shadow, hover darken |
| `.active-tab` | Active tab indicator | Indigo color + border (forced with `!important`) |
| `.card` | Place cards | 360×480px, rounded-xl, shadow, hover scale-105 |
| `.card-image` | Card images | Full width, 188px height, object-cover |
| `.card-body` | Card content area | Padding, flex column, gap |
| `.card-title` | Card titles | Large, semibold |
| `.card-description` | Card body text | Small, muted color, whitespace-normal |
| `.card-grid` | Card grid container | 1/2/3 cols responsive, gap-8 |
| `.feed-container` | Community feed wrapper | Max 550px, centered, flex column, gap-4 |
| `.create-post` | Create post card | Card-bg, rounded-xl, shadow, padding |
| `.create-post-btn` | "What's on your mind?" | Rounded pill, bg-input, hover effect |
| `.create-post-action` | Photo/Place buttons | Flex, gap, hover bg-input |
| `.feed-post` | Individual feed post | Card-bg, rounded-xl, shadow, overflow hidden |
| `.post-header` | Post top row | Flex, space-between, padding |
| `.post-description` | Post text | Padding, 15px font, line-height |
| `.post-image` | Post image | Full width, max 500px height, object-cover |
| `.post-actions` | Like/Comment/Share row | Flex, border-top, muted color |
| `.post-btn` | Action buttons | Flex-1, centered, hover effect |
| `.profile-cover` | Cover banner | Full width, 200px height, colored bg |
| `.profile-avatar` | Large avatar | 120px circle, border, shadow |
| `.profile-stats` | Stats row | Flex, gap, bold numbers |
| `.map-container` | Map wrapper | Full width, 60vh height, rounded, shadow |
| `.search-input` | Search bar | Full width, left padding for icon, focus ring |
| `.search-dropdown` | Search results | Absolute, card-bg, scrollable, shadow |
| `.search-dropdown-item` | Result items | Padding, hover effect, border-bottom |

---

## Git History & Contributors

### Contributors (3 people, 44 commits)

| Author | Commits | Role |
| :--- | :--- | :--- |
| **LancD** | 28 | Primary developer, merger |
| **ashxio** | 9 | Feature developer (community, favourites) |
| **VorngViseth** | 7 | Feature developer (sign-in, tabs, fixes) |

### Development Timeline

| Date | Milestone |
| :--- | :--- |
| Dec 10, 2024 | Initial commit |
| Dec 11–14 | Core structure, header, footer, main content |
| Dec 15–17 | Cards, tabs, TvNa tab, content fixes |
| Dec 18–20 | Sign-in/sign-up, favourites, community, add-place overlay |
| Dec 22 | Password validation, nav bar links |
| Dec 24–25 | Bug fixes, merge PRs |
| Jul 24, 2026 | Map page, profile page, community feed redesign |

### Branching Strategy

- `main` — Default branch, production-ready
- Feature branches: `Ashxio`, `Seth`
- Merged via GitHub Pull Requests

---

## Known Issues & Technical Debt

| Issue | Severity | Description |
| :--- | :--- | :--- |
| **Stale dist/ folder** | Medium | `copy-html` script pattern `src/*.html` doesn't match `src/pages/*.html`. Dist HTML files may be outdated. |
| **No backend** | Low | All data is static. Sign-in/sign-up forms don't authenticate. Social login buttons are non-functional. |
| **.env committed** | Medium | Google Maps API key is in the repo without being gitignored. Key appears unused (Leaflet uses OSM). |
| **No test suite** | Low | Zero testing infrastructure. |
| **No linter/formatter** | Low | No ESLint, Prettier, or similar config. |
| **Hardcoded data** | Low | All place data, community posts, and profiles are hardcoded arrays. |
| **Inconsistent naming** | Low | `claude.md` vs `CLAUDE.MD` (case sensitivity). |
| **Unused .env key** | Low | `GOOGLE_MAP_API_DEMO` is in `.env` but map page uses OpenStreetMap tiles. |

---

## Future Enhancements

- **Backend integration**: Connect to a REST API for dynamic data, real authentication, and persistent storage
- **User accounts**: Real sign-up/sign-in with JWT tokens, user-generated content
- **Search improvements**: Geocoding API for map search (Nominatim/OpenStreetMap)
- **Notifications**: Real-time updates for new community posts
- **PWA support**: Service worker for offline access, installable app
- **Testing**: Unit tests for JS modules, E2E tests for critical flows
- **CMS integration**: Admin panel for managing places, posts, and users
