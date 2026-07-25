# TvNa — Project Review & Technical Specification

**Project Name:** TvNa — Community-Driven Place Discovery Platform
**Authors:** LancD, ashxio, VorngViseth
**Last Updated:** July 24, 2026

---

## 1. Executive Summary

**TvNa** (ត្វាណា — "Where to go?" in Khmer) is a community-driven web platform for discovering hangout spots and food places in **Phnom Penh, Cambodia**. It targets **Gen Z users (ages 16–25)**, specifically high school and university students who face the problem of "information is everywhere but there isn't a specific platform" to find places to go.

The platform now features AI-powered place suggestion and planning, community interaction, and interactive maps — all built as a modern React single-page application.

**Current status:** Functional prototype with mocked AI, static data, and no backend.

---

## 2. Tech Stack

| Category | Technology | Version | Notes |
|----------|-----------|---------|-------|
| **Bundler** | Vite | 8.1.5 | Fast HMR, zero config |
| **Framework** | React | 19.2.7 | With React Router |
| **Styling** | Tailwind CSS | v4 | `@import "tailwindcss"` syntax |
| **Routing** | react-router-dom | 7.x | SPA routing |
| **Maps** | Google Maps Embed | — | Free iframe embed, no API key |
| **Icons** | Material Symbols Outlined | — | Google Fonts, loaded via CDN |
| **Linter** | oxlint | 1.71.0 | Fast Rust-based linter |

**Notable:** No backend, no database, no real AI. Pure frontend with deterministic mock logic.

---

## 3. System Architecture

### Component-Based SPA

```
App.jsx (BrowserRouter + Routes)
├── Header (sticky nav + modals)
├── Routes
│   ├── / → Home
│   ├── /juy-der-ro → JuyDerRo (Suggestion)
│   ├── /plan → PlanRequest (Planning)
│   ├── /plan/result → PlanResult (Itinerary)
│   ├── /map → Map
│   ├── /community → Community
│   ├── /profile/:slug → Profile
│   └── /favourited → Favourited
└── Footer
```

### Service Layer

| File | Purpose |
|---|---|
| `mockData.js` | All static data arrays & objects |
| `planEngine.js` | Generates sequential 3-stop itinerary from user input |
| `suggestionEngine.js` | Filters & ranks places by category/tvrean/area |
| `recommendEngine.js` | Scores places against user intent |
| `mapLinks.js` | Builds Google Maps direction URLs |

### Theme System

Dual-theme using CSS variables with `dark` class toggle:

| Token | Dark Mode | Light Mode | Purpose |
| :--- | :--- | :--- | :--- |
| **Background** | `#121212` | `#F9FAFB` | Primary page canvas |
| **Text Primary** | `white` | `#080069` | Headings, card titles |
| **Card Background** | `#262626` | `white` | Card surfaces |
| **Card Description** | `#d1d5db` | `#374151` | Body text in cards |
| **Muted** | `oklch(62% 0.020 260)` | `oklch(68% 0.018 260)` | Subtle text, placeholders |
| **Footer Background** | `#171717` | `oklch(93% 0.034 272.788)` | Footer surface |
| **Sign-in Background** | `oklch(27.8% 0.033 256.848)` | `#F9FAFB` | Modal backgrounds |
| **Input Background** | `oklch(37.3% 0.034 259.733)` | `oklch(96.7% 0.003 264.542)` | Form input fields |

**Brand:** Indigo `#741EFF` — buttons, active tabs, links, accents

---

## 4. Pages & Routes

| Route | Page | Purpose |
|---|---|---|
| `/` | Home | Hero slider, tab navigation (TvNa/DerLg/NhamEy), horizontal scroll carousels |
| `/juy-der-ro` | JuyDerRo | Suggest places by category, tvrean, area — returns ranked list |
| `/plan` | PlanRequest | Full afternoon planner: budget, mood, category, tvrean, area, startTime |
| `/plan/result` | PlanResult | AI thinking animation → sequential 3-stop itinerary |
| `/map` | Map | Google My Maps iframe (from `.env`) + search + place cards |
| `/community` | Community | Facebook-style feed with create-post + profile linking |
| `/profile/:slug` | Profile | Dynamic profile by URL slug param |
| `/favourited` | Favourited | Saved places card grid |

---

## 5. Key Features

### 5.1 JuyDerRo (Suggestion Page)

Filter places by:
- **Category:** NhamEy (restaurants), DerLg (hangout/park/arcade), Both
- **Tvrean:** Cafe, Library, None
- **Area:** Free text input (e.g., BKK1, Toul Kork, Chamkar Mon)
- **Budget:** USD amount

Returns a ranked list of matching places as cards with "Jam Tv" (Go together) and "Tv Lv" (Go now) buttons.

### 5.2 JuyReabJom (Plan Page)

Full afternoon planner with inputs:
- Budget, Group Size, Duration
- Mood (Study/Chill/Explore/Date/Group)
- Category (NhamEy/DerLg/Both)
- Tvrean (Cafe/Library/None)
- Area (free text)
- Start Time (hour)

Generates a sequential 3-stop itinerary with:
- Time-based sequencing (e.g., 14:00 → 16:00 → 19:00)
- Match percentage + reasoning per stop
- "Go Now" button per stop (Google Maps direction link)
- "Go Now" button for full itinerary (Google Maps with waypoints)

### 5.3 Go Now (Google Maps Integration)

Two utility functions:
- `goNowLink(placeName)` — single destination directions
- `goNowWithStops(stops)` — multi-stop directions with waypoints

URL format: `https://www.google.com/maps/dir/?api=1&destination=X&waypoints=Y%7CZ&travelmode=driving`

