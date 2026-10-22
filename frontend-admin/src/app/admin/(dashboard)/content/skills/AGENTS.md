<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# skills

## Purpose
Editor for the Toolbox section: the technology entries shown in the public skills marquee, grouped by category (Languages, Frontend, Backend, Data, AI, Tools) with an optional context line and a featured flag. Entries are of type `skill`.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | `force-dynamic` server component. Reads `?page=` and `?category=` from `searchParams`; `category` is `undefined` unless it differs from `All`, then `getEntriesPaged({ type: 'skill', sort: 'order', category, page, perPage: 12 })` and renders `<SkillsClient key={`${page}-${category \|\| 'All'}`} initialBundle={bundle} initialCategory={sp.category \|\| 'All'} />`. |
| `SkillsClient.tsx` | `'use client'` list of skill cards with a category filter that rewrites the URL query (and clears `page`), plus an edit/create `Modal`. New entries default to `featured: true` and `order` = `skills.length + 1`; the category defaults to `Languages` when the current filter is `All`. Save = `saveDraftAction` or `createEntryAction` (`status: 'published'`, `seo: {}`), then `publishEntryAction`, then `window.location.reload()`. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| — | None |

## For AI Agents

### Working In This Directory
- Page size here is 12, not the 10 used by most other list editors.
- The category filter is applied server-side through the `category` query param on `getEntriesPaged` (which maps to the API `category` query), not by filtering the client list.
- The entry `title` mirrors `data.name`; `saveDraftAction` sends both.
- `data.category` must be one of the `TechCategory` union values in `@/types` (`Languages | Frontend | Backend | Data | AI | Tools`), which is also the `CATEGORIES` constant in this client.
- This is the smallest complete example of the list + modal + publish-on-save editor pattern; clone it when adding a new flat content type.

### Testing Requirements
- `pnpm -C frontend-admin typecheck`; manual check: switch categories, create a skill, publish, and confirm it appears in the public marquee under the right group.
- Verify the filter round-trip: choosing a category rewrites `?category=` and resets `?page=`.

### Common Patterns
- Filter state lives in the URL so the server component can filter before rendering; the client only mirrors the current value in `initialCategory`.

## Dependencies

### Internal
- `@/lib/cms/service` (`getEntriesPaged`), `@/app/admin/actions` (`saveDraftAction`, `createEntryAction`, `deleteEntryAction`, `publishEntryAction`), `@/components/ui/{Card,Button,Input,Modal,Badge,Pagination}`, `@/types` (`TechnologyData`, `TechCategory`).

### External
- next 16, react 19, lucide-react (`Plus`, `Edit2`, `Trash2`, `Wrench`, `Star`).

<!-- MANUAL: -->
