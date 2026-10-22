<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# components

## Purpose
Two groups of React components: `layout/` holds the dashboard chrome (sidebar, topbar, shell) and `ui/` holds the neo-brutalist primitives that every editor reuses (Card, Button, Input/Textarea/Select, Badge/StatusBadge, Modal, Pagination). `cms/` is an empty placeholder directory — nothing lives there.

## Key Files
| File | Description |
|------|-------------|
| `layout/AdminLayoutShell.tsx` | Client shell: collapse state for the sidebar, the `pl-20` / `pl-64` content offset, `logoutAction` + redirect to `/admin/login`, and the `max-w-7xl` main container. It holds a `hasUnsavedChanges` state that is never set to `true` — the topbar's "UNSAVED CHANGES" indicator is therefore never shown. |
| `layout/AdminSidebar.tsx` | Fixed nav (10.6 KB): brand header with collapse toggle, OVERVIEW, a collapsible CONTENT group (Home Page, Projects, Capabilities, Toolbox, Journey, Lab, Notes), then Media, Publishing (draft-count badge), History, Settings and Account. Active state is derived from `usePathname()`; the footer links to `http://localhost:3000` (hardcoded). |
| `layout/AdminTopbar.tsx` | Sticky header: breadcrumb built from the pathname segments, an unsaved-changes pill (driven by the always-false prop), a NEW PROJECT shortcut to `/admin/content/projects/new`, a VIEW SITE link to `http://localhost:3000` (hardcoded), a static `DN` avatar and a logout button. |
| `ui/Button.tsx` | `forwardRef` button with 8 variants (`primary`, `sun`, `sky`, `lime`, `secondary`, `danger`, `ghost`, `outline`), 3 sizes (`sm`/`md`/`lg`) and an `isLoading` spinner that also disables the button. |
| `ui/Input.tsx` | `Input`, `Textarea` and `Select` sharing the same `label` / `helperText` / `error` slots, an auto-generated id via `useId()`, a `*REQ` marker for required fields, and `options: {value,label}[]` support on `Select`. |
| `ui/Badge.tsx` | `Badge` with 8 accent variants (`sun`, `sky`, `coral`, `lime`, `pink`, `paper`, `surface`, `neutral`) and 2 sizes, plus `StatusBadge` rendering `Archived` / `Live (Draft Changes)` / `Live` / `Draft` from `status` + `hasUnpublishedChanges`. |
| `ui/Card.tsx` | Surface container: variants `surface` / `paper` / `sun` / `sky`, shadows `sm`/`md`/`lg`/`none` and borders `2`/`3`/`4`. |
| `ui/Modal.tsx` | Overlay dialog: closes on Escape, optional `description`, a scrolling body (`max-h-[75vh]`) and an optional `footer` slot; width from `maxWidth` (`sm`…`2xl`). |
| `ui/Pagination.tsx` | Link-based pager (`next/link`) with a window of page numbers and ellipses. Reads the current query and writes the page into a configurable query param (`param`, default `page`); renders nothing when there is only one page. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `cms/` | Empty placeholder directory — no components (see `cms/AGENTS.md`) |
| `layout/` | Dashboard chrome (see `layout/AGENTS.md`) |
| `ui/` | Neo-brutalist primitives (see `ui/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- All primitives merge classes with `clsx` + `tailwind-merge` and read `var(--color-*)` / `var(--shadow-neo-*)` tokens. Never hardcode hex or shadow values in a new component.
- Icons come from `lucide-react` only. Fonts: `font-display` (Space Grotesk) for headings and buttons, `font-body` (Manrope) for prose, `font-mono` (IBM Plex Mono) for labels and data.
- `localhost:3000` / `:3001` URLs and the `DN` avatar are hardcoded placeholders. Parameterize via env if you touch those lines; otherwise leave them alone.
- New shared editor widgets belong in `ui/`, not in the empty `cms/` directory.

### Testing Requirements
- No test runner. `pnpm -C frontend-admin typecheck` plus a visual check with `pnpm dev` on `:3001`.
- Accessibility spot-checks worth keeping: the Modal close button has `aria-label`, the Pagination prev/next links have `aria-label` and disabled pages render a `aria-hidden` span instead of a link.

### Common Patterns
- Presentational components accept `className` and forward refs where they render a DOM element; the caller is responsible for layout classes.
- Interactive components that need browser APIs are marked `'use client'`.

## Dependencies

### Internal
- `layout/*` → `ui/*` and `@/app/admin/actions` (shell logout); `ui/*` → `clsx` + `tailwind-merge` only.

### External
- lucide-react, clsx, tailwind-merge, next 16 (`next/link`, `next/navigation`), react 19.

<!-- MANUAL: -->
