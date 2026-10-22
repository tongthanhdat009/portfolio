<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# projects

## Purpose
Project manager: the list of case studies plus the routes that host the project editor. This is the only content type with dedicated sub-routes — a create route (`new/`) and a dynamic edit route (`[id]/`) that share one editor component.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | `force-dynamic` server component. Reads `?page=`, `?q=`, `?status=`, `?category=` from `searchParams` and calls `getEntriesPaged({ type: 'project', status, search, category, page, perPage: 10 })`. When `status === 'all'` it requests `['draft', 'published']` (archived entries are excluded from the default tab). Renders `<ProjectsClient key={`${page}-${status}-${q}-${category}`} ... />`. |
| `ProjectsClient.tsx` | `'use client'` table of projects (482 lines): status tabs `all/published/draft/archived`, debounced search that rewrites `?q=`, a category select, per-row edit/duplicate/archive/restore/delete buttons, a permanent-delete confirmation modal, and header buttons for `syncGithubAction` and `importCvAction`. |
| `ProjectEditorClient.tsx` | `'use client'` project form (878 lines) shared by `new/` and `[id]/` via the `isNew` prop. Five tabs — Overview, Story & Architecture, Media & Assets, External Links, SEO Metadata — over the nested `caseStudy` model (overview/product/targetUsers/timeline/role, problem, contribution[], approach, highlights[], outcomes[], lessons[]). Tracks `currentRev` and passes it as `expectedRevision` to `saveDraftAction`; publishing re-saves the current state first, then calls `publishEntryAction` and shows a preflight summary in a modal. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `[id]/` | Edit an existing project by CMS entry id (see `[id]/AGENTS.md`) |
| `new/` | Create a project (see `new/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Duplicate creates a new entry titled `"<title> (Copy)"` with a slug suffixed `-copy-<4 digits>` and `status: 'draft'`, `featured: false`. The copy keeps `references` and the existing SEO with the copied title.
- "Delete" is a soft delete: `deleteEntryAction` archives. The UI labels it "PERMANENTLY DELETE ENTRY" but the CMS service only archives — do not add a hard-delete path without a backend endpoint.
- `syncGithubAction` and `importCvAction` create entries as **drafts**; they are never published automatically. Their result summaries are rendered in a mono status strip above the table.
- Category values are fixed strings (`Web Products`, `Backend & APIs`, `Intelligent Workflows`, `Developer Tools`, `Systems & Architecture`) and must match the `ProjectData['category']` union in `@/types`.
- The slug input lowercases and replaces non `[a-z0-9-]` characters with `-` as you type; the public route is `/work/<slug>`.
- The PREVIEW button opens `http://localhost:3000/work/<slug>` — a hardcoded dev URL, not an env-backed one.

### Testing Requirements
- `pnpm -C frontend-admin typecheck`; manual check: create → edit → publish → duplicate → archive → restore → delete a project, confirming the list reflects each step.
- Verify the search + filter + pagination combination, since all three rewrite the same URL query.

### Common Patterns
- The list keeps a local copy of `initialBundle` and patches it after each action, then calls `router.refresh()` so the server re-fetch stays authoritative.
- Two transitions are used where needed: `isPending` for ordinary actions, `isPublishPending` for the publish modal, so the two buttons can show independent loading state.

## Dependencies

### Internal
- `@/lib/cms/service` (`getEntriesPaged`), `@/app/admin/actions` (`createEntryAction`, `saveDraftAction`, `publishEntryAction`, `archiveEntryAction`, `restoreEntryAction`, `deleteEntryAction`, `syncGithubAction`, `importCvAction`), `@/lib/use-debounced-value`, `@/components/ui/*`, `@/types` (`CmsEntry`, `ProjectData`).

### External
- next 16, react 19, lucide-react.

<!-- MANUAL: -->
