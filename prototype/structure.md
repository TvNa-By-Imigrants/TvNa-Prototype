# Project Structure

```
TvNa/
├── .env                          # VITE_GOOGLE_MAPS_EMBED_URL + VITE_GEMINI_API_KEY
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
│   │   ├── Home.jsx              # Hero slider + tabs + carousels
│   │   ├── PlanRequest.jsx       # AI text input → Gemini → plan
│   │   ├── PlanResult.jsx        # AI thinking → itinerary with add/remove
│   │   ├── Map.jsx               # Google My Maps iframe + search
│   │   ├── Community.jsx         # Facebook-style feed
│   │   ├── Profile.jsx           # Dynamic profile by slug
│   │   └── Favourited.jsx        # Favourites card grid
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx        # Sticky nav + mobile overlay + auth modals
│   │   │   └── Footer.jsx        # Logo + links
│   │   ├── cards/
│   │   │   ├── PlaceCard.jsx     # Place card with Jam Tv / Tv Lv buttons
│   │   │   ├── ItineraryStepCard.jsx  # Stop with remove button
│   │   │   └── FeedPostCard.jsx
│   │   ├── plan/
│   │   │   ├── AIThinkingState.jsx
│   │   │   ├── ItineraryTimeline.jsx  # Timeline with + between stops
│   │   │   └── AddStopPicker.jsx     # Horizontal picker for adding stops
│   │   └── modals/
│   │       ├── SignInModal.jsx
│   │       ├── SignUpModal.jsx
│   │       └── AddPlaceModal.jsx
│   └── services/
│       ├── mockData.js           # All place data (type, area, priceRange, hours)
│       ├── gemini.js             # Two-step Gemini AI integration
│       └── mapLinks.js           # Google Maps direction URL builders
└── vite.config.js
```

**Tech stack:** Vite 8 + React 19 + Tailwind CSS v4 + React Router + Gemini AI

**Features:**
- Dark/light mode with localStorage persistence
- **AI Plan (Juy Reab Jom):** Natural language input → Gemini AI → sequential itinerary
- **Add/Remove stops:** + buttons between stops, − button on each stop
- Google Maps Embed (iframe) + "Go Now" direction links
- Community feed with profile linking
- Sign-in/sign-up modals with password validation
