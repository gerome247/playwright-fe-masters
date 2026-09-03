# Lefthook and the agent verification loop

[Lefthook](https://lefthook.dev/) is a git hooks manager. In this repo it runs a pre-commit gate so that formatting and the Playwright suite are checked on every commit, not just when someone remembers to run them.

## Installing lefthook

Lefthook is already a `devDependency` and wired into the `prepare` script, so a normal setup needs no extra steps:

```sh
npm install
```

`npm install` triggers `prepare`, which runs (among other things) `lefthook install`. That reads `lefthook.yml` and writes the corresponding hook into `.git/hooks/`.

If hooks ever go missing (e.g. after cloning fresh and skipping `prepare`, or after `.git/hooks` gets wiped), reinstall them directly:

```sh
npx lefthook install
```

Verify it took effect:

```sh
cat .git/hooks/pre-commit   # should be a lefthook-managed script
npx lefthook run pre-commit # runs the hook's jobs on demand, without committing
```

## The hook

`lefthook.yml`:

```yaml
pre-commit:
  parallel: true
  jobs:
    - run: npm run format
    - run: npm test
```

On every `git commit`, lefthook runs `npm run format` and `npm test` in parallel. If either job fails, the commit is blocked. `npm run format` is Prettier writing fixes in place; `npm test` is the full Playwright suite.

The point of running this as a git hook instead of a reminder in a doc: it's a gate an agent loop can't skip past by forgetting a step. A commit either passes real verification or it doesn't happen.

## Case study: `tests/recording.spec.ts`

`tests/recording.spec.ts` started as a Playwright codegen recording of the `/search` flow. The first attempt to commit it alongside the new lefthook config failed the pre-commit gate, surfacing three independent problems in a single run:

1. **Missing `format` script** — `npm run format` had no script to run. It had been dropped from `package.json` at some point after the recording was made.
2. **A typo in the recorded assertion** — the test asserted a heading that never existed ("The Sun Never Rises" instead of "The Sun Also Rises"), plus a redundant double-submit (pressing Enter and then also clicking the Search button) that raced against a screenshot assertion.
3. **A constant-truthiness bug in `playwright.config.ts`** — `reuseExistingServer: true || !!process.env.CI` always evaluated to `true`, so the webServer setting silently ignored `CI` entirely.

The fix addressed the root cause of each failure instead of relaxing the hook or the assertion:

- restored the `format` script in `package.json`
- corrected `reuseExistingServer` to `!process.env.CI`
- rewrote the recorded test to match the actual, working search flow (dropped the double-submit, dropped the screenshot assertion, fixed the heading text)

Per `CLAUDE.md`, a failing Playwright test is fixed by fixing the app or the test's expectations — never by loosening the assertion to match broken UI. That rule is what kept this from becoming a rubber-stamped commit: the hook failed, and the failure was treated as three real bugs to fix rather than an obstacle to route around.

## The loop, generalized

1. Record real usage (Playwright codegen, or hand-written from `getByRole`).
2. Commit. Let the pre-commit gate run the recording against the real app and the real formatting rules.
3. When it fails, read _why_ — a broken assertion, a missing script, a config bug, and an actually-broken feature all fail the same gate but need different fixes.
4. Fix root causes, never the gate itself or the assertion's target.
5. Commit again. A clean pass means the recording now matches reality, and every future commit is checked against it automatically.
