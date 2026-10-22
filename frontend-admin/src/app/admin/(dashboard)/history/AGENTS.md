<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# history

## Purpose
Versioning and recovery screen: pick an entry, inspect its revision timeline, and restore any past revision as a **new draft** (never an in-place overwrite of the current revision).

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | `force-dynamic` server component. Loads the entry list with `getEntries({ sort: 'updated' })`, picks the selected entry from `?entry=` (falling back to the first entry) and loads its revisions with `getRevisionsPaged(entryId, { page: revPage, perPage: 10 })` where `revPage` comes from `?revPage=`. Renders `<HistoryClient key={`${entryId}-${revPage}`} entries={entries} initialEntryId={entryId} revisionsBundle={revisionsBundle} />`. |
| `HistoryClient.tsx` | `'use client'` two-column studio (7/5 split): a revision timeline list on the left and a JSON snapshot inspector on the right. The entry `<select>` rewrites `?entry=` and clears `?revPage=`. `handleRestore` calls `restoreRevisionAction(rev.entryId, rev.revision)` and then `window.location.reload()`. Pagination uses the `revPage` query param via the `param` prop of the `Pagination` component. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| — | None |

## For AI Agents

### Working In This Directory
- Two independent query params are in play: `entry` selects the document, `revPage` pages its revisions. `Pagination` takes a `param` prop precisely because the default `page` would clash.
- Restore is additive: the CMS creates a new revision from the old snapshot and the current revision counter advances. The UI states this in the success message ("restored snapshot from rev #N as new draft rev #M").
- `CmsRevision.snapshot` is typed `any` but the CMS service maps revisions with `snapshot: undefined` — the inspector's `JSON.stringify(selectedRev.snapshot, null, 2)` therefore renders `undefined` unless the API starts returning snapshot bodies. Do not assume the snapshot panel shows real data.
- The revision list is rendered straight from the server bundle (`revisionsBundle.items`); the client does not refetch.

### Testing Requirements
- `pnpm -C frontend-admin typecheck`; manual check: select an entry, page through its revisions, restore one, and confirm a new draft revision appears and the public site is unchanged until it is published.
- Confirm that `?entry=<id>&revPage=2` restores the correct pagination on reload.

### Common Patterns
- Selection state that must survive a reload lives in the URL, not in component state; `key` on the client component resets local state when the query changes.

## Dependencies

### Internal
- `@/lib/cms/service` (`getEntries`, `getRevisionsPaged`), `@/app/admin/actions` (`restoreRevisionAction`), `@/components/ui/{Card,Button,Badge,Modal,Pagination}`, `@/types` (`CmsEntry`, `CmsRevision`).

### External
- next 16, react 19, lucide-react (`History`, `Undo2`, `Clock`, `CheckCircle2`, `AlertCircle`, `FileCode`).

<!-- MANUAL: -->
