# Generating `playwright/.authentication/user.json`

Most Playwright specs in `tests/` run against protected routes (`/shelf`, `/search`, `/goals`). Rather than logging in through the UI in every spec, Playwright reuses a saved [storage state](https://playwright.dev/docs/auth) — cookies captured once from a real sign-in and replayed into every subsequent test's browser context.

`playwright/.authentication/user.json` is that saved state. It is gitignored (see `.gitignore`) — it's a snapshot of a live session, not something to commit — so it doesn't exist until it's generated locally or in CI.

## Prerequisite: the account has to exist

The state is only as good as the login that produced it. `tests/auth.setup.ts` signs in with a fixed email/password:

```ts
await page.fill('input[name="email"]', 'gerome@test.com');
await page.fill('input[name="password"]', 'password');
```

That account is **not** seeded automatically — there's no seed script wiring it into the local SQLite database. If it doesn't exist yet, register it once through the app itself:

1. `npm run dev` (or let `npm test` boot the preview server)
2. Go to `/login` and register with the exact email/password `auth.setup.ts` expects
3. Re-run the tests

This is the same manual-registration step the README describes for [promoting a reader to administrator](./README.md#promote-a-reader-to-administrator) — the local database has no seed data, so any account a test depends on has to be created by hand first.

## How the file actually gets generated

Generation isn't a separate command — it's wired into the Playwright project graph in `playwright.config.ts`:

```ts
projects: [
	{
		name: 'setup',
		testMatch: 'tests/auth.setup.ts'
	},
	{
		name: 'chromium',
		use: {
			browserName: 'chromium',
			storageState: 'playwright/.authentication/user.json'
		},
		dependencies: ['setup']
	}
];
```

Because `chromium` declares `setup` as a dependency, every `npm test` run executes `tests/auth.setup.ts` first, automatically, before any other spec. That file:

1. Navigates to `/login`
2. Fills in the credentials and submits
3. Asserts the redirect to `/shelf` and the `"Gerome's shelf"` heading actually landed (a real check, not just a URL change)
4. Writes the resulting cookies to `playwright/.authentication/user.json` via `page.context().storageState({ path: authenticationFile })`

Every other spec that runs in the `chromium` project then starts already authenticated, because Playwright loads that file as its `storageState` before the test body runs.

## Regenerating it by hand

You don't normally need to — `npm test` regenerates it on every run. To force it without running the full suite:

```sh
npx playwright test --project=setup
```

Regenerate manually if:

- the file is missing (first run, fresh clone, `tmp/local.db` was reset)
- the session cookie has expired (`expires` in the JSON is a Unix timestamp — check it against the current time)
- the login credentials or the account itself changed

## Stray files

`playwright/.authentication/user-dev.json` also exists locally but isn't referenced by `playwright.config.ts` or any spec — it's leftover from earlier experimentation, not part of the current auth flow. Only `user.json` is live.
