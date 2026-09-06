# Shelf Starter Instructions

Shelf is the starter repository for the **Self-Testing AI Agents** course. It is a real SvelteKit + TypeScript book application, not a generated scaffold.

## What "done" means

A task is not done until these exit zero:

1. `npm run typecheck`
2. `npm run lint`
3. `npm run test`

Do not report a task complete with any of these failing. If a failure looks unrelated, say so explicitly and link the failing test name in your summary.

## Routes

- Public: `/`, `/login`, `/design-system`, `/playground`
- Protected: `/search`, `/shelf`, `/goals`, `/admin` — gate server-side on `locals.user`, never with client guards
- Do not reintroduce `src/routes/demo/` or any generated starter pages
- New routes must match the Shelf product domain (books, shelves, ratings)

## How tests get written

- Write a failing test before the implementation. Commit the test first.
- Unit tests live next to the file under test as `<name>.test.ts` and run with Vitest.
- End-to-end tests live in `tests/end-to-end/` and run with Playwright.
- The starter Playwright suite is intentionally small. Later course labs add dossiers, accessibility, and visual coverage.
- Open Library search traffic is recorded and replayed from a HAR. See [`PLAYWRIGHT-HAR.md`](./PLAYWRIGHT-HAR.md).

## Playwright locator rules

- `getByRole` first. `getByLabel` or `getByText` second. `data-testid` only when semantics genuinely don't exist.
- Never use raw CSS or XPath selectors in specs.
- Never use `page.waitForTimeout` or `page.waitForLoadState('networkidle')`. Use `expect(locator).toBeVisible()`, `page.waitForResponse`, or `page.waitForRequest`.
- Do not fix a failing Playwright test by changing the assertion to match broken UI.

## UI copy

- User-facing copy stays about books, shelves, and reading. Do not mention Playwright, seeded fixtures, test IDs, HARs, or course material in rendered page copy.
- Testing rationale and infrastructure details belong in code comments, `CLAUDE.md`, or `README.md`.

## Do not

- Do not silence type errors with `any` or `@ts-expect-error`. Fix the type.
- Do not add `eslint-disable` comments. Fix the code.
- Do not add new dependencies without flagging them in your summary.
- Do not hand-edit generated artifacts or build output.
