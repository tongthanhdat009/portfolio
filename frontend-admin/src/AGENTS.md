<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# src

## Purpose
The entire Next.js 16 admin CMS application. Root `/` redirects to `/admin`; every dashboard route is a `force-dynamic` server component that fetches through `lib/cms/service` and hands the data to a `*Client.tsx` editor. Absolute imports resolve via the `@/*` alias to this directory.

## Key Files
| File | Description |
|------|-------------|
| `types/index.ts` | Full domain model: `CmsEntry`, `CmsPublication`, `CmsRevision`, `MediaAsset`, `AuditLog`, `CmsGlobals`, `PageSectionItem` (11 section types), and per-type data models (`ProjectData`/`ProjectCaseStudy`, `CapabilityData`, `TechnologyData`/`TechCategory`, `ExperienceData`, `ExperimentData`, `NoteData`, `ContentHealthIssue`). |
| `styles/globals.css` | Neo-brutalist design tokens in a Tailwind v4 `@theme` block: `--color-ink/paper/surface/sun/sky/coral/lime/pink`, `--color-muted-text/focus/negative/positive`, `--shadow-neo-sm|md|lg|xl|active`, `--radius-sm|md|lg|xl`, and the Space Grotesk / Manrope / IBM Plex Mono font stacks. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `app/` | Root layout, `/` redirect, and the whole `/admin` subtree (see `app/AGENTS.md`) |
| `components/` | Dashboard chrome (`layout/`) and neo-brutalist primitives (`ui/`); `cms/` is an empty placeholder (see `components/AGENTS.md`) |
| `lib/` | Auth, API client and the CMS service layer (see `lib/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Server/client split is strict: `page.tsx` fetches (never mutates), `*Client.tsx` mutates through the server actions in `app/admin/actions.ts` inside `useTransition`, then reloads or refreshes.
- All service reads go through `apiFetch` (`lib/api/client.ts`). The only direct `fetch` calls against the API are the login/me/logout trio in `lib/auth.ts`.
- Backend field mapping lives in `toEntry` / `toApiPayload` (`lib/cms/service.ts`), notably `seo.ogImage` ↔ `seo.ogMediaId`. New backend fields must be mapped in both directions or reads and writes silently diverge.
- `lib/auth.ts` (the file) holds the session helpers; `lib/auth/` next to it is an empty placeholder directory, and `components/cms/` is empty too.

### Testing Requirements
- No test runner is configured in this package. Verify with `pnpm -C frontend-admin typecheck` (`tsc --noEmit`) and `pnpm -C frontend-admin build`.
- Dev server runs on `:3001`; the Laravel API is expected at `:9000` (`API_BASE_URL`).

### Common Patterns
- Every route page exports `export const dynamic = 'force-dynamic'` — content must never be statically cached in the admin.
- Types live only in `types/index.ts`; model shapes are imported from `@/types`, never redeclared inline.

## Dependencies

### Internal
- `types` ← `lib` ← `app` + `components` (one-way; `types` imports nothing local).

### External
- next 16, react 19, tailwindcss 4, lucide-react, clsx, tailwind-merge. Runtime backend: Laravel API (`/api/v1`) with Mongo + S3 via the repo-root `compose.yaml`.

<!-- MANUAL: -->
