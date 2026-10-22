<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# Content

## Purpose
The canonical content-type registry: the one place that defines which entry types exist, which page blocks exist, which page and global keys are valid, and what shape each type's `data` payload must have. It is deliberately framework-free so both the HTTP validation layer and the domain services can depend on it.

## Key Files
| File | Description |
|------|-------------|
| `SchemaRegistry.php` | All registry constants and rule builders: `ENTRY_TYPES` (page, project, capability, skill, experience, experiment, note, global), `BLOCK_TYPES` (announcement, hero_poster, marquee, about_manifesto, capability_grid, featured_work, toolbox, journey, experiment_grid, notes_grid, contact_poster), `LEGACY_BLOCK_ALIASES` (hero→hero_poster, featuredWork→featured_work, capabilityMarquee→marquee), `PAGE_KEYS` (home, about, contact), `GLOBAL_KEYS` (site, navigation, footer, seo), `STATUSES` (draft, published, archived), `dataRules()`, `requiresSlug()`, `requiresKey()` |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| _(none)_ | Leaf directory for `Domain/` — the single `SchemaRegistry` class sits directly under it. |

## For AI Agents

### Working In This Directory
- Keep this dependency-free: no Eloquent, no facades, no `config()`, no HTTP. Pure constants and static rule arrays.
- Adding an entry type means changing two things in lockstep: the `ENTRY_TYPES` constant and the `dataRules()` `match` arm. Unknown types fall back to `['data' => ['nullable', 'array']]`.
- Adding a page block means changing `BLOCK_TYPES`; the `page` rules arm already validates `data.blocks.*.type` against `implode(',', self::BLOCK_TYPES)`.
- New data must use canonical block keys (`hero_poster`). `LEGACY_BLOCK_ALIASES` is for migrating old content only — never emit an alias in new payloads.
- `dataRules()` returns Laravel validation rules keyed by dotted paths (`data.summary`, `data.blocks.*.type`). Keep that dotted-path shape.
- The `project` arm also carries the admin editor and GitHub-sync keys (`title`, `slug`, `year`, `index`, `category`, `accent`, `tags`, `status`, `featured`, `demoUrl`, `repoUrl`, `coverImage`, `coverAlt`, `caseStudy`) — the parent `array` rules pass each subtree through.

### Testing Requirements
- From the repo root: `docker compose exec backend php artisan test`. From inside `backend/`: `composer test`.
- Bare-host `php artisan test` fails — the host lacks the MongoDB PHP extension.
- Registry changes are covered indirectly by `tests/Feature/EntriesTest.php` and `tests/Feature/PagesGlobalsTest.php` (entry creation, duplicate slug/key rejection, page and global key handling).

### Common Patterns
- Constants are uppercase class constants; rules are returned from `static` methods via a `match` expression.
- Docblocks cite the spec (`spec 4.5`) — preserve that convention.
- Validation rules live here rather than in FormRequests so the domain and the HTTP layer cannot drift.

## Dependencies

### Internal
- `App\Application\Services\ContentService` — calls `requiresSlug()`/`requiresKey()` during slug-availability checks.
- `App\Http\Requests\Api\V1\Admin\StoreEntryRequest` and `UpdateEntryRequest` — apply `dataRules()` to entry payloads.
- `App\Http\Controllers\Api\V1\Admin\ContentTypeController` — exposes the registry over the admin API.

### External
- None — standard library only. The rule arrays are consumed by Laravel's validator, not by this class.

<!-- MANUAL: -->
