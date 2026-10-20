<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 -->
# src/app/

Purpose: Next.js App Router entrypoint. Sets global metadata and theme CSS, then immediately routes everything into the `/admin` CMS subtree.

## Key Files

| File | Role |
|------|------|
| `layout.tsx` | Root layout: imports `@/styles/globals.css`, `robots: { index: false, follow: false }` (admin never indexed) |
| `page.tsx` | Single `redirect('/admin')`, nothing else |

## Subdirectories

| Dir | Guide |
|-----|-------|
| `admin/AGENTS.md` | Server actions, login, dashboard subtree |

## For AI Agents

- Do not add public routes here; the portfolio site is a separate frontend. Anything under `app/` outside `admin/` would be unreachable dead weight.
- Keep `robots` noindex/no.follow on any new layout in this subtree.

## Dependencies

Internal: `@/styles/globals.css`. External: `next`.

<!-- MANUAL: -->
