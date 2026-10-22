<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# [id]

## Purpose
Dynamic route that loads one CMS entry by id and renders the shared project editor in edit mode. The `[id]` segment is the CMS entry `_id` (not the project slug), so the URL is `/admin/content/projects/<entryId>`.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | `force-dynamic` server component. Awaits `params` (a Promise in Next 16), calls `getEntryById(id)`, calls `notFound()` when the entry is missing, and renders `<ProjectEditorClient initialEntry={entry} isNew={false} />`. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| — | None |

## For AI Agents

### Working In This Directory
- The route does **not** verify the entry type: any CMS entry id (a note, a capability, …) loads into the project form. If that matters, add a type check (`entry.type !== 'project'` → `notFound()`) rather than letting the editor silently write project-shaped data over another type's entry.
- The editor lives one directory up (`../ProjectEditorClient.tsx`); this file is intentionally a thin wrapper.
- `notFound()` renders the Next.js 404 boundary — make sure the parent layout still enforces the auth guard, since `notFound()` short-circuits the page body, not the layout.

### Testing Requirements
- `pnpm -C frontend-admin typecheck`; manual check: open a valid id → the editor loads with the saved values; open a bogus id → the 404 page appears.

### Common Patterns
- Route params are awaited (`params: Promise<{ id: string }>`), matching the `searchParams` promise convention used by the sibling list pages.

## Dependencies

### Internal
- `@/lib/cms/service` (`getEntryById`), `../ProjectEditorClient`, `next/navigation` (`notFound`).

### External
- next 16, react 19.

<!-- MANUAL: -->
