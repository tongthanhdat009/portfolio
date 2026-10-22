<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# app

## Purpose
Next.js App Router route tree for the public site. `layout.tsx` owns fonts, global metadata, and the site shell (skip link, announcement strip, header, footer); `page.tsx` composes the homepage from the section components; `not-found.tsx` renders the branded 404; `admin/` is the local PIN console; `api/internal/revalidate` is the HMAC-signed endpoint the Laravel CMS calls after a publish.

## Key Files
| File | Description |
|------|-------------|
| `layout.tsx` | Root layout. Loads `Space_Grotesk` / `Manrope` / `IBM_Plex_Mono` via `next/font/google` into `--font-display` / `--font-body` / `--font-mono`; `generateMetadata()` builds title template, OpenGraph, and Twitter cards from `getSiteSettings()`; renders `SkipLink` → `AnnouncementStrip` → `Header` → `<main id="main-content">` → `Footer` |
| `page.tsx` | Homepage. Fetches all CMS data in parallel (`getHomePageData`, `getSiteSettings`, `getCapabilities`, `getProjects`, `getProjectBySlug`, `getTechnologies`, `getExperience`, `getExperiments`, `getNotes`) and renders sections 02–11 in order |
| `not-found.tsx` | Branded 404 card with a "Return to Homepage" link. No data fetching |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `about/` | `/about` — static story page (see `about/AGENTS.md`) |
| `admin/` | `/admin` — local PIN content console (see `admin/AGENTS.md`) |
| `api/` | Route handlers; holds the CMS revalidation webhook (see `api/AGENTS.md`) |
| `contact/` | `/contact` — server shell + client form (see `contact/AGENTS.md`) |
| `lab/` | `/lab` and `/lab/[slug]` — experiments index and detail (see `lab/AGENTS.md`) |
| `notes/` | `/notes` and `/notes/[slug]` — field notes index and detail (see `notes/AGENTS.md`) |
| `work/` | `/work` and `/work/[slug]` — projects index and case studies (see `work/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Every page is a Server Component by default and reads data only through `@/lib/cms`.
- Slug detail pages (`work/[slug]`, `lab/[slug]`, `notes/[slug]`) follow one pattern: `generateStaticParams()` from the list accessor, `generateMetadata()` per slug, `notFound()` when the slug is unknown, and a "next item" footer link computed from the list index (wrapping to the first item).
- Index pages share a layout: breadcrumb link back to `/`, an eyebrow + oversized uppercase title with a `border-b-4` rule, then a card grid. Keep that structure consistent across `/work`, `/lab`, `/notes`.
- `generateStaticParams` runs at build time against whatever the CMS returns then; the CMS revalidation webhook is what refreshes them afterwards.
- Never fetch the CMS API directly from a page — go through `@/lib/cms`.

### Testing Requirements
- `pnpm typecheck` (root) covers the TypeScript; `pnpm build` is required for route wiring, `generateStaticParams`, and metadata.
- Verify a new route in `next dev` by navigating to it directly, then check `/admin` still builds if you changed the admin actions.
- The revalidate endpoint has no test harness — exercise it with a correctly signed POST (see `api/internal/revalidate/AGENTS.md`).

### Common Patterns
- Section numbering is inconsistent between two places: the comments in `page.tsx` count sections 02–11 (Hero = 02), while the visible eyebrow labels inside the section components count 01–09 (Hero = 01, Marquee unnumbered). Trust the rendered eyebrows, not the `page.tsx` comments.
- Each section component owns a hard-coded `id` (`about`, `capabilities`, `work`, `toolbox`, `journey`, `lab`, `notes`, `contact`) used for in-page anchor links — keep them unique.
- Metadata is either a static `export const metadata` (index pages) or a `generateMetadata` function (detail pages, root layout).
- The `/admin` route is `force-dynamic` and `noindex`; keep it out of search engines.

## Dependencies

### Internal
- `@/lib/cms` — the only data source for pages
- `@/components/sections/*`, `@/components/layout/*`, `@/components/ui/*`
- `@/types` — shared domain types

### External
- `next` (App Router, `next/navigation`, `next/font/google`, `next/cache`), `react`, `lucide-react`

<!-- MANUAL: -->
