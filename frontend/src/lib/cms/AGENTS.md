<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# cms

## Purpose
The CMS adapter — the seam between the public site and the Laravel CMS backend. Every page reads content through the `get*` accessors exported here; each accessor asks the API first, maps the publication payload into the local domain types, and falls back to the local `src/content/*.ts` dataset when the API is unreachable or returns nothing. The site therefore renders identically with or without the backend.

## Key Files
| File | Description |
|------|-------------|
| `index.ts` | Exports the accessors `getSiteSettings()`, `getAnnouncement()`, `getHomePageData()`, `getCapabilities()`, `getProjects(filter?)`, `getProjectBySlug(slug)`, `getTechnologies(category?)`, `getExperience()`, `getExperiments(status?)`, `getExperimentBySlug(slug)`, `getNotes(category?)`, `getNoteBySlug(slug)`, the `SectionHeader` interface (`eyebrow`, `headline`), the local `defaultLabHeader` / `defaultNotesHeader` constants, and the `EMPTY_CASE_STUDY` constant. Internal helpers: `blockProps(blocks, type)` picks the first enabled block of a type, and the `to*` converters (`toCapability`, `toProject`, `toTechnology`, `toExperience`, `toExperiment`, `toNote`) map an `ApiPublication` onto the local types |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| None | — |

## For AI Agents

### Working In This Directory
- This is the only module pages may import for data. Do not import `@/lib/api` or `@/content/*` from a page.
- The fallback rule is per-field, not per-record: each `to*` converter uses `??` with the local default, so a CMS record missing one field still renders with the local value for that field only.
- `getSiteSettings()` and `getAnnouncement()` read from `fetchGlobals()` (`globals.site.data.siteSettings` / `globals.site.data.announcement`) and fall back to `content/siteSettings.ts` and `content/announcements.ts`.
- `getHomePageData()` fetches the `home` page publication and reads the `hero_poster`, `marquee`, `about_manifesto`, `experiment_grid`, and `notes_grid` blocks. When the page or its `blocks` are missing it returns the local `heroData` / `marqueeKeywords` / `manifestoData` wholesale; otherwise each block field falls back individually.
- `getProjects`, `getExperiments`, `getNotes` accept optional filters (`category`, `featured`, `status`) and compare case-insensitively where the UI shows a category chip; `getProjects` sorts by `order`.
- `getProjectBySlug`, `getExperimentBySlug`, and `getNoteBySlug` try the single-publication endpoint first and fall back to the local array lookup.
- `EMPTY_CASE_STUDY` fills the seven `caseStudy` sub-objects for API records that omit them, so `/work/[slug]` never dereferences `undefined`.
- `toNote` accepts either a `content: string[]` array or a `markdownBody`/`body` string, which it wraps into a single-element array.
- Types come from `@/types` and are shared with the backend — change them in lockstep with the Laravel models.

### Testing Requirements
- `pnpm typecheck` from the repo root.
- `pnpm build` — the build statically renders every page, which exercises both the API path and the fallback path.
- Manual in `next dev`: (1) with the CMS running, confirm API values render; (2) point `API_BASE_URL` at a dead port and confirm the local content renders; (3) publish a record in the backend and confirm the site updates after the revalidate webhook fires.

### Common Patterns
- Accessors are async, side-effect free, and return the local domain types — never the raw `ApiPublication`.
- The `next: { tags: ['cms-<type>'] }` fetch option in `lib/api.ts` is what makes cache invalidation possible; keep the tag scheme intact when adding a new type.
- Field mapping uses `??` (nullish coalescing), not `||`, so an intentional empty string from the CMS is preserved.

## Dependencies

### Internal
- `@/lib/api` — `fetchPublicationList`, `fetchPublicationOne`, `fetchGlobals`, `ApiPublication`
- `@/content/siteSettings`, `@/content/announcements`, `@/content/homePage`, `@/content/capabilities`, `@/content/projects`, `@/content/technologies`, `@/content/experience`, `@/content/experiments`, `@/content/notes` — the fallbacks
- `@/types` — `SiteSettings`, `Announcement`, `HeroData`, `ManifestoData`, `CapabilityItem`, `Project`, `Technology`, `TechCategory`, `ExperienceItem`, `Experiment`, `Note`

### External
- Laravel CMS API at `http://localhost:9000` (via `@/lib/api`)

<!-- MANUAL: -->
