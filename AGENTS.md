# WHO SRHR Data Portal

Nuxt 3 SPA (SSR disabled) for WHO Sexual and Reproductive Health and Rights data visualization — maps, charts, and tables.

## Stack

Yarn · Nuxt 3 · Vue 3 · TypeScript strict · Prisma/SQLite · Element Plus · D3 · Mapbox · Pinia · Tailwind + SCSS

## Commands

| Purpose                    | Command                  |
| -------------------------- | ------------------------ |
| Dev (Nuxt + Prisma Studio) | `yarn dev`               |
| Build                      | `yarn build`             |
| Run migrations             | `npx prisma migrate dev` |
| Seed database              | `npx prisma db seed`     |
| Format                     | `yarn format`            |

## Non-obvious conventions

- Templates use **Pug** (not HTML)
- No semicolons — Prettier handles formatting
- App runs on `http://localhost:3001/` (fallback from 3000)
- Always use Playwright MCP **full-screen** for UI testing

## Further reading

- [Architecture](.claude/docs/architecture.md) — stack details, component map, stores, API endpoints
- [Code Style](.claude/docs/code-style.md) — TypeScript, naming conventions, component patterns
- [Data & API](.claude/docs/data-api.md) — response structures, empty states, Prisma guidelines
- [Testing](.claude/docs/testing.md) — Playwright workflow, what to verify
- [Common Tasks](.claude/docs/common-tasks.md) — adding indicators, debugging, performance

## Agent skills

### Issue tracker

Issues live in Linear under the WHO SRHR project (team: Advaita Software). See `docs/agents/issue-tracker.md`.

### Triage labels

Default canonical label names (needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix) applied as Linear labels. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
