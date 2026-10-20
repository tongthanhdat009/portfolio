<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 -->
# src/app/admin/(dashboard)/

Purpose: Authenticated CMS shell. `layout.tsx` rejects unauthenticated visits to `/admin/login` and feeds the draft count into the sidebar badge; `page.tsx` is the overview dashboard (metrics, health audit, recent edits, activity stream).

## Key Files

| File | Role |
|------|------|
| `layout.tsx` | `force-dynamic` auth guard (`isAuthenticated`, else redirect) + `getDashboardMetrics()` → `AdminLayoutShell draftCount` |
| `page.tsx` | Overview: 4 metric cards (`publishedCount`, `draftCount`, `recentChangesCount`, `warningsCount`), quick-action tiles, recent-edits list, `getContentHealth` audit panel with `fixAction` deep links, audit activity stream |
| `account/AccountClient.tsx` | Static operator profile card + logout. Session display strings here are hardcoded (`DN`, cookie name, port) and already stale vs `lib/auth.ts` (`admin_api_token`, `:3001`); do not copy them as source of truth |
| `history/HistoryClient.tsx` | Revision timeline: entry picker → revision list → JSON snapshot inspector → `restoreRevisionAction` (restores as new draft, never overwrites) |
| `media/MediaClient.tsx` | Asset grid + file inspector (alt text, MIME, dimensions, storage key, usage refs) + upload modal + delete with 409 safeguard banner. Upload form hardcodes `storageKey` prefix, 345KB size, 1200×675 dimensions as placeholders passed to the real direct-to-S3 flow in `service.addMedia` |
| `publishing/PublishingClient.tsx` | Draft queue with confirm-modal → `publishEntryAction`, live catalog with unpublish, `revalidatePublicCacheAction` button. Health issues passed as props but only rendered indirectly; queue reloads via `window.location.reload()` after publish |
| `settings/SettingsClient.tsx` | Site globals editor (site settings, announcement, navigation with up/down reorder, appearance accent, redirects, SEO defaults) → `updateGlobalsAction` |

Each `page.tsx` in these dirs is a thin `force-dynamic` wrapper: fetch via `lib/cms/service`, pass as `initial*` props to the client. Publishing splits drafts (`status === 'draft' || hasUnpublishedChanges`) from live in the page, not the client. History fans out `getRevisions` per entry with `Promise.all`.

## Subdirectories

| Dir | Guide |
|-----|-------|
| `content/AGENTS.md` | Per-type content editors and page builder |

## For AI Agents

- New dashboard section: add nav entry in `components/layout/AdminSidebar.tsx`, create `section/page.tsx` (fetch) + `SectionClient.tsx` (render/mutate via `actions.ts`), keep the uppercase display + mono label header pattern and `animate-in fade-in` wrapper.
- `window.location.reload()` after publish/restore is intentional (server actions + `revalidatePath` need a fresh fetch); do not replace with optimistic state unless the action return shape covers it.
- Account page is display-only; credential changes happen in Laravel, not here.
- Testing: `pnpm typecheck`; manual check is each route renders with backend up (`API_BASE_URL`, default `http://localhost:9000`).

## Dependencies

Internal: `@/lib/cms/service` (all reads), `@/app/admin/actions` (all writes), `@/components/ui/*`, `@/types`. External: `lucide-react`, `next`.

<!-- MANUAL: -->
