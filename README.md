# api-testing-ts

![API Tests](https://github.com/EnesAkyel/api-testing-ts/actions/workflows/api-tests.yml/badge.svg)

TypeScript API test automation framework targeting [movie-catalog-api](https://github.com/EnesAkyel/movie-catalog-api): typed HTTP client abstraction, AJV contract validation, suite separation, and CI/CD with per-suite HTML and JUnit reports.

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
│   ├── apiClient.ts          # Generic typed Axios wrapper (get/post/put/delete + durationMs)
│   ├── moviesApi.ts          # Domain methods: getMovies, createMovie, updateMovie, deleteMovie
│   ├── studiosApi.ts         # Domain methods: getStudios, createStudio, updateStudio, deleteStudio
│   └── index.ts
├── types/
│   ├── movie.ts              # Movie interface { mid, name, genre, price, rating, studio }
│   ├── studio.ts             # Studio interface { sid, name }
│   ├── pageResponse.ts       # PageResponse<T> { content, page, size, totalElements, totalPages }
│   └── index.ts
├── schemas/
│   ├── movieSchema.ts        # AJV JSONSchemaType<Movie> + JSONSchemaType<Movie[]>
│   ├── studioSchema.ts       # AJV JSONSchemaType<Studio> + JSONSchemaType<Studio[]>
│   └── index.ts
├── helpers/
│   ├── schemaValidator.ts    # validateSchema() — throws with field-level error detail
│   └── assertions.ts         # Custom Jest matcher: toRespondWithin(ms)
├── config.ts                 # Typed env config — reads .env, provides safe defaults
├── setup.ts                  # Jest global setup: custom matcher registration
└── tests/
    ├── movies.test.ts                         # Integration — full CRUD lifecycle + error cases
    ├── studios.test.ts                        # Integration — full CRUD lifecycle + error cases
    ├── smoke/
    │   ├── movies.smoke.test.ts               # Quick happy-path checks against seeded data
    │   └── studios.smoke.test.ts
    ├── contract/
    │   ├── movies.contract.test.ts            # AJV schema validation + pagination shape
    │   └── studios.contract.test.ts
    └── regression-tests/
        └── movies.regression.test.ts          # Collection integrity + individual retrieval + write ops
```

---

## Prerequisites

- Node.js 20+
- npm 9+
- Docker (to run [movie-catalog-api](https://github.com/EnesAkyel/movie-catalog-api) locally)

---

## Setup

```bash
git clone https://github.com/EnesAkyel/api-testing-ts.git
cd api-testing-ts
npm ci
cp .env.example .env
```

Start the API under test:

```bash
git clone https://github.com/EnesAkyel/movie-catalog-api.git
cd movie-catalog-api
docker compose up -d
```

The API starts at `http://localhost:8080/api/v1` with seeded movies and studios.

---

## Running Tests

| Command | Suite | What it checks |
|---------|-------|----------------|
| `npm run test:smoke` | Smoke | Service is up, endpoints return 200 |
| `npm run test:contract` | Contract | Response shapes match AJV schemas |
| `npm run test:integration` | Integration | Full CRUD + error cases + performance |
| `npm run test:regression:local` | Regression | Collection integrity + data consistency against seeded data |
| `npm test` | All | Everything — generates combined HTML + JUnit reports |

HTML and JUnit XML reports are written to `reports/` after each run.

---

## Environment Configuration

Copy `.env.example` to `.env` and adjust as needed:

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `http://localhost:8080/api/v1` | Base URL of the API under test |
| `REQUEST_TIMEOUT_MS` | `30000` | Per-request Axios timeout (ms) |
| `RESPONSE_TIME_THRESHOLD_MS` | `3000` | Ceiling for `toRespondWithin` assertions (ms) |

For regression tests, copy `src/tests/regression-tests/.env.regression.example` to `.env.regression` and set `LOCAL_HOST_URL` if your API runs on a non-default address. `LOCAL_HOST_URL` takes priority over `BASE_URL`.

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
Raw `axios.get(url)` calls inside tests are a maintenance hazard. Changing a base URL, adding an auth header, or adjusting a timeout would require touching every test file. `ApiClient` centralises all HTTP concerns; resource classes like `MoviesApi` expose domain-level methods so tests read as specifications, not HTTP interactions.

### AJV Contract Validation
A `toBe(200)` check only catches outages. Contract drift — a field renamed, a type changed, a required property dropped — passes a status assertion silently. AJV schemas assert the full response shape at runtime and fail with a precise error naming every offending field.

### Custom `toRespondWithin` Matcher
Extending `expect` keeps performance assertions readable and produces failure messages that state both the threshold and the actual duration. A plain `expect(response.durationMs).toBeLessThan(3000)` gives you a number comparison; `expect(response).toRespondWithin(3000)` fails with context.

### Suite Separation
- **Smoke** — a fast gate (~1 s). If smoke fails, deeper suites won't add information.
- **Contract** — isolated from business logic. A contract failure means a breaking API change, not a test bug.
- **Integration** — covers the full CRUD lifecycle and error paths; slower and more brittle by nature.
- **Regression** — validates collection integrity and individual resource retrieval against seeded data; runs in CI on every merge to `main`.

### Test Isolation
All integration tests use `beforeAll` / `afterAll` to delete any pre-existing test data and clean up after themselves. Regression tests use dedicated MID ranges (5050–5053) that don't overlap with seeded data (1001–1030), preventing conflicts between runs.

---

## CI/CD

GitHub Actions workflow (`.github/workflows/api-tests.yml`) runs on every push and pull request. Each job that runs tests checks out and starts `movie-catalog-api` via Docker Compose before executing.

```
typecheck → test (smoke → contract → integration) → regression (main only)
```

1. **Type Check** — `tsc --noEmit` gates all test jobs
2. **Test** — starts the API, then runs smoke → contract → integration in sequence
3. **Regression** — runs on merge to `main` only; validates the full seeded dataset

Reports are uploaded as artifacts on every run (including failures). JUnit results are published to the PR checks panel via `dorny/test-reporter`.
