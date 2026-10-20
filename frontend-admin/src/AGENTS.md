<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 -->
# src/

Purpose: Entire Next.js 16 admin CMS application. Root `/` redirects to `/admin`; every dashboard route is a `force-dynamic` server component that fetches through `lib/cms/service` and hands data to a `*Client.tsx` editor. Absolute imports resolve via `@/*`.

## Key Files

| File | Role |
|------|------|
| `types/index.ts` | Full domain model: `CmsEntry`, `CmsPublication`, `CmsRevision`, `MediaAsset`, `AuditLog`, `CmsGlobals`, `PageSectionItem` (12 section types), per-type data models (`ProjectData`, `CapabilityData`, `TechnologyData`, `ExperienceData`, `ExperimentData`, `NoteData`) |
| `styles/globals.css` | Neo-brutalist design tokens (`@theme`): ink/paper/surface/sun/sky/coral/lime/pink, `shadow-neo-*`, `radius-*`, Space Grotesk / Manrope / IBM Plex Mono fonts |

## Subdirectories

| Dir | Guide |
|-----|-------|
| `app/AGENTS.md` | Root layout, redirect, admin subtree |
| `components/AGENTS.md` | Layout shell and UI primitives |
| `lib/AGENTS.md` | Auth, API client, CMS service layer |

No `data/` directory exists. `components/cms/` and `lib/auth/` are empty placeholder dirs. `types/` and `styles/` are single-file dirs documented above, no separate guides.

## For AI Agents

- Server/client split is strict: `page.tsx` fetches (never mutates), `*Client.tsx` mutates via `app/admin/actions.ts` server actions inside `useTransition`, then `window.location.reload()` or router refresh.
- All service reads go through `apiFetch` (`lib/api/client.ts`); never call `fetch` against the API directly except the login/me/logout trio in `lib/auth.ts`.
- Backend field mapping lives in `toEntry`/`toApiPayload` (`lib/cms/service.ts`), notably `seo.ogImage` ↔ `seo.ogMediaId`. New fields must be mapped both ways.
- Testing: no test runner configured. Verify with `pnpm typecheck` (`tsc --noEmit`) and `pnpm build`. Dev server runs on `:3001`, Laravel API expected at `:9000` (`API_BASE_URL`).

## Dependencies

Internal: `types` ← `lib` ← `app`, `components`. External: `next@16`, `react@19`, `tailwindcss@4`, `lucide-react`, `clsx` + `tailwind-merge`. Runtime backend: Laravel API (`/api/v1`), Mongo + S3 via `compose.yaml` at repo root.

<!-- MANUAL: -->
