# TvNa — Project Review & Technical Specification

**Project Name:** TvNa — Community-Driven Place Discovery Platform  
**Authors:** LancD, ashxio, VorngViseth  
**Last Updated:** July 25, 2026  

---

## Executive Summary

**TvNa** (ត្វាណា — "Where to go?" in Khmer) is a community-driven web platform for discovering hangout spots and food places in **Phnom Penh, Cambodia**. It targets **Gen Z users (ages 16–25)**, specifically high school and university students who face the problem of "information is everywhere but there isn't a specific platform" to find places to go.

The platform categorizes places into three Khmer-named sections:
- **DerLg** (ដើរលេង) — "go hang out" (parks, bookstores, gaming venues)
- **NhamEy** (ញ៉ាំអី) — "eat what" (restaurants, food spots)
- **NhJolJit** (ចូលចិត្ត) — "favourites" (saved places)

Built as a **React SPA** using **React 19 + Vite 8 + Tailwind CSS v4 + React Router v7**. No backend, no database — frontend-only with static mock data and Google Gemini AI integration for plan generation.

---

## System Architecture & File Tree

```
TvNa/
├── .env                          # Google Gemini API key
├── .gitignore                    # node_modules, dist, .env
├── package.json                  # Project config & build scripts
├── package-lock.json             # Dependency lock file
├── vite.config.js                # Vite + Tailwind plugin config
├── CLAUDE.md                     # This file — project review & specification
│
├── src/
│   ├── main.jsx                  # Entry point — BrowserRouter + LanguageProvider
│   ├── App.jsx                   # Route definitions + Header/Footer layout
│   ├── index.css                 # Tailwind entry + theme tokens + component classes
│   │
│   ├── pages/
│   │   ├── Home.jsx              # Home page with tabs, carousels, hero slider
│   │   ├── PlanRequest.jsx       # AI plan request page (form + TvNaAI modal)
│   │   ├── PlanResult.jsx        # Generated plan results with itinerary timeline
│   │   ├── Map.jsx               # Interactive Leaflet map with search
│   │   ├── Community.jsx         # Community feed with modal post form
│   │   ├── Profile.jsx           # User profile page (dynamic slug routing)
│   │   └── Favourited.jsx        # Saved/favourited places page
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx        # Sticky header, nav, theme toggle, language toggle
│   │   │   └── Footer.jsx        # Footer with links
│   │   ├── cards/
│   │   │   ├── PlaceCard.jsx     # Place card with "Go Now" / "Saved" buttons
│   │   │   ├── FeedPostCard.jsx  # Community feed post card
│   │   │   └── ItineraryStepCard.jsx  # Plan itinerary step with remove button
│   │   ├── plan/
│   │   │   ├── IntentForm.jsx    # Quick plan form (budget, group, duration, etc.)
│   │   │   ├── JuyRoForm.jsx     # "Find a place" form (category, tvrean, area)
│   │   │   ├── MoodSelector.jsx  # Mood picker for plan generation
│   │   │   ├── AddStopPicker.jsx # Add stop picker for itinerary
│   │   │   ├── ItineraryTimeline.jsx  # Plan result timeline with add/remove
│   │   │   ├── AIThinkingState.jsx    # Loading animation for AI generation
│   │   │   └── TvNaAIModal.jsx   # Free-text AI chat modal
│   │   └── modals/
│   │       ├── SignInModal.jsx   # Sign-in modal
│   │       ├── SignUpModal.jsx   # Sign-up modal
│   │       └── AddPlaceModal.jsx # Add place form overlay
│   │
│   ├── contexts/
│   │   └── LanguageContext.jsx   # EN/KH language provider with translations
│   │
│   ├── services/
│   │   ├── mockData.js           # Static data arrays (places, posts, profiles)
│   │   ├── gemini.js             # Google Gemini AI API integration
│   │   ├── suggestionEngine.js   # Place suggestion/filtering engine
│   │   └── mapLinks.js           # Google Maps search link generator
│   │
│   └── assets/                   # WebP images (places, avatars, logos)
│
└── dist/                         # Production build output
```

---

## Tech Stack

| Category | Technology | Version | Notes |
|----------|-----------|---------|-------|
| **Framework** | React | ^19.2.7 | Functional components, hooks |
| **Build Tool** | Vite | ^8.1.1 | Fast dev server + production build |
| **CSS Framework** | Tailwind CSS | ^4.3.3 | v4 with `@import "tailwindcss"` syntax |
| **Routing** | react-router-dom | ^7.18.1 | Client-side SPA routing |
| **Maps** | Leaflet.js | 1.9.4 | Via react-leaflet, OpenStreetMap tiles |
| **Icons** | Material Symbols Outlined | — | Google Fonts, loaded via CDN |
| **UI Icons** | lucide-react | ^1.26.0 | React icon components |
| **AI** | Google Gemini | — | Plan generation via API |
| **Icons** | Material Symbols Outlined | — | Google Fonts, loaded via CDN |

