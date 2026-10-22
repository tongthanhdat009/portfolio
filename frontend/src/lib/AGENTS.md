<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# lib

## Purpose
The data-access and helper layer. `cms/` merges Laravel CMS API data over the local `content/` fallbacks, `api.ts` is the HTTP client, `admin/auth.ts` guards the local console, and `validation/` holds the form and slug checks. Pages never touch anything below `lib/cms` directly.

## Key Files
| File | Description |
|------|-------------|
| `cms/index.ts` | The CMS adapter — the only module pages import from. Exports `getSiteSettings`, `getAnnouncement`, `getHomePageData`, `getCapabilities`, `getProjects`, `getProjectBySlug`, `getTechnologies`, `getExperience`, `getExperiments`, `getExperimentBySlug`, `getNotes`, `getNoteBySlug`, plus the `SectionHeader` interface. Each accessor calls `lib/api`, maps the API payload with a local `to*` converter, and falls back to the local `content/` array when the API returns nothing |
| `api.ts` | The fetch client. `API_BASE` comes from `process.env.API_BASE_URL` (default `http://localhost:9000`). `fetchPublicationList(type)`, `fetchPublicationOne(type, slugOrKey)`, `fetchGlobals()`, `apiBase()`. Every request is tagged `cms-<type>` for Next cache invalidation |
| `admin/auth.ts` | PIN verification and the console session cookie — `verifyAdminPassword`, `setAdminSession`, `clearAdminSession`, `isAuthenticated` |
| `validation/index.ts` | `validateProjectSlug(slug)` and `validateContactForm({ name, email, message })` |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `admin/` | PIN auth and session cookie for the local console (see `admin/AGENTS.md`) |
| `cms/` | The CMS adapter and the `get*` accessors (see `cms/AGENTS.md`) |
| `validation/` | Slug and form validation helpers (see `validation/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Pages import only from `@/lib/cms`. Never import `@/lib/api` or `@/content/*` from a page or component.
- `api.ts` fails soft: any non-2xx response, network error, or JSON error returns `null`, and the accessors then use the local content. That contract is what lets the site build with the CMS down — do not turn it into a thrown error.
- The `get*` accessors are async and are called during rendering; they must stay side-effect free.
- `fetchPublicationList` maps singular API types to plural collection endpoints (`project` → `projects`, `note` → `notes`, `experiment` → `experiments`, `capability` → `capabilities`, `skill` → `skills`, `experience` → `experiences`) and requests `?limit=100`.
- `getHomePageData()` reads the `home` page publication and pulls `hero_poster`, `marquee`, `about_manifesto`, `experiment_grid`, and `notes_grid` blocks by type via `blockProps`; a block that is missing or `enabled: false` falls back to the local `content/homePage.ts` values field by field.
- The `to*` converters (`toProject`, `toNote`, `toExperiment`, `toCapability`, `toTechnology`, `toExperience`) are the CMS-to-local-type mapping. Keep them tolerant: every field uses `??` with a local default.
- Auth details: cookie `portfolio_admin_auth`, PIN from `ADMIN_PIN` (default fallback `neo2026`), SHA-256 token, 7-day expiry.

### Testing Requirements
- `pnpm typecheck` from the repo root.
- `pnpm build` after changing the accessors — the build statically renders every page and exercises the fallback path.
- Manual in `next dev`: (1) with the CMS running, confirm the API values win; (2) with `API_BASE_URL` pointed at a dead port, confirm the local content renders instead.

### Common Patterns
- One accessor per content type, named `get<Thing>` / `get<Thing>BySlug`.
- Sorting happens in the accessor (`order` ascending), not in the page.
- `getProjects(filter?)` and `getExperiments(status?)` / `getNotes(category?)` accept optional filters and compare case-insensitively where the UI shows a category chip.

## Dependencies

### Internal
- `@/content/*` — the fallback datasets
- `@/types` — the shared domain model
- `@/lib/api` → Laravel CMS API at `http://localhost:9000`
- `@/lib/admin/auth` → `next/headers` cookies
- `@/app/admin/actions.ts` → writes back into `@/content/*`

### External
- `next` — `next/headers` (`cookies`), `next/cache` (cache tags via `fetch` options)
- `node:crypto` — SHA-256 session token in `admin/auth.ts`

<!-- MANUAL: -->
