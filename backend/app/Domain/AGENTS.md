<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# Domain

## Purpose
Framework-free canonical registries for content shape. This is the single source of truth for entry types, block types, page and global keys, statuses, and per-type `data` validation rules — it has no persistence, no Eloquent, and no dependencies on the rest of the application.

## Key Files
| File | Description |
|------|-------------|
| `Content/SchemaRegistry.php` | `ENTRY_TYPES`, `BLOCK_TYPES`, `LEGACY_BLOCK_ALIASES`, `PAGE_KEYS`, `GLOBAL_KEYS`, `STATUSES`, plus `dataRules(string $type)`, `requiresSlug(string $type)`, and `requiresKey(string $type)` |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `Content/` | The single `SchemaRegistry` class (see `Content/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Keep this directory dependency-free: no Eloquent, no facades, no `config()` calls, no HTTP. Pure constants and static rule arrays only.
- To add a content type or block, extend `ENTRY_TYPES`/`BLOCK_TYPES` and add the matching `dataRules()` arm together — unknown types silently fall back to a generic `['data' => ['nullable', 'array']]` shape.
- Use canonical block keys for new data (`hero_poster`, not `hero`). `LEGACY_BLOCK_ALIASES` exists to migrate old content only.
- `requiresSlug()` returns true for `project`, `note`, `experiment`; `requiresKey()` returns true for `page`, `global`. Both are enforced by `ContentService::assertSlugAvailable()`.
- `PAGE_KEYS` is `home`, `about`, `contact`; `GLOBAL_KEYS` is `site`, `navigation`, `footer`, `seo`.

### Testing Requirements
- From the repo root: `docker compose exec backend php artisan test`. From inside `backend/`: `composer test`.
- Bare-host `php artisan test` fails — the host lacks the MongoDB PHP extension.
- Registry changes surface through `tests/Feature/EntriesTest.php` and `tests/Feature/PagesGlobalsTest.php`; they assert entry creation, slug/key requirements, and page/global key handling.

### Common Patterns
- Constants are uppercase class constants; rule arrays are plain arrays returned by a `match` expression.
- Docblocks cite the spec (`spec 4.5`) — preserve that convention.
- New rules go into `dataRules()` rather than into the FormRequests, so validation and domain stay in sync.

## Dependencies

### Internal
- Consumed by `App\Application\Services\ContentService` (slug/key requirements) and `App\Application\Services\PublishService`.
- Consumed by `App\Http\Requests\Api\V1\Admin\StoreEntryRequest` and `UpdateEntryRequest` for `data` validation.

### External
- None — standard library only.

<!-- MANUAL: -->
