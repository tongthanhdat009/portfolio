<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 -->
# Domain

## Purpose
Framework-free canonical registries for content shape. Single source of truth for entry/block types, page/global keys, statuses, and per-type `data` validation rules.

## Key Files
| File | Role |
|------|------|
| `Content/SchemaRegistry.php` | `ENTRY_TYPES`, `BLOCK_TYPES`, `LEGACY_BLOCK_ALIASES`, `PAGE_KEYS`, `GLOBAL_KEYS`, `STATUSES`, `dataRules(string $type)` |

## Subdirectories
| Dir | Notes |
|-----|-------|
| `Content/` | Registry only; no entities or persistence, no separate AGENTS.md |

## For AI Agents
- New content types/blocks: extend `ENTRY_TYPES`/`BLOCK_TYPES` and the `dataRules()` match arm together; unknown types fall back to generic array shape.
- Canonical block keys only for new data (`hero_poster`, not `hero`); legacy aliases are migrate-old-content-only.
- Keep this dir dependency-free: no Eloquent, no facades, no config calls. Pure constants + static rules.

## Dependencies
- Internal: consumed by `App\Application\Services\ContentService`, `PublishService`, `StoreEntryRequest`/`UpdateEntryRequest`.
- External: none (stdlib only).

<!-- MANUAL: -->
