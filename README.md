# Shelf

Shelf is the starter SvelteKit application for the [Playwright: Automated Testing & AI Workflows
](https://stevekinney.com/courses/self-testing-ai-agents) course from [Master.dev](https://master.dev/courses/playwright/). The repository is intentionally small on day one: a working app shell, a few public and protected routes, app-native email and password authentication, and a tiny Playwright smoke loop that later lessons expand.

## Stack

- [SvelteKit](https://svelte.dev/) 2 with Svelte 5 on [Vite](https://vite.dev/) 8
- TypeScript, ESLint, Prettier
- [Drizzle ORM](https://orm.drizzle.team/) on [libSQL](https://github.com/tursodatabase/libsql) (local SQLite file by default)
- [Tailwind CSS](https://tailwindcss.com/) 4 with `@tailwindcss/forms` and `@tailwindcss/typography`
- [Vitest](https://vitest.dev/) for unit tests, [Playwright](https://playwright.dev/) for end-to-end tests

## Routes

Public:

- `/`: home page
- `/login`: email and password sign-in and registration
- `/design-system`: component gallery for later UI exercises
- `/playground`: locator-practice page used later in the course

Protected (gated server-side on `locals.user`):

- `/search`: book search surface
- `/shelf`: personal shelf
- `/goals`: reading goals
- `/admin`: administrator surface (requires `user.isAdmin = true`)

## What is intentionally not built yet

This starter is meant to grow with the course. These pieces are added later:

- live [Open Library](https://openlibrary.org/) search integration
- shelf CRUD flows and persisted ratings
- stats, goals, and admin features
- accessibility automation
- visual regression
- performance budgets
- failure dossiers
- static-layer extras like hooks, secret scanning, and dead-code checks
- CI wiring
- custom verification MCP tools

## Environment variables

Copy `.env.example` to `.env`:

```sh
cp .env.example .env
```

All variables have course-friendly defaults, so the app runs without any edits:

- `DATABASE_URL` — libSQL connection string. Defaults to `file:./tmp/local.db`.
- `OPEN_LIBRARY_BASE_URL` — Open Library API base. Defaults to `https://openlibrary.org`.

The `prepare` script copies `.env.example` to `.env` on first install if one is not already present.

## Local development

Install dependencies:

```sh
npm install
```

`npm install` runs the `prepare` script, which:

1. Creates `tmp/` and copies `.env.example` to `.env` if missing
2. Installs Playwright browsers
3. Syncs SvelteKit types
4. Applies the Drizzle schema to the local SQLite database (`db:push`)

Start the development server:

```sh
npm run dev
```

The app listens on `http://localhost:5173`.

## Database

The local database lives at `tmp/local.db`. The db client auto-creates its parent directory on startup, so you never need to create `tmp/` by hand.

Re-apply the schema after changing `src/lib/server/db/schema.ts`:

```sh
npm run db:push
```

Inspect or edit data in a browser with Drizzle Studio:

```sh
npm run db:studio
```

Drizzle Studio prints a local URL in the terminal.

## Promote a reader to administrator

Administrator access is stored on the `user.isAdmin` column.

To promote a local account:

- Register the account at `/login` first if it does not exist yet.
- Open Drizzle Studio with `npm run db:studio`.
- Open the `user` table.
- Flip `isAdmin` to `true` for the relevant row and save.
- Sign out and sign back in so the session picks up the updated user row.

## Scripts

| Script              | Purpose                                        |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Start the Vite dev server                      |
| `npm run build`     | Production build                               |
| `npm run preview`   | Preview the production build                   |
| `npm run typecheck` | `svelte-kit sync` + `svelte-check`             |
| `npm run lint`      | `prettier --check` + `eslint`                  |
| `npm run test:unit` | Vitest (unit tests co-located next to sources) |
| `npm run test`      | Playwright end-to-end tests from `tests/`      |
| `npm run test:all`  | Unit tests, then end-to-end tests              |
| `npm run db:push`   | Apply the Drizzle schema to the local database |
| `npm run db:studio` | Open Drizzle Studio against the local database |

## Verification commands

Run these before considering a change complete:

```sh
npm run typecheck
npm run lint
npm run test
```

A task is not done until all three exit zero.

## Testing notes

- Unit tests live next to the file under test as `<name>.test.ts` and run with Vitest.
- End-to-end tests live in `tests/` and run with Playwright. The starter suite is intentionally small and only covers public starter routes.
- Playwright locators follow the rules in `CLAUDE.md`: `getByRole` first, then `getByLabel` / `getByText`, and `data-testid` only when semantics genuinely don't exist. No raw CSS or XPath selectors, and no `waitForTimeout` or `waitForLoadState('networkidle')`.
- Later course labs add the larger Playwright setup, extra scripts, and the stricter verification loop.
- Protected-route specs authenticate via a saved storage state rather than logging in per test. See [`PLAYWRIGHT-AUTH.md`](./PLAYWRIGHT-AUTH.md) for how `playwright/.authentication/user.json` gets generated.
- `/search` hits the live Open Library catalog from the browser. [`tests/recording.spec.ts`](./tests/recording.spec.ts) records or replays that traffic from a HAR so the spec can assert a specific title without depending on the live API. See [`PLAYWRIGHT-HAR.md`](./PLAYWRIGHT-HAR.md).

## Pre-commit verification (lefthook)

`npm install` runs the `prepare` script, which includes `lefthook install`, wiring a pre-commit hook that runs `npm run format` and `npm test` before any commit is allowed through. See [`LEFTHOOK.md`](./LEFTHOOK.md) for the installation steps and a case study of the hook catching real bugs in a Playwright recording.

## Project layout

```
src/
  routes/              # SvelteKit routes (public + (authenticated) group + admin + api)
  lib/
    server/            # server-only modules: db, auth/session, users, environment
    components/        # Svelte components shared across routes
scripts/               # repo maintenance scripts (e.g. prepare-environment.mjs)
tests/                 # Playwright specs and helpers
tmp/                   # local SQLite database (gitignored)
```