---

## Dual-Theme Visual Identity & Design System

The visual identity operates seamlessly in both **Dark Mode** and **Light Mode** with smooth color transitions.

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
}
```

### Custom Animations

| Class | Animation | Duration | Usage |
| :--- | :--- | :--- | :--- |
| `.animate-fadeIn` | Fade in | 300ms | Card/modal entrance |
| `.animate-fadeOut` | Fade out | 300ms | Card/modal exit |
| `.animate-slideIn` | Slide from left | 300ms | Mobile menu open |
| `.animate-slideOut` | Slide to left | 300ms | Mobile menu close |
| `.animate-scaleIn` | Scale 0.95 → 1 | 200ms | Modal entrance |
| `.animated-slide` | Infinite 3-image carousel | 8s cycle | Home page hero slider |
| `.animate-pulse` | Pulse effect | infinite | Sparkle icon |
| `.animate-spin` | Rotation | 1s | Loading spinner |

---

## Routing

Client-side routing via `react-router-dom` v7:

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Home` | Home page with tabs, carousels, hero slider |
| `/plan` | `PlanRequest` | AI plan request (form + TvNaAI modal) |
| `/plan/result` | `PlanResult` | Generated plan with itinerary timeline |
| `/map` | `Map` | Interactive Leaflet map with search |
| `/community` | `Community` | Community feed with modal post form |
| `/profile/:slug` | `Profile` | User profile (dynamic slug) |
| `/favourited` | `Favourited` | Saved/favourited places |

Layout structure: `Header` → `<Outlet />` (page content) → `Footer`, wrapped in a flex column with `min-h-screen`.

---

## Pages & Features

### Home Page (`src/pages/Home.jsx`)

- **Animated hero slider**: 3 images auto-rotating on an 8s cycle
- **Tab navigation**: TvNa / DerLg / NhamEy with Material Symbols icons
- **TvNa tab**: Horizontal scrollable carousels (Featured Partners, DerLg, NhamEy) with left/right scroll buttons
- **DerLg tab**: Card grid of hangout places
- **NhamEy tab**: Card grid of food places
- **Cards**: Image + title + description + "Go Now" (links to Google Maps) and "Saved" (links to /favourited) buttons

### Plan Request Page (`src/pages/PlanRequest.jsx`)

- **Two options**: Quick Form (structured inputs) or TvNaAI (free-text chat)
- **Quick Form**: Budget, group size, duration, start time, category, tvrean, area, mood
- **TvNaAI Modal**: Free-text input sent to Gemini AI for plan generation
- **Loading state**: Spinner animation during AI generation
- **Error handling**: Displays API errors to user

### Plan Result Page (`src/pages/PlanResult.jsx`)

- **Itinerary timeline**: Visual timeline of planned stops
- **Add/Remove stops**: "+" buttons between stops open JuyRoForm to find new places
- **JuyRoForm**: Filter by category (DerLg/NhamEy/Tvrean), tvrean sub-filter (Cafe/Library), area search
- **Suggestions**: Filtered place cards with "Add" button

### Community Page (`src/pages/Community.jsx`)

- **Facebook-style single-column feed** (~550px centered)
- **Create post card**: "What's on your mind?" button + Photo/Place action buttons
- **Modal post form**: Opens as overlay with:
  - Title input
  - Category toggle (DerLg / NhamEy)
  - Image upload area (dashed border, multi-file with preview)
  - Description textarea
  - Submit button
- **Feed posts**: User avatar + name (clickable → profile), description, full-width image, Like/Comment/Share buttons
- **Profile linking**: Clicking username/avatar navigates to `/profile/:slug`

### Map Page (`src/pages/Map.jsx`)

- **Leaflet map**: Centered on Phnom Penh `[11.5564, 104.9282]`, OpenStreetMap tiles
- **8 markers**: Royal Palace, Central Market, Wat Phnom, Independence Monument, Sisowath Quay, Tuol Sleng Museum, Russian Market, AEON Mall
- **Search**: Filter markers by name, fly to location on select

### Profile Page (`src/pages/Profile.jsx`)

- **Dynamic profile**: Loaded from URL parameter `:slug`
- **Cover photo**: Colored background (per-profile hex color)
- **Avatar**: Circular profile picture
- **User info**: Name, username, bio, location, join date
- **Stats row**: Posts, Followers, Following counts
- **Posts feed**: Filters community posts by matching `profileSlug`
- **Back link**: "← Back to Community"

### Favourited Page (`src/pages/Favourited.jsx`)

- **Card grid**: 1 col mobile, 2 cols sm, 3 cols lg
- **Favourited places**: Same PlaceCard component as home page
- **Data**: Static `favouriteData` array from mockData.js

