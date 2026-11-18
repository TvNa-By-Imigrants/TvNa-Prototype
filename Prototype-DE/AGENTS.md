# AGENTS.md — TvNa-Prototype

Cambodia travel/discovery platform ("Tovna24 / ទៅណា២៤" — "where to go?" in Khmer).

## Repo layout — two projects

- **`Prototype-DE/`** — the DESIGN workspace. Design-first workflow: we design the UI/UX here (with shadcn/ui + the Tovna24 tokens) BEFORE the frontend is implemented. Design tasks live here; the real frontend is built from these designs afterward. Stack: React 19 + TypeScript + Vite 8 + Tailwind CSS v4 + shadcn/ui (Base UI).
- **`prototype/`** — the OLD working app (React/JS, feature-complete: pages, cards, services, Gemini AI, community feed). Use ONLY as a functional reference — do not build on it.

## Design system — source of truth

Read `Prototype-DE/Design.md` (brand, color tokens, typography, spacing, component specs).

The tokens are **already ported** into `Prototype-DE/src/index.css` (Tovna24 light + Facebook-style dark mode; shadcn aliases are `var()` references). Do not redefine or re-import them.

- Dark mode = `.dark` class (or `[data-theme="dark"]` alias) on `<html>`. Auto-toggle is NOT yet wired up.
- Fonts `Google Sans` / `Kantumruy Pro` / `Noto Sans SC` are referenced in the CSS stack but NOT bundled (falls back to system-ui). Flag before adding font packages.

## shadcn/ui — already initialized

- `components.json` present; style `base-nova`, base library `base` (Base UI, NOT Radix).
- To add components, run from **inside** `Prototype-DE/` (never the repo root):
  ```
  cd Prototype-DE && pnpm dlx shadcn@latest add button badge input ...
  ```
- The **shadcn agent skill is installed** at `Prototype-DE/.agents/skills/shadcn/SKILL.md` (plus a `migrate-radix-to-base` skill). Any agent working in `Prototype-DE/` should load it and follow its rules (semantic tokens only, no raw colors, no `space-x/y`, use `cn()`).

## Gotchas — do not break

1. The `@/*` → `./src/*` path alias is defined in **both** `tsconfig.json` (root) and `tsconfig.app.json`. shadcn reads it from the **root** `tsconfig.json`. If it's missing there, shadcn writes files to a literal `@/` folder.
2. TypeScript 7 **removed `baseUrl`**. Keep only `paths`; never add `baseUrl` back.
3. Package manager is **pnpm** (`pnpm-lock.yaml`). A stale `package-lock.json` also exists — standardize on pnpm; do not let npm regenerate it.
4. `tsconfig.app.json` has strict flags (`noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`) — clean up unused imports/vars or `tsc -b` fails.
5. Keep build and lint green:
   - `pnpm build` = `tsc -b && vite build`
   - `pnpm lint` = `oxlint`

## Reference for the browsing UI's behavior

- `prototype/src/pages/Home.jsx` — tabs (DerLg/NhamEy), hero slider, carousels
- `prototype/src/components/cards/PlaceCard.jsx` — place card shape/actions
- `prototype/src/services/mockData.js` — data model (`Place`, areas, price ranges, hours)

Match the FUNCTIONALITY, but rebuild fresh in `Prototype-DE/` using `Design.md`'s visual style + shadcn components.
