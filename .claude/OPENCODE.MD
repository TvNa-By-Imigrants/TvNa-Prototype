Good — moving to React + Tailwind is the right call for a hackathon demo since it'll let you fake the "AI" parts convincingly with mock data/streaming text, which is honestly what most hackathon "AI" demos do anyway.

Here's a concrete plan.

1. Page structure (maps to your pitch)
```
src/pages/
├── Home.jsx              # landing + hero + tab-based browsing (DerLg/NhamEy) — your existing content
├── PlanRequest.jsx        # NEW — the "AI intent input" screen: budget, group size, time, mood
├── PlanResult.jsx         # NEW — AI-generated recommendation + itinerary (the core demo moment)
├── Map.jsx                # existing map page, ported to react-leaflet
├── Community.jsx          # existing feed
├── Profile.jsx            # existing profile
└── Favourited.jsx         # existing favourites
```
PlanRequest → PlanResult is your new killer feature flow — this is where "AI Recommendations" and "Full Experience Planning" actually become visible and demoable, not just a doc.

2. Component structure
```
src/components/
├── layout/
│   ├── Header.jsx
│   ├── Footer.jsx
│   └── MobileNav.jsx
├── cards/
│   ├── PlaceCard.jsx
│   ├── ItineraryStepCard.jsx     # NEW — one stop in a generated plan (time, place, cost)
│   └── FeedPostCard.jsx
├── plan/
│   ├── IntentForm.jsx            # NEW — "$15, 3 friends, 4 hours, chill mood" inputs
│   ├── MoodSelector.jsx          # NEW — quick-tap chips (Study/Chill/Explore/Date/Group)
│   ├── AIThinkingState.jsx       # NEW — loading animation while "AI" generates plan
│   └── ItineraryTimeline.jsx     # NEW — vertical timeline: 4PM → 6PM → 7:30PM
├── modals/
│   ├── SignInModal.jsx
│   ├── SignUpModal.jsx
│   └── AddPlaceModal.jsx
└── ui/
    ├── Button.jsx
    ├── Tabs.jsx
    └── ThemeToggle.jsx
```
3. The "AI" service layer (mocked, but structured for real integration later)
```
src/services/
├── mockData.js          # your existing derlgData/nhameyData/etc, migrated
├── planEngine.js         # NEW — takes {budget, groupSize, duration, mood} → returns itinerary
└── recommendEngine.js    # NEW — scores places against user intent, returns ranked list
```
planEngine.js doesn't need real AI for a prototype — write deterministic logic that filters your static place data by mood/budget/group size and stitches together a 3-stop itinerary with fake "match %" scores and reasoning strings ("Quiet, has Wi-Fi, fits your budget"). This is enough to demo convincingly and judges rarely check if it's a real LLM call under the hood in a prototype round — but if you want it to actually call an AI, this is the one seam where you'd swap in a real API call later without touching your UI.

4. Routing (React Router)
jsx
```
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/plan" element={<PlanRequest />} />
  <Route path="/plan/result" element={<PlanResult />} />
  <Route path="/map" element={<Map />} />
  <Route path="/community" element={<Community />} />
  <Route path="/profile/:slug" element={<Profile />} />
  <Route path="/favourited" element={<Favourited />} />
</Routes>
```
5. State management

For a prototype, skip Redux/Zustand — just:

useState in PlanRequest for the intent form
Pass result via useNavigate(..., { state: itinerary }) to PlanResult, or lift to a simple PlanContext if you want it to persist across nav

6. Suggested build order (for hackathon time pressure)

- Scaffold Home + Map + Community + Profile by porting existing HTML/CSS/JS into JSX (mechanical work, do this first, low risk)
- Build MoodSelector + IntentForm — this is your new differentiator, prioritize it
- Build planEngine.js mock logic
- Build PlanResult with ItineraryTimeline — this is your demo's money shot, spend the most polish time here
- Add AIThinkingState loading animation (1.5–2s fake delay) — cheap trick, makes it feel like real inference is happening
- Wire dark/light theme toggle back in (Tailwind dark: classes + localStorage)
