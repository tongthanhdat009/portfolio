<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# experience

## Purpose
Editor for the Journey section of the site: career, education, research, community and milestone entries, each with dates, an organisation, a role, a description and bullet highlights. Entries are of type `experience`.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | `force-dynamic` server component. Reads `?page=` and `?type=` from `searchParams`; `type` is passed through as the `category` filter of `getEntriesPaged({ type: 'experience', sort: 'order', category, page, perPage: 10 })`, then renders `<ExperienceClient key={`${page}-${sp.type \|\| 'all'}`} initialBundle={bundle} initialType={sp.type \|\| 'all'} />`. |
| `ExperienceClient.tsx` | `'use client'` list of timeline cards with a type filter (all / Work / Education / Research / Community / Milestone) that rewrites the URL query, plus an edit/create `Modal`. The entry `title` is derived as `` `${data.roleAtTime} @ ${data.organization}` ``. Highlights are edited as a newline-separated textarea and split back into `string[]` on save. Save = `saveDraftAction` or `createEntryAction`, then `publishEntryAction`, then `window.location.reload()`. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| — | None |

## For AI Agents

### Working In This Directory
- The `category` query parameter is overloaded: the CMS filters skills by category and experience entries by type, both through the same `category` field on `getEntriesPaged`.
- `data.highlights` is a `string[]` in the model but is edited as one newline-delimited textarea; splitting on `\n` and filtering empties happens in `handleSave`. Keep both directions in sync.
- The derived title means renaming only `roleAtTime` or `organization` changes the entry title on the next save — do not store the title independently in the form.
- New entries default to `year: '2026 — Present'`, `startDate: '2026-01'`, `endDate: 'Present'`, `isCurrent: true`, `type: 'Work'`, `accent: 'sun'`.

### Testing Requirements
- `pnpm -C frontend-admin typecheck`; manual check: filter by type, create an entry, verify the Journey timeline on the public site renders it.
- Verify the type filter URL round-trip: selecting a type rewrites `?type=` and resets `?page=`.

### Common Patterns
- Filter state lives in the URL, not in component state, so the server component can filter before rendering; the client mirrors the current value in `initialType`.

## Dependencies

### Internal
- `@/lib/cms/service` (`getEntriesPaged`), `@/app/admin/actions` (`saveDraftAction`, `createEntryAction`, `deleteEntryAction`, `publishEntryAction`), `@/components/ui/{Card,Button,Input,Modal,Badge,Pagination}`, `@/types` (`ExperienceData`, `ColorAccent`).

### External
- next 16, react 19, lucide-react (`Plus`, `Edit2`, `Trash2`, `Milestone`, `Calendar`).

<!-- MANUAL: -->
