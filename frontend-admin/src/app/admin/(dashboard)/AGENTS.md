<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# (dashboard)

## Purpose
Authenticated CMS shell. `layout.tsx` rejects unauthenticated visits by redirecting to `/admin/login` and feeds the draft count into the sidebar badge; `page.tsx` is the overview dashboard. `(dashboard)` is a Next.js route group, so it adds no URL segment — every route inside resolves as `/admin/...`.

## Key Files
| File | Description |
|------|-------------|
| `layout.tsx` | `force-dynamic` auth guard: `await isAuthenticated()` → `redirect('/admin/login')` when false; then `getDashboardMetrics()` and renders `<AdminLayoutShell draftCount={metrics.draftCount}>`. |
| `page.tsx` | Overview dashboard. Four metric cards (`publishedCount`, `draftCount`, `recentChangesCount`, `warningsCount`), a QUICK ACTIONS tile row (New Project, Edit Homepage, Settings & Nav, Publish Hub), a RECENTLY EDITED CONTENT list (6 newest entries, deep links per type), a CONTENT HEALTH AUDIT panel driven by `getContentHealth()` with `fixAction` deep links, and an ACTIVITY STREAM from `getAuditLogs(6)`. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `account/` | Operator profile and sign-out (see `account/AGENTS.md`) |
| `content/` | Per-type content editors and the homepage builder (see `content/AGENTS.md`) |
| `history/` | Revision timeline and rollback (see `history/AGENTS.md`) |
| `media/` | Asset library (see `media/AGENTS.md`) |
| `publishing/` | Draft queue, live catalog, cache purge (see `publishing/AGENTS.md`) |
| `settings/` | Site globals editor (see `settings/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- New dashboard section: add a nav entry in `components/layout/AdminSidebar.tsx`, create `section/page.tsx` (server fetch) + `SectionClient.tsx` (client render/mutate through `../actions.ts`), and keep the established header shape — a mono uppercase eyebrow badge, a `font-display font-black` uppercase `h1`, a one-line description, and an `animate-in fade-in duration-200` wrapper.
- Every `page.tsx` in this tree is a thin `force-dynamic` wrapper: it fetches via `lib/cms/service` and passes the result as `initial*` props to the client component. Never put mutation logic in a `page.tsx`.
- `window.location.reload()` after publish/restore is intentional: server actions plus `revalidatePath` need a fresh server fetch. Do not replace it with optimistic state unless the action's return shape covers every field you need.
- The account page is display-only; credential changes happen in the Laravel backend, not here.

### Testing Requirements
- `pnpm -C frontend-admin typecheck`; manual check is that each route renders with the backend up (`API_BASE_URL`, default `http://localhost:9000`).
- Unauthenticated access to any route in this group must land on `/admin/login` — verify after touching `layout.tsx`.

### Common Patterns
- Server components own data access; client components own interaction. Props are named `initialX` when they seed state.
- Health/audit data is computed server-side by `lib/cms/service` and passed down as props; the clients never compute it themselves.

## Dependencies

### Internal
- `@/lib/cms/service` (all reads), `@/app/admin/actions` (all writes), `@/lib/auth` (`isAuthenticated`), `@/components/layout/AdminLayoutShell`, `@/components/ui/{Card,Button,Badge}`, `@/types`.

### External
- next 16, react 19, lucide-react.

<!-- MANUAL: -->
