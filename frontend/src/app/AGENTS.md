<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 -->

# `src/app/` docs

Purpose: Next.js App Router routes. `layout.tsx` loads fonts, global metadata, and the header/footer shell; `page.tsx` composes all homepage sections; `admin/` is the PIN-gated console; `api/internal/revalidate` accepts signed CMS revalidation webhooks.

Key Files:

| File | Role |
| --- | --- |
| `layout.tsx` | Root layout: fonts, `generateMetadata`, SkipLink/Header/Footer shell |
| `page.tsx` | Homepage: fetches all CMS data, renders sections 02–11 in order |
| `not-found.tsx` | Branded 404 card linking home |
| `api/internal/revalidate/route.ts` | HMAC-signed `POST` revalidates affected paths |

Subdirectories:

| Dir | Docs |
| --- | --- |
| `admin/` | `admin/AGENTS.md` |

Routes (all server-rendered except where noted):

| Route | Source |
| --- | --- |
| `/about` | Static story page, timeline from `getExperience()` |
| `/contact` | Client component; honeypot + inline validation, no backend send |
| `/work`, `/work/[slug]` | Index + case-study detail; `generateStaticParams` + per-slug metadata |
| `/lab`, `/lab/[slug]` | Same pattern for experiments |
| `/notes`, `/notes/[slug]` | Same pattern for notes |
| `/admin` | `force-dynamic`, `noindex`; see `admin/AGENTS.md` |

For AI Agents:

- Slug detail pages follow one pattern: `generateStaticParams` from `get*()`, `generateMetadata` per slug, `notFound()` when missing, next-item footer link.
- Keep the breadcrumb + poster-header markup consistent across index pages.
- Revalidate webhook: HMAC-SHA256 over `timestamp.nonce.body`, 300s freshness window, `X-Revalidate-*` headers, secret in `NEXT_REVALIDATE_SECRET`.
- Test with `pnpm typecheck` from repo root; verify new routes with `next dev` + direct navigation.

Dependencies: internal `@/lib/cms`, `@/components/*`, `@/types`; external `next`, `lucide-react`.

<!-- MANUAL: -->
