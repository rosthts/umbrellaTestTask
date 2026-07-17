# Umbrella QA Automation — Playwright E2E Suite

Playwright test project for the Umbrella FinOps platform (`https://dev.umbrellacost.dev`).

- **API suite** — auth, API-key generation flow, user-role/whoami check, and a negative case.
- **UI suite** — login and a Cost & Usage Explorer journey, plus an RBAC check.

## Setup

1. Clone the repo.
2. Copy `.env.example` to `.env` and fill in the credentials:
   ```
   BASE_URL=https://dev.umbrellacost.dev
   API_BASE_URL=https://api.dev.umbrellacost.dev
   USER_EMAIL=<shared dev account email>
   USER_PASSWORD=<shared dev account password>
   ```
   `.env` is gitignored, credentials never get committed. `API_BASE_URL` is the dev API host — it's a different deployment from the public API in the official docs (`api.umbrellacost.io`), see "Known limitations".
3. Install everything:
   ```bash
   npm install
   npx playwright install chromium --with-deps
   ```
4. Run it:
   ```bash
   npm test          # api + ui
   npm run test:api  # API suite only
   npm run test:ui   # UI suite only
   npm run report    # open the last Playwright HTML report
   ```
5. Allure report is optional and needs a local Java runtime (JRE 8+):
   ```bash
   npm run allure:generate
   npm run allure:open
   ```

## Code quality

```bash
npm run lint:check    # ESLint, zero warnings allowed
npm run lint:fix
npm run format:check  # Prettier
npm run format:fix
npm run format:all    # both fixes
```

## CI

`.github/workflows/playwright.yml` runs lint, format check, and the tests on every push/PR to `main` (and manually), and uploads the Playwright and Allure reports as artifacts. Needs two repo secrets: `USER_EMAIL` and `USER_PASSWORD` (Settings → Secrets and variables → Actions) — same values as your local `.env`.

## Project structure

```
src/
  api/
    apiManager.ts        # composition root — one property per domain, no logic of its own
    auth/
      authApiClient.ts   # raw HTTP calls, returns the response as-is, no assertions
      authService.ts     # assert + parse, the actual login/api-key/whoami flow
      types.ts           # wire-format request/response types
    common/
      env.ts             # required-env-var helpers
      responseChecks.ts  # shared status-code assertion
  pages/
    basePage.ts          # shared byId() locator helper
    loginPage.ts
    costUsagePage.ts
    accountPage.ts        # Account → Roles & Users, used by the RBAC test

tests/
  fixtures.ts             # shared `credentials` fixture
  api/
    fixtures.ts
    auth/
      auth.test.ts        # login: positive + negative (wrong password → 403)
      apiKey.test.ts      # account-api-key generation flow
      whoami.test.ts      # role check (+ a documented limitation, see below)
  ui/
    fixtures.ts           # loginPage/costUsagePage/accountPage fixtures + error tracking
    costUsage.test.ts     # login → Cost & Usage Explorer → group by Region → assert
    rbac.test.ts          # Editor role can't manage roles/users (bonus)
```

## Design choices

- **Controller/Service split on the API side.** `AuthApiClient` just returns the raw response, no assertions. `AuthService` does the assert + parse. That's what lets the same client method cover both a positive and a negative test — the negative one needs the raw status code, not an exception thrown before it gets to check anything.
- **`expectedStatus` param instead of a separate method for negative cases.** `signIn(data, expectedStatus = 200)` checks whatever status you pass it, and only returns the clean parsed shape on 200. One method, both directions.
- **`ApiManager` doesn't do anything itself** — just one property per domain. All the actual logic lives in `AuthService`, so the manager doesn't grow as more endpoints get added.
- **`signin`'s `username` field is actually the Cognito userKey (a UUID), not the email** — found this out with curl. `AuthService.signIn` renames it to `userKey` so nothing downstream has to remember that.
- **Page Objects only hold locators and actions, not assertions** — same idea as the Controller/Service split. `groupBy()` does the action, `groupByOption()`/`breadcrumb` return locators, the test decides what to check.
- **`BasePage.byId()`** matches `data-automation-id`, `automation-id`, or plain `id` — the app uses all three inconsistently. Also filters to visible elements only, since the Group By dropdown keeps every tab's options mounted in the DOM even when hidden.
- **One `credentials` fixture** shared by both the API and UI fixture files, so there's exactly one place reading `.env`.
- **Chromium only**, to keep things fast for this assignment's scope.
- **RBAC test checks two different "disabled" mechanisms.** The "Multi Assignment" button uses a real `disabled` attribute. The "add user" icon is wrapped in a `pointer-events: none` div instead — no `disabled` attribute at all, just CSS (which is inherited, so checking it on the button itself still works).
- **`AccountPage` goes straight to `/account`** instead of clicking through the profile dropdown, and waits for the roles table to actually render before returning. Both of those were real, reproducible sources of flakiness — the dropdown re-renders async (a notification badge pops in) which detached the element mid-click, and the roles table loads async after the tab switch, which timed out once on a slower CI runner. Took a couple of wrong turns to find both (first assumed it was about running tests in parallel against the shared account, tried a shared-session setup instead) before the actual causes showed up in failure traces.
- **Allure reporting (bonus)** via `allure-playwright`, alongside the plain HTML reporter.
- **Console/network error tracking (bonus).** An auto-fixture fails a UI test on uncaught exceptions or 5xx responses, and just attaches `console.error` output to the report without failing on it — the app loads GTM/FullStory scripts that log their own unrelated warnings.

## What I checked by hand

- The whole documented Cost API auth flow (signin → users → account-api-key) with curl against `api.dev.umbrellacost.dev`, before writing any client code.
- That `GET /api/v1/users/with-roles` (the documented whoami endpoint) returns a 500 on this dev environment — reproduced with curl independently, not just inside the test run.
- Every `data-automation-id`/`automation-id` selector, in DevTools, before writing the Playwright locator for it.
- The full `npm test` run end-to-end, several times, not just once and not just each suite separately.

## AI tools used

Built with Claude Code end-to-end — exploring the app and API docs, going back and forth on the Controller/Service/Page Object structure, and reviewing each file as I wrote it (wrong headers, wrong URLs, flaky selectors, a couple of real bugs like an unassigned locator and a TS init-order issue). I wrote the actual test code and page objects myself; Claude did the initial API/UI recon (network capture, DevTools digging) and caught most of the bugs above before they became a problem.

## Known limitations

- `GET /api/v1/users/with-roles` returns 500 on this dev environment — marked `test.fixme` with the reason inline instead of deleted, so it's easy to turn back on later. The "User role verification" test covers the same thing (current user's email + role) through the already-working `GET /api/v1/users` instead.
- `tokenizer.umbrellacost.io/prod/credentials` (the public docs' auth endpoint) doesn't authenticate this dev account — confirmed 401 via curl. The dev environment has its own signin endpoint, which the suite uses instead.
- UI suite covers one Cost & Usage journey and one RBAC check, not exhaustive coverage — given the scope of this assignment.
- Allure report generation needs a local JRE, which isn't installed here — verified `allure-results/` gets produced correctly, but only saw the actual HTML report via the CI artifact, not locally.
- No test creates anything in the account, so there's no teardown to write.
- Shared dev account — nothing destructive happens; the negative login test just sends a wrong password once.