---

## Components

### Header (`src/components/layout/Header.jsx`)

- Sticky header with logo, brand name "TvNa" in indigo
- **Hamburger menu** (visible below `lg` breakpoint) for mobile
- **Theme toggle**: Dark/light mode with `localStorage` persistence
- **Language toggle**: EN/KH switch with `localStorage` persistence
- **Desktop nav**: TvNa, Plan, Favourited, Community, Map links (all translated)
- **Sign-in button**: Opens SignInModal
- **Mobile overlay**: Slide-in panel with navigation links
- **Auth modals**: SignInModal + SignUpModal with switch capability

### Footer (`src/components/layout/Footer.jsx`)

- Logo + links: About us, Facebook, Instagram, Contact (all translated)
- Compact text with indigo hover states

### PlaceCard (`src/components/cards/PlaceCard.jsx`)

- Image, title, description
- **"Saved" button**: Links to `/favourited`
- **"Go Now" link**: Opens Google Maps search for the place

### FeedPostCard (`src/components/cards/FeedPostCard.jsx`)

- User avatar + name (clickable → profile)
- Post description
- Full-width image
- Like / Comment / Share buttons

### IntentForm (`src/components/plan/IntentForm.jsx`)

- Budget, group size, duration, start time inputs
- Category toggle (NhamEy / DerLg / Both)
- Tvrean toggle (None / Cafe / Library)
- Area text input
- Mood selector
- Submit button → calls Gemini AI

### JuyRoForm (`src/components/plan/JuyRoForm.jsx`)

- Category toggle (NhamEy / DerLg / Tvrean)
- Tvrean sub-filter (Any / Cafe / Library) — visible when Tvrean selected
- Area text input
- "Find Places" button → calls suggestionEngine
- Suggestions list with "Add" buttons

### TvNaAIModal (`src/components/plan/TvNaAIModal.jsx`)

- Free-text chat interface
- Sends message to Gemini AI
- Displays AI response as generated plan

### Modals (`src/components/modals/`)

- **SignInModal**: Email/password fields, show/hide password, social login buttons
- **SignUpModal**: Username, email, password, confirm password with real-time validation
- **AddPlaceModal**: Name, address, category, image upload, info textarea

---

## Language System (`src/contexts/LanguageContext.jsx`)

Lightweight context-based i18n system:

- **Provider**: `LanguageProvider` wraps the app in `main.jsx`
- **State**: `language` ('en' | 'kh'), persisted to `localStorage`
- **Hook**: `useLanguage()` returns `{ language, toggleLanguage, t }`
- **Translation function**: `t(key)` — dot-notation key lookup (e.g., `t('nav.plan')`)
- **Toggle**: EN ↔ KH button in Header (shows "EN" or "KH")
- **Khmer style**: Transliterated romanization (e.g., "Planh", "NhJolJit", "SaHaKomn") matching existing codebase convention

### Translation Keys

| Section | Keys |
|---------|------|
| `nav` | tvna, plan, favourited, community, map, signin |
| `card` | goNow, saved |
| `home` | tabTvna, tabDerlg, tabNhamey |
| `community` | placeholder, photo, place, post, cancel |
| `favourited` | title |
| `footer` | about, facebook, instagram, contact |

---

## Data Model

