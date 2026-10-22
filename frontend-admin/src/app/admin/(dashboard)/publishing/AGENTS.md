<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# publishing

## Purpose
Publishing hub: the release queue. It lists pending drafts and live publications, lets the owner publish or unpublish an entry, and triggers a cache purge so the public site picks up the new snapshots.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | `force-dynamic` server component. Reads `?tab=` (`drafts` or `live`, default `drafts`) and `?page=`, then calls `getEntriesPaged({ status: tab === 'live' ? 'published' : 'draft', page, perPage: 10 })` — the status split happens on the server, not in the client. It also loads `getContentHealth()` and renders `<PublishingClient key={`${tab}-${page}`} bundle={bundle} activeTab={tab} healthIssues={healthIssues} />`. |
| `PublishingClient.tsx` | `'use client'` tabbed queue (9.7 KB). Tabs link to `?tab=drafts` and `?tab=live`; publishing goes through a confirmation modal into `publishEntryAction`, then `window.location.reload()`. Unpublish calls `unpublishEntryAction` and also reloads. The REVALIDATE ALL CACHES button calls `revalidatePublicCacheAction` and shows the returned message for 4 seconds. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| — | None |

## For AI Agents

### Working In This Directory
- `healthIssues` is passed in as a prop but the client renders it only indirectly — the actual issue list lives on the overview dashboard. Do not expect the audit findings to appear in the queue UI.
- The draft tab filters on CMS `status === 'draft'` only. An entry that is `published` but has `hasUnpublishedChanges` (a live entry with unpublished edits) does **not** appear in the drafts queue, even though the dashboard's `draftCount` metric counts it. This is a real behavioural gap: if you want "pending changes" to be publishable from here, the status filter in `page.tsx` must change.
- `revalidatePublicCacheAction` only calls `revalidatePath('/', 'layout')` inside the admin app — it invalidates the admin's own route cache, not the public site's ISR cache on `:3000`. The success message ("All public routes and tags invalidated successfully") overstates what happens.
- Publishing and unpublishing both do a full `window.location.reload()`, because the publish action bumps the revision and revalidates server routes.

### Testing Requirements
- `pnpm -C frontend-admin typecheck`; manual check: publish a draft from the queue → the entry moves to the live tab and appears on the public site; unpublish it → it disappears again.
- Confirm `?tab=live` and `?page=2` restore the right tab and page on reload.

### Common Patterns
- Tab state is a URL param, so the server component decides which status to query; the client only renders links.

## Dependencies

### Internal
- `@/lib/cms/service` (`getEntriesPaged`, `getContentHealth`), `@/app/admin/actions` (`publishEntryAction`, `unpublishEntryAction`, `revalidatePublicCacheAction`), `@/components/ui/{Card,Button,Badge,Modal,Pagination}`, `@/types` (`CmsEntry`, `ContentHealthIssue`).

### External
- next 16, react 19, lucide-react (`Send`, `RefreshCw`, `Eye`, `CheckCircle2`, `AlertTriangle`, `Clock`, `Layers`, `ArrowRight`, `Undo2`).

<!-- MANUAL: -->
