# TvNa

TvNa is a community-driven place discovery and planning project for Phnom Penh.
This repository combines the existing React prototype with a typed full-stack
starter adapted for TvNa.

## Project structure

- `prototype/` — original React + Vite prototype, with mock data and frontend-only features.
- `apps/client/` — React + TanStack client from the adapted starter.
- `apps/server/` — NestJS REST API on Fastify, with Drizzle/PostgreSQL, better-auth, and Effect.
- `packages/contracts/` — shared Zod schemas and TypeScript types.
- `docs/` — setup, database, deployment, API error contract, and architecture notes.

## Getting started

Requires Node.js 22+ and PostgreSQL 17 (or Docker Compose).

```bash
npm install
cp .env.example .env
docker compose up -d db
npm run db:migrate
npm run seed:admin
npm run dev
```

- Client: http://localhost:3000
- REST API health check: http://localhost:3001/api/health
- Sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`.

The API uses resource routes, for example `GET /api/pokemon?limit=20&offset=0`,
`GET /api/pokemon/:name`, `GET/PATCH /api/me`, and `GET /api/sessions`.
better-auth endpoints are available under `/api/auth/*`.

Useful commands: `npm run lint`, `npm run typecheck`, `npm run test`,
`npm run build`, and `npm run compose:up`.

See [`docs/getting-started.md`](docs/getting-started.md) for feature development
and [`AGENTS.md`](AGENTS.md) for repository conventions.

## Template attribution

The full-stack starter is based on
[`Sliden101/ts-fullstack-template`](https://github.com/Sliden101/ts-fullstack-template),
licensed under the MIT License. It has been adapted to use a REST-only API and
to serve as the foundation for TvNa. The original template license is retained
in [`LICENSE`](LICENSE).
