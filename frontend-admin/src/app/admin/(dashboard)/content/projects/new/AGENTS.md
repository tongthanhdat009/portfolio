<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# new

## Purpose
Create route for a project. It renders the same editor component as the edit route in "new" mode, with no data fetch — the entry is created by the editor's first save and the browser is then redirected to its id route.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | `force-dynamic` server component with a single statement: `return <ProjectEditorClient isNew={true} />`. It imports the editor from the parent directory (`../ProjectEditorClient`). |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| — | None |

## For AI Agents

### Working In This Directory
- In `isNew` mode the editor hides the PREVIEW and PUBLISH buttons (there is nothing to publish yet) and only exposes SAVE DRAFT.
- The first save calls `createEntryAction` with `status: 'draft'`, `sortOrder: 1` and `references: []`, then `router.push('/admin/content/projects/<created._id>')` + `router.refresh()` — so the user lands on the `[id]` route with the new entry loaded.
- After creation the editor switches to edit mode (`isNew` is still true for the current mount), so a second save within the same mount takes the `saveDraftAction` branch against an entry that does not exist yet in `initialEntry`. Reload after creating to avoid that state.
- Defaults in the editor: `year: '2026'`, `index: '01'`, `category: 'Web Products'`, `status: 'In Production'`, `accent: 'sun'`, `featured: false`.

### Testing Requirements
- `pnpm -C frontend-admin typecheck`; manual check: open `/admin/content/projects/new`, fill title + slug, save, confirm the URL changes to `/admin/content/projects/<id>` and the entry exists as a draft.

### Common Patterns
- Create and edit share one component; the only difference is the `isNew` prop and whether `initialEntry` is provided.

## Dependencies

### Internal
- `../ProjectEditorClient`, `@/app/admin/actions` (via the editor: `createEntryAction`, `saveDraftAction`).

### External
- next 16, react 19.

<!-- MANUAL: -->
