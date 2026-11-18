# Project Structure

```
TvNa/
├── .claude/
│   └── CLAUDE.MD
├── .gitignore
├── .oxlintrc.json
├── index.html
├── package.json
├── package-lock.json
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── README.md
├── src/
│   ├── App.css
│   ├── App.jsx
│   ├── assets/
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── components/       (empty)
│   ├── main.jsx
│   ├── pages/            (empty)
│   └── services/         (empty)
└── vite.config.js
```

**Tech stack:** Vite + React

**Note:** `components/`, `pages/`, and `services/` are empty placeholder directories for future development.

# TvNa — Project Execution Plan

## 1. Tech Decisions (locked — don't revisit)

| Decision | Choice | Why |
|---|---|---|
| Bundler | Vite | Already in your folder structure, fast, zero config |
| Styling | Tailwind v4 | You already have the token system (colors, animations) from v1 — port it as-is |
| Routing | react-router-dom | Simple, no need for anything heavier |
| State | Local `useState` + prop drilling / light Context | Not enough shared state to justify Redux/Zustand |
| "AI" | Mocked (`planEngine.js`) | Real LLM calls add latency + API key risk on demo day. Fake it convincingly |
| Data | Static JS arrays (`mockData.js`) | No backend needed for a prototype |
| Maps | react-leaflet | Same as old Leaflet setup, just React-wrapped |

Don't debate these mid-build. Every hour spent on "should we use Zustand" is an hour not spent on the demo.

---

## 2. Build Order (dependency-first, not feature-first)

```
1. Design tokens (Tailwind theme + CSS vars)       ← everything else depends on this
2. Layout shell (Header, Footer, routing skeleton)  ← needed to see anything
3. Plan feature (Intent → Thinking → Itinerary)     ← your differentiator, build in isolation
4. Home page (place browsing)                       ← reuses card components from #3
5. Map / Community / Profile                        ← only if time remains
6. Polish pass (animations, empty states, mobile)   ← always last, always underestimated
```

Never build page 4 before page 3 is demo-able. If time runs out, you want the highest-value thing finished, not everything half-finished.

---

## 3. Coding Conventions

Agree on this in a 5-min team huddle before anyone writes code.

- **One component = one file.** No 300-line page components — extract subcomponents into `components/`.
- **Data shape lives in one place.** All place objects conform to the shape in `mockData.js`. New fields (e.g. `image`) get added there, not ad-hoc in a component.
- **No inline hex colors in JSX.** Use Tailwind classes or CSS vars from your theme — this is what keeps dark/light mode from breaking.
- **Every page component is dumb.** Pages fetch/compute data via `services/`, then just render. Keeps logic testable and reusable.
- **Commit small, commit often.** Keep up the PR discipline from your git history, even under time pressure.

---