### 5.4 Dark/Light Theme Toggle

- Persisted in `localStorage.theme`
- Respects `prefers-color-scheme` on first visit
- Smooth 500ms color transitions on all elements
- No flash on page load (inline script in `<head>`)

### 5.5 Auth Modals

- Sign In: Email/password, show/hide toggle, remember me, social login buttons
- Sign Up: Username/email/password/confirm, real-time password match validation
- Switch between modals without closing

---

## 6. Data Model

### Place Object
```js
{
    title: string,           // Display name
    image: string,           // Image path
    description: string,     // Place description
    type: string,            // "cafe" | "restaurant" | "arcade" | "park"
    area: string             // "BKK1" | "Toul Kork" | "Chamkar Mon"
}
```

### Community Post Object
```js
{
    title: string,
    image: string,
    description: string,
    userName: string,
    userPfp: string,
    profileSlug: string      // URL slug for profile linking
}
```

### Profile Object
```js
{
    name: string,
    username: string,        // @handle
    bio: string,
    location: string,
    joinDate: string,
    followers: number,
    following: number,
    posts: number,
    pfp: string,
    cover: string            // Hex color for cover banner
}
```

---

## 7. Component Structure

### Layout
| Component | Purpose |
|---|---|
| `Header.jsx` | Sticky nav, logo, desktop links, hamburger, theme toggle, sign-in button, auth modals |
| `Footer.jsx` | Logo + links (About, Facebook, Instagram, Contact) |

### Cards
| Component | Purpose |
|---|---|
| `PlaceCard.jsx` | Place card with image, title, description, Jam Tv / Tv Lv buttons |
| `ItineraryStepCard.jsx` | One stop in generated plan (time, place, cost, match%, Go Now) |
| `FeedPostCard.jsx` | Facebook-style feed post (avatar, name, description, image, actions) |

### Plan
| Component | Purpose |
|---|---|
| `IntentForm.jsx` | Full form: budget, group size, duration, mood, category, tvrean, area, startTime |
| `MoodSelector.jsx` | Quick-tap mood chips (Study/Chill/Explore/Date/Group) |
| `AIThinkingState.jsx` | Loading animation while "AI" generates plan |
| `ItineraryTimeline.jsx` | Vertical timeline: sequential stops with overall Go Now |

### Modals
| Component | Purpose |
|---|---|
| `SignInModal.jsx` | Email/password form, show/hide, social login |
| `SignUpModal.jsx` | Registration form with password match validation |
| `AddPlaceModal.jsx` | Place submission form with image upload preview |

---

## 8. File Tree

```
TvNa/
├── .env                          # VITE_GOOGLE_MAPS_EMBED_URL
├── .gitignore
├── .oxlintrc.json
├── index.html
├── package.json
├── package-lock.json
├── public/
│   ├── assets/                   # 24 WebP images (places, avatars, logos)
│   ├── favicon.svg
│   └── icons.svg
├── README.md
├── src/
│   ├── main.jsx
│   ├── App.jsx                   # Router + layout shell
│   ├── index.css                 # Tailwind theme + component classes
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── PlanRequest.jsx
│   │   ├── PlanResult.jsx
│   │   ├── JuyDerRo.jsx
│   │   ├── Map.jsx
│   │   ├── Community.jsx
│   │   ├── Profile.jsx
│   │   └── Favourited.jsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx
│   │   │   └── Footer.jsx
│   │   ├── cards/
│   │   │   ├── PlaceCard.jsx
│   │   │   ├── ItineraryStepCard.jsx
│   │   │   └── FeedPostCard.jsx
│   │   ├── plan/
│   │   │   ├── IntentForm.jsx
│   │   │   ├── MoodSelector.jsx
│   │   │   ├── AIThinkingState.jsx
│   │   │   └── ItineraryTimeline.jsx
│   │   └── modals/
│   │       ├── SignInModal.jsx
│   │       ├── SignUpModal.jsx
│   │       └── AddPlaceModal.jsx
│   └── services/
│       ├── mockData.js
│       ├── planEngine.js
│       ├── recommendEngine.js
│       ├── suggestionEngine.js
│       └── mapLinks.js
└── vite.config.js
```

---

## 9. Build Status

| Check | Status |
|---|---|
| `npx vite build` | Passes |
| `oxlint src/` | 0 warnings, 0 errors |
| Source files | 27 |
| Build modules | 47 |
| Build output | ~268 KB JS, ~30 KB CSS |

---

## 10. Known Limitations

| Issue | Severity | Description |
| :--- | :--- | :--- |
| **Static data** | Medium | All place data, posts, and profiles are hardcoded arrays |
| **Mocked AI** | Medium | Plan generation is deterministic filtering, not real LLM inference |
| **No backend** | Medium | No API calls, no persistent storage, no real authentication |
| **No tests** | Low | Zero testing infrastructure |
| **No area validation** | Low | Area input is free text — no autocomplete or validation |
| **Limited place data** | Low | Only 10 places (5 derlg + 5 nhamey) with 3 areas |

---

## 11. Future Enhancements

- **Backend integration:** REST API for dynamic data, real auth, persistent storage
- **Real AI:** LLM-powered plan generation with natural language understanding
- **User accounts:** JWT-based auth, user-generated content, favorites sync
- **Google Maps API:** Real search, geocoding, place details (replacing iframe)
- **Notifications:** Real-time updates for new community posts
- **PWA support:** Service worker for offline access, installable app
- **Testing:** Unit tests for services, E2E tests for critical flows
- **CMS integration:** Admin panel for managing places, posts, and users
- **More places:** Expand database with full Phnom Penh coverage
- **Khmer language support:** Full localization
