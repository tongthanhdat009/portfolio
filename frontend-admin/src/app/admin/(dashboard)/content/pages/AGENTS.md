<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# pages

## Purpose
Container directory for the singleton page editors — CMS entries of type `page` that are addressed by `key` rather than by id (`home`, `about`, `contact`). Only the homepage builder exists today; `about` and `contact` are handled as globals in `settings/` instead of as page entries.

## Key Files
| File | Description |
|------|-------------|
| — | No files at this level; it only groups the page-type editors. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `home/` | Homepage section builder — the only page editor implemented (see `home/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- A page editor follows the same two-file shape as the collection editors: `page.tsx` fetches, `<Type>Client.tsx` edits. The difference is the lookup key: `getEntryByKey('home')` instead of `getEntriesPaged({ type: 'page' })`.
- `getEntryByKey` in `@/lib/cms/service` special-cases the page keys `home`, `about`, `contact` and fetches `/admin/pages/:key`; for any other key it scans the entry list for a matching `key` field. Keep new page keys inside that list or extend the special case deliberately.
- Page entries hold their content in `data.blocks` (an ordered array of `{ id, type, enabled, order, props }`), converted to/from the editor's display shape by `@/lib/page-blocks`. The legacy `data.sections` key is dropped on save.
- Adding a new page editor means also adding a route to the sidebar (`components/layout/AdminSidebar.tsx`) and, if the public site should read it, a matching route in the `frontend/` package.

### Testing Requirements
- `pnpm -C frontend-admin typecheck`; manual check for a new page editor: open it, reorder/enable a section, save, publish, and confirm the public page reflects the new block order.

### Common Patterns
- Section blocks are schemaless (`props: Record<string, any>`); the public frontend decides how to render each `type`. Do not move rendering logic into the admin.

## Dependencies

### Internal
- `@/lib/cms/service` (`getEntryByKey`, `getEntries`), `@/lib/page-blocks` (`blocksToSections`, `sectionsToBlocks`), `@/app/admin/actions`.

### External
- next 16, react 19.

<!-- MANUAL: -->