### Place Object
```js
{
    title: string,           // Display name
    image: string,           // Image path (e.g., "/assets/place.webp")
    description: string,     // Place description
    type: string,            // Category type (cafe, restaurant, park, arcade, mall)
    area: string,            // Area in Phnom Penh (e.g., "BKK1", "Toul Kork")
    priceRange: { min: number, max: number },  // Price range in USD
    hours: string            // Operating hours (e.g., "8:00 AM - 9:00 PM")
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

## Services

### `mockData.js` — Static Data Store

| Export | Type | Count | Description |
| :--- | :--- | :--- | :--- |
| `derlgData` | `Place[]` | 6 | Hangout places (bookstores, arcades, parks, malls) |
| `nhameyData` | `Place[]` | 17 | Food places (restaurants, cafes) |
| `favouriteData` | `Place[]` | 3 | Favourited items |
| `communityData` | `CommunityPost[]` | 4 | Community posts with user info + profileSlug |
| `profilesData` | `Object` | 4 | User profiles (chayy, dara, sophea, ashxioo) |
| `places` | `MapPlace[]` | 8 | Map markers (Phnom Penh landmarks) |
| `businessPartners` | `Place[]` | 4 | Featured partner places |

### `gemini.js` — Google Gemini AI Integration

- `generatePlanFromForm(formData)` — Generates plan from structured form data
- `generatePlanFromText(text)` — Generates plan from free-text input
- Uses Gemini 2.0 Flash model
- Returns structured plan with stops array

### `suggestionEngine.js` — Place Suggestion Engine

- `suggestPlaces({ category, tvrean, area })` — Filters places by category, tvrean type, and area
- Combines derlgData + nhameyData pools
- Returns filtered array of matching places

### `mapLinks.js` — Map Link Generator

- `goNowLink(title)` — Returns Google Maps search URL for a place name

---

## Build Process

### npm Scripts

```json
"scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "oxlint src"
}
```

### Build Pipeline

1. **Vite** compiles JSX modules, bundles assets
2. **Tailwind CSS v4** plugin processes utility classes
3. Output goes to `dist/` directory

### Dev Mode

```
npm run dev    # Starts Vite dev server with HMR
```

---

## Component Classes Reference

All custom component classes defined in `@layer components`:

| Class | Usage | Key Styles |
| :--- | :--- | :--- |
| `.btn` | Primary buttons | Indigo bg, white text, rounded-xl, shadow, hover darken |
| `.btn-outline` | Outlined buttons | Border, transparent bg, hover fill |
| `.btnClick` | Clickable buttons | Pointer cursor, transition |
| `.card` | Place cards | Fixed width, rounded-xl, shadow, hover scale |
| `.card-image` | Card images | Full width, fixed height, object-cover |
| `.card-body` | Card content area | Padding, flex column, gap |
| `.card-title` | Card titles | Large, semibold |
| `.card-description` | Card body text | Small, muted color |
| `.card-grid` | Card grid container | 1/2/3 cols responsive, gap-8 |
| `.feed-container` | Community feed wrapper | Max 550px, centered, flex column |
| `.create-post` | Create post card | Card-bg, rounded-xl, shadow, padding |
| `.create-post-btn` | "What's on your mind?" | Rounded pill, bg-input, hover effect |
| `.create-post-action` | Photo/Place buttons | Flex, gap, hover bg-input |
| `.feed-post` | Individual feed post | Card-bg, rounded-xl, shadow, overflow hidden |
| `.post-header` | Post top row | Flex, space-between, padding |
| `.post-description` | Post text | Padding, font-size, line-height |
| `.post-image` | Post image | Full width, max height, object-cover |
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

## Key Design Patterns

### Form Input Styling (Overlay Pattern)
```jsx
className="w-full px-4 py-3 rounded-lg border border-(--muted) bg-(--bg-input) text-(--text) outline-none focus:ring-2 focus:ring-(--indigo) focus:border-(--indigo)"
```

### Toggle Button Pattern
```jsx
className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 cursor-pointer transition-all ${
    active === opt
        ? 'border-(--indigo) text-(--indigo) bg-(--indigo)/10'
        : 'border-(--muted)/30 text-(--text) hover:border-(--indigo)/50'
}`}
```

### Modal Overlay Pattern
```jsx
<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
    <div className="bg-(--signinbg) rounded-2xl shadow-xl p-8 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-scaleIn" onClick={e => e.stopPropagation()}>
```

### Image Upload Area
```jsx
<div className="flex items-center justify-center h-40 rounded-xl bg-(--bg-input) border-2 border-dashed border-(--muted)">
```

---

## Git History & Contributors

### Contributors (3 people)

| Author | Role |
| :--- | :--- |
| **LancD** | Primary developer, architecture, AI integration |
| **ashxio** | Community features, cards, mock data |
| **VorngViseth** | Auth modals, tabs, UI components |

### Development Timeline

| Date | Milestone |
| :--- | :--- |
| Dec 2024 | Initial vanilla HTML/CSS/JS version |
| Jul 2024 | Map page, profile page, community feed redesign |
| Jul 2026 | Migrated to React 19 + Vite 8 + Tailwind v4 |
| Jul 2026 | Added AI plan generation (Gemini), language toggle (EN/KH), modal post form |

---

## Known Issues & Technical Debt

| Issue | Severity | Description |
| :--- | :--- | :--- |
| **No backend** | Low | All data is static. Sign-in/sign-up forms don't authenticate. |
| **No test suite** | Low | Zero testing infrastructure. |
| **Hardcoded data** | Low | All place data, community posts, and profiles are hardcoded arrays. |
| **API key in .env** | Medium | Gemini API key in .env file — should ensure it's gitignored. |
| **Unused AddPlaceModal** | Low | Component exists but is not imported/used anywhere. |

---

## Future Enhancements

- **Backend integration**: REST API for dynamic data, real authentication, persistent storage
- **User accounts**: Real sign-up/sign-in with JWT tokens, user-generated content
- **Search improvements**: Geocoding API for map search (Nominatim/OpenStreetMap)
- **Notifications**: Real-time updates for new community posts
- **PWA support**: Service worker for offline access, installable app
- **Testing**: Unit tests for components, E2E tests for critical flows
- **CMS integration**: Admin panel for managing places, posts, and users
- **Khmer script support**: Option to display actual Khmer script alongside transliteration
