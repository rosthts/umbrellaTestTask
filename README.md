# Umbrella QA Automation — Playwright E2E Suite

Playwright test project for the Umbrella FinOps platform (`https://dev.umbrellacost.dev`), covering:

- **API suite** — authentication, API-key generation flow, user-role/whoami verification, and a negative case.
- **UI suite** — login and a Cost & Usage Explorer journey (grouping the chart, asserting the resulting page state).

## Setup

1. Clone the repo.
2. `cp .env.example .env` and fill in the credentials:
   ```
   BASE_URL=https://dev.umbrellacost.dev
   API_BASE_URL=https://api.dev.umbrellacost.dev
   USER_EMAIL=<shared dev account email>
   USER_PASSWORD=<shared dev account password>
   ```
   `.env` is gitignored — credentials are never committed. `API_BASE_URL` points at the dev API host (`api.dev.umbrellacost.dev`), which is a separate deployment from the public API described in the official docs (`api.umbrellacost.io`) — see "Known limitations" below.
3. Install dependencies and the browser binary:
   ```bash
   npm install
   npx playwright install chromium --with-deps
   ```
4. Run everything:
   ```bash
   npm test          # api + ui projects
   npm run test:api  # API suite only
   npm run test:ui    # UI suite only
   npm run report     # open the last HTML report
   ```

## CI

`.github/workflows/playwright.yml` runs the full suite on every push/PR to `main` (and on manual dispatch), and uploads the HTML report as a build artifact. It needs two repo secrets set under **Settings → Secrets and variables → Actions**: `USER_EMAIL` and `USER_PASSWORD` (the same shared dev-account credentials as in your local `.env`). `BASE_URL`/`API_BASE_URL` aren't secrets — they're set directly in the workflow.

## Project structure

```
src/
  api/
    apiManager.ts        # thin composition root — one property per domain, no business logic
    auth/
      authApiClient.ts   # Controller: raw HTTP calls, returns APIResponse as-is (no assertions)
      authService.ts      # Service: assert + parse, business flow (login, api-key, whoami)
      types.ts            # wire-format request/response types per endpoint
    common/
      env.ts              # required-env-var helpers
      responseChecks.ts   # shared status-code assertion helper
  pages/
    basePage.ts           # shared byId() locator helper (handles both automation-id conventions)
    loginPage.ts
    costUsagePage.ts       # Page Objects: locators + actions only, no assertions

tests/
  fixtures.ts              # shared `credentials` fixture (used by both api/ and ui/ fixtures)
  api/
    fixtures.ts            # apiManager / authToken / accountApiKey fixtures
    auth/
      auth.test.ts          # login: positive + negative (invalid password → 403)
      apiKey.test.ts        # account-api-key generation flow
      whoami.test.ts        # role verification (+ documented with-roles limitation, see below)
  ui/
    fixtures.ts             # loginPage / costUsagePage fixtures
    costUsage.test.ts        # login → Cost & Usage Explorer → group by Region → assert state
```

## Design choices

- **Controller vs. Service split (API).** `AuthApiClient` methods return the raw Playwright `APIResponse` — no `expect`, no thrown errors. `AuthService` methods do the assertion + parsing. This is what lets the *same* client method serve both positive and negative tests: a negative test needs the raw status code, not an exception thrown before it can inspect anything.
- **`expectedStatus` parameter instead of a separate "negative" method.** `AuthService.signIn(data, expectedStatus = 200)` asserts against whatever status the caller expects, and returns the clean success shape only when `expectedStatus === 200` (otherwise the raw error body). One method covers both directions of a test instead of two near-duplicate ones.
- **`ApiManager` is a pure composition root.** It only holds one `readonly` property per domain (`auth`, and any future domain). All business logic lives in that domain's own `*Service` class, so the manager itself never grows regardless of how many endpoints/domains get added.
- **Field name remapping at the service boundary.** The `/signin` response has a field literally called `username` that actually holds the Cognito `userKey` (a UUID), not the email. `AuthService.signIn` remaps this to `{ jwtToken, userKey }` so nothing downstream has to know about that wire-format quirk.
- **Page Objects hold locators + actions; tests hold assertions.** Mirrors the Controller/Service split — `CostUsagePage.groupBy()` performs the action, `costUsagePage.groupByOption(key)` / `.breadcrumb` return locators, and the test file decides what to assert against them.
- **`BasePage.byId()`** matches `data-automation-id`, `automation-id`, *and* plain `id`, since the app inconsistently uses more than one convention. It also filters to `:visible` matches — the Group By dropdown keeps all tab panels (Cloud/K8s/Custom) mounted in the DOM simultaneously, so an unfiltered selector matches multiple hidden duplicates.
- **One shared `credentials` fixture** (`tests/fixtures.ts`) that both `tests/api/fixtures.ts` and `tests/ui/fixtures.ts` extend, so `.env` credentials are read from exactly one place.
- **Chromium only.** Installed and run against a single browser to keep the suite fast for the assignment's scope; the config is a one-line change to add more projects if needed.

## What I verified manually

- The full documented Cost API auth flow (`signin` → `users` → forming the `account-api-key`) via curl, against `api.dev.umbrellacost.dev`, before writing any client code — including capturing the real response shapes used to type `authService.ts`/`types.ts`.
- That `GET /api/v1/users/with-roles` (the documented "Get Users and Roles"/whoami endpoint) returns `500 Internal Server Error` on this dev environment with a correctly-formed token and account-api-key — reproduced independently via curl with fresh credentials, not just inside the test runner.
- All `data-automation-id` / `automation-id` selectors used in the Page Objects, via browser DevTools, before writing the corresponding Playwright locators.
- The full `npm test` run (API + UI together) end-to-end, not just each suite in isolation.

## AI tools used

Built with **Claude Code** (Anthropic) end-to-end: exploring the app and its API docs, drafting and reviewing the Controller/Service/Page-Object architecture, and pair-writing the fixtures/tests. Test logic and page objects were written by me, with Claude reviewing each file for bugs (wrong headers, wrong URLs, unstable selectors, TS init-order issues) before moving to the next step, and doing the initial API/UI recon (network capture, DevTools attribute discovery) to inform what to build.

## Known limitations

- **`GET /api/v1/users/with-roles` returns 500 on the dev environment.** This is the documented public-API "whoami" endpoint; it's marked `test.fixme` with the reason inline rather than deleted, so it's easy to re-enable if the environment gets fixed. The "User role verification" describe block covers the same requirement (current user's email + role) using the already-working `GET /api/v1/users` response instead.
- **`tokenizer.umbrellacost.io/prod/credentials`** (the public-docs auth endpoint) does not authenticate this dev account — confirmed via curl (`401 Unauthorized`). The dev environment has its own equivalent (`api.dev.umbrellacost.dev/api/v1/users/signin`), which is what the suite uses.
- **UI suite covers one meaningful journey**, not exhaustive coverage of the Cost & Usage Explorer (grouping only — not date-range picking or every filter combination), given the assignment's scope of a few focused hours.
- **No teardown of created artifacts** — no test creates any resource in the account (read-only + one intentional negative login), so there's nothing to tear down.
- **Shared dev account.** No destructive actions were taken against it; the negative-login test only sends a wrong password (no lockout observed), and no other users' data was touched.
