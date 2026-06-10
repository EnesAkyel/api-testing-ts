# api-testing-ts

![API Tests](https://github.com/ENESAKYEL/api-testing-ts/actions/workflows/api-tests.yml/badge.svg)

TypeScript API test automation framework demonstrating: typed HTTP client abstraction, AJV contract validation, suite separation, custom Jest matchers, and CI/CD with per-suite HTML and JUnit reports.

---

## Tech Stack

| Tool | Role |
|------|------|
| TypeScript (strict) | End-to-end type safety across client, types, and schemas |
| Jest | Test runner with suite-level separation |
| Axios | HTTP client, wrapped and abstracted in `ApiClient` |
| AJV | Runtime JSON schema validation for contract tests |
| jest-junit | JUnit XML reports — consumed by CI and test dashboards |
| jest-html-reporters | Interactive HTML reports for local review |
| ESLint + Prettier | Consistent code quality and formatting |

---

## Project Structure

```
src/
├── api/
│   ├── apiClient.ts      # Generic typed Axios wrapper (get/post/put/delete + durationMs)
│   ├── postsApi.ts       # Domain methods: getPosts, getPost, createPost, ...
│   ├── usersApi.ts
│   └── index.ts
├── types/
│   ├── post.ts           # Post interface
│   ├── user.ts           # User, Address, Geo, Company interfaces
│   ├── comment.ts
│   └── index.ts
├── schemas/
│   ├── postSchema.ts     # AJV JSONSchemaType<Post> + JSONSchemaType<Post[]>
│   ├── userSchema.ts
│   ├── commentSchema.ts
│   └── index.ts
├── helpers/
│   ├── schemaValidator.ts  # validateSchema() — throws with field-level error detail
│   └── assertions.ts       # Custom Jest matcher: toRespondWithin(ms)
├── config.ts             # Typed env config — reads .env, provides safe defaults
├── setup.ts              # Jest global setup: retry config + custom matcher registration
└── tests/
    ├── posts.test.ts              # Integration — full CRUD lifecycle + error cases
    ├── users.test.ts              # Integration — collection integrity + data consistency
    ├── smoke/
    │   ├── posts.smoke.test.ts    # @smoke — quick happy-path health checks
    │   └── users.smoke.test.ts
    └── contract/
        ├── posts.contract.test.ts # @contract — AJV schema validation per endpoint
        └── users.contract.test.ts # Validates nested address + company shapes
regression-tests/
└── posts.regression.test.ts      # @regression — cross-resource integrity + data consistency
```

---

## Prerequisites

- Node.js 20+
- npm 9+

---

## Setup

```bash
git clone <repo-url>
cd api-testing-ts
npm ci
cp .env.example .env
```

---

## Running Tests

| Command | Suite | What it checks |
|---------|-------|----------------|
| `npm run test:smoke` | Smoke | Service is up, endpoints return 200 |
| `npm run test:contract` | Contract | Response shapes match AJV schemas |
| `npm run test:integration` | Integration | Full CRUD + error cases + performance |
| `npm run test:regression` | Regression | Long-running suite against a local service |
| `npm test` | All | Everything — generates combined HTML + JUnit reports |

HTML and JUnit XML reports are written to `reports/` after each run.

---

## Environment Configuration

Copy `.env.example` to `.env` and adjust as needed:

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `https://jsonplaceholder.typicode.com` | Base URL of the API under test |
| `REQUEST_TIMEOUT_MS` | `30000` | Per-request Axios timeout (ms) |
| `RESPONSE_TIME_THRESHOLD_MS` | `3000` | Ceiling for `toRespondWithin` assertions (ms) |

To run the full suite against a different environment, set `BASE_URL` — no test code changes required.

---

## Code Quality

```bash
npm run lint          # ESLint — reports problems
npm run lint:fix      # ESLint — auto-fix where possible
npm run format        # Prettier — format all src files
npm run format:check  # Prettier — check without writing
```

---

## Design Decisions

### API Client Layer
Raw `axios.get(url)` calls inside tests are a maintenance hazard. Changing a base URL, adding an auth header, or adjusting a timeout would require touching every test file. `ApiClient` centralises all HTTP concerns; resource classes like `PostsApi` expose domain-level methods so tests read as specifications, not HTTP interactions.

### AJV Contract Validation
A `toBe(200)` check only catches outages. Contract drift — a field renamed, a type changed from `string` to `number`, a required property dropped — passes a status assertion silently. AJV schemas assert the full response shape at runtime and fail with a precise error naming every offending field.

### Custom `toRespondWithin` Matcher
Extending `expect` keeps performance assertions readable and produces failure messages that state both the threshold and the actual duration. A plain `expect(response.durationMs).toBeLessThan(3000)` gives you a number comparison; `expect(response).toRespondWithin(3000)` fails with context.

### Suite Separation
- **Smoke** — a fast gate (~1 s). If smoke fails, deeper suites won't add information.
- **Contract** — isolated from business logic. A contract failure means a breaking API change, not a test bug.
- **Integration** — covers the full CRUD lifecycle and error paths; slower and more brittle by nature.
- **Regression** — long-running suite against a real local service; intentionally excluded from standard CI.

### Typed Env Config
`config.ts` reads environment variables once at startup and exports a typed `config` object. Tests reference `config.baseUrl`, not `process.env.BASE_URL`. `requireEnv()` throws early with a clear message if a required variable is missing, rather than silently failing mid-test.

---

## CI/CD

GitHub Actions workflow (`.github/workflows/api-tests.yml`) runs on every push and pull request:

```
typecheck → smoke → contract ┐
                              ├─ (parallel)
                   smoke → integration ┘
```

1. **Type Check** — `tsc --noEmit` gates all test jobs
2. **Smoke** — fast gate; contract and integration only run if smoke passes
3. **Contract + Integration** — run in parallel after smoke

Reports are uploaded as artifacts on every run (including failures). The integration job publishes JUnit results to the PR checks panel via `dorny/test-reporter`.