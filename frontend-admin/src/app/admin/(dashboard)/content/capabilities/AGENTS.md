<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# capabilities

## Purpose
Editor for the "What I Build" capability board — the high-level architectural pillars rendered on the public homepage. It manages entries of type `capability`, each with a short display code, title, description and accent colour.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | `force-dynamic` server component. Parses `?page=` from `searchParams`, then `getEntriesPaged({ type: 'capability', sort: 'order', page, perPage: 10 })` and renders `<CapabilitiesClient key={page} initialBundle={bundle} />`. |
| `CapabilitiesClient.tsx` | `'use client'` grid of capability cards (code chip, accent badge, title, description) with EDIT and delete buttons, plus a create/edit `Modal` form. `handleSave` calls `saveDraftAction` (existing) or `createEntryAction` (new, `status: 'published'`), then `publishEntryAction`, then `window.location.reload()`. `handleDelete` calls `deleteEntryAction` and patches the local bundle. The form fields are code (max 12), accent, title (max 60), description (max 160). |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| — | None |

## For AI Agents

### Working In This Directory
- The list is ordered by `sortOrder` (`sort: 'order'`), and new entries get `sortOrder`/`order` = `capabilities.length + 1`. Because that count comes from the current page, the number can repeat across pages — order is not a stable global sequence.
- Entry `title` mirrors `data.title`; `saveDraftAction` sends both so the list and the CMS stay consistent.
- Publishing is immediate on save (draft save then publish in one transition). There is no separate "save as draft only" affordance here.
- Deleting is an archive: `deleteEntryAction` maps to `archiveEntry` in the CMS service.

### Testing Requirements
- `pnpm -C frontend-admin typecheck`; manual check: create a capability → it appears in the grid → publish → it is visible on the public homepage capability grid.
- Confirm pagination renders when more than 10 capabilities exist (`Pagination` hides itself when there is a single page).

### Common Patterns
- List + modal editing pattern shared with `skills/`, `experience/`, `notes/` and `experiments/`; clone from here when adding a type with a flat model.

## Dependencies

### Internal
- `@/lib/cms/service` (`getEntriesPaged`), `@/app/admin/actions` (`saveDraftAction`, `createEntryAction`, `deleteEntryAction`, `publishEntryAction`), `@/components/ui/{Card,Button,Input,Modal,Badge,Pagination}`, `@/types` (`CapabilityData`, `ColorAccent`).

### External
- next 16, react 19, lucide-react (`Plus`, `Edit2`, `Trash2`, `Cpu`, `Save`).

<!-- MANUAL: -->
