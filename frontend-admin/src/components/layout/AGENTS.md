<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# layout

## Purpose
Dashboard chrome: the fixed sidebar with the navigation tree, the sticky topbar with breadcrumbs and shortcuts, and the shell that composes both around the page content. All three are client components because they own collapse, navigation and logout state.

## Key Files
| File | Description |
|------|-------------|
| `AdminLayoutShell.tsx` | Client shell. Holds `isCollapsed` and `hasUnsavedChanges` state, renders `AdminSidebar` and `AdminTopbar`, and offsets the content column with `pl-20` (collapsed) or `pl-64` (expanded). `handleLogout` calls `logoutAction()` then `router.push('/admin/login')` + `router.refresh()`. `hasUnsavedChanges` is never set to `true`, so the topbar's unsaved indicator is dead code today. |
| `AdminSidebar.tsx` | Fixed left nav (10.6 KB). Brand header (`CMS` / `DAT.ADMIN` / `NEO-BRUTAL CMS`) with a collapse toggle; OVERVIEW link; a collapsible CONTENT group with Home Page, Projects, Capabilities, Toolbox, Journey, Lab, Notes; then Media, Publishing (badge with the draft count), History, Settings, Account; footer links to the public site. Active highlighting uses `usePathname()` + `startsWith`. |
| `AdminTopbar.tsx` | Sticky `h-16` header. Breadcrumb built by splitting `usePathname()` into segments (last segment rendered as a non-link chip), the unsaved-changes pill, a NEW PROJECT shortcut, a VIEW SITE link to `http://localhost:3000`, a static `DN` avatar and a logout button that calls the `onLogout` prop. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| — | None |

## For AI Agents

### Working In This Directory
- The shell receives `draftCount` from the server layout (`(dashboard)/layout.tsx` → `getDashboardMetrics()`) and forwards it to the sidebar badge. Change the prop chain, not the fetch, if you add a badge.
- The nav tree is the single source of truth for which admin routes exist. When you add a route, add the link here too — otherwise the screen is reachable only by typing the URL.
- `http://localhost:3000` is hardcoded in the sidebar footer and the topbar VIEW SITE link. It is a dev placeholder; use env if you parameterize it, otherwise leave it.
- `AdminTopbar` expects `onLogout: () => Promise<void>`; the shell owns the implementation, the topbar only triggers it.
- Because the shell is a client component, everything under it is rendered inside a client boundary — but children are passed as React nodes from the server layout, so server components still work inside `main`.

### Testing Requirements
- `pnpm -C frontend-admin typecheck`; manual check: collapse/expand the sidebar, navigate to each nav item, confirm the active highlight, and log out from the topbar.
- The VIEW SITE link should open the public site in a new tab.

### Common Patterns
- Neo-brutalist chrome: hard 2–3 px borders in `var(--color-ink)`, hard offset shadows from `var(--shadow-neo-*)`, uppercase `font-display` labels and `font-mono` for data.

## Dependencies

### Internal
- `@/app/admin/actions` (`logoutAction`), `@/components/ui/Button`, `@/components/ui/Badge`.

### External
- next 16 (`next/link`, `next/navigation`), react 19, lucide-react.

<!-- MANUAL: -->
