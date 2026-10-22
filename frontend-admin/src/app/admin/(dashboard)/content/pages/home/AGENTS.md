<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# home

## Purpose
Homepage section builder. It edits the singleton `home` page entry as an ordered list of blocks (announcement, hero poster, skills marquee, about manifesto, capability grid, featured work, toolbox, journey, experiment grid, notes grid, contact poster) — reorder them, toggle them on/off, and set per-section props.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | `force-dynamic` server component. Fetches the singleton with `getEntryByKey('home')` and the project list with `getEntries({ type: 'project' })`, maps the projects to `{ id, title, status }` options and renders `<HomePageBuilderClient initialHomeEntry={homeEntry} allProjects={projectOptions} />`. |
| `HomePageBuilderClient.tsx` | `'use client'` builder (667 lines). Converts `entry.data.blocks` to display sections with `blocksToSections`, lets the user move sections up/down (re-indexing `order` to `idx + 1`), toggle `enabled`, and edit `props` per section through an inspector modal. Viewport switcher (desktop/tablet/mobile). Save writes `data.blocks = sectionsToBlocks(sections)` (deleting the legacy `data.sections` key) via `saveDraftAction(entry._id, { data }, entry.revision)`; publish goes through `publishEntryAction`. `seedHomeAction` creates the `home` entry with `defaultHomeBlocks()` when it does not exist yet. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| — | None |

## For AI Agents

### Working In This Directory
- The builder's section shape and the backend's block shape differ: the editor adds a display-only `name` field, `blocksToSections` adds it and `sectionsToBlocks` drops it. Never send `name` to the API, and never send `sections` — `handleSaveDraft` explicitly deletes `data.sections` before writing `data.blocks`.
- The canonical block order and the 11 block type names live in `@/lib/page-blocks` (`DEFAULT_ORDER`, `SECTION_NAMES`). Adding a block type means updating that file (and the backend's `SchemaRegistry::BLOCK_TYPES`) together.
- `props` is schemaless per section; the public frontend interprets it. The only cross-validated prop is `hero_poster.featuredProjectId`, which `getContentHealth()` checks against unpublished projects and reports as a blocker.
- The `allProjects` list is fetched on the server and passed as options for the hero project picker; it is not re-fetched client-side.
- Saving passes `entry.revision` as `expectedRevision`, so a stale tab gets a conflict error instead of clobbering a newer revision.

### Testing Requirements
- `pnpm -C frontend-admin typecheck`; manual check: reorder two sections, save, publish, reload the public homepage and confirm the order and enabled flags took effect.
- Check the empty state: when no `home` entry exists, the builder must offer the seed path (`seedHomeAction`) instead of failing on a null entry.

### Common Patterns
- Section state is derived from the entry at mount (`useState(() => blocksToSections(...))`), then edited locally and pushed to the server as a whole `data` payload — there is no per-section autosave.
- Save status is surfaced as a short mono string (`Saved rev #N at HH:MM:SS`, `Unsaved changes`, `Error: ...`).

## Dependencies

### Internal
- `@/lib/page-blocks` (`blocksToSections`, `sectionsToBlocks`, `defaultHomeBlocks`), `@/lib/cms/service` (`getEntryByKey`, `getEntries`), `@/app/admin/actions` (`saveDraftAction`, `publishEntryAction`, `seedHomeAction`), `@/components/ui/*`, `@/types` (`CmsEntry`, `PageSectionItem`).

### External
- next 16, react 19, lucide-react.

<!-- MANUAL: -->
