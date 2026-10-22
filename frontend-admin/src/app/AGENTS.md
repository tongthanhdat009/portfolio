<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# app

## Purpose
Next.js App Router entrypoint for the admin. It sets global metadata and loads the theme CSS, then routes everything into the `/admin` CMS subtree. There is no public route here — the portfolio site itself lives in the separate `frontend/` package.

## Key Files
| File | Description |
|------|-------------|
| `layout.tsx` | Root layout: imports `@/styles/globals.css`, sets `metadata` (`title: 'Portfolio Admin CMS'`, `robots: { index: false, follow: false }` so the admin is never indexed), renders `<html lang="en">` with `suppressHydrationWarning` and a sun-coloured selection highlight. |
| `page.tsx` | Server component whose only statement is `redirect('/admin')`. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `admin/` | Server actions, login route and the authenticated dashboard subtree (see `admin/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Do not add public routes here; the portfolio site is a separate package. Anything under `app/` outside `admin/` would be unreachable dead weight.
- Keep `robots: { index: false, follow: false }` on any new layout in this subtree.
- There is no `app/api/` route directory — the admin has no Next.js API proxy; it calls the Laravel API server-side from `lib/`.

### Testing Requirements
- `pnpm -C frontend-admin typecheck` and `pnpm -C frontend-admin build`; the redirect is verified manually by loading `/` and confirming you land on `/admin` (or `/admin/login` when signed out).

### Common Patterns
- `layout.tsx` owns only global chrome (CSS import + metadata); per-section chrome lives in the route group's own `layout.tsx`.

## Dependencies

### Internal
- `@/styles/globals.css`, `next/navigation` (`redirect`).

### External
- next 16, react 19.

<!-- MANUAL: -->
