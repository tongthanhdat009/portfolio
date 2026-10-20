<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 -->
# src/components/

Purpose: Two groups: `layout/` (dashboard chrome) and `ui/` (neo-brutalist primitives used by every client). `cms/` exists but is empty — do not add to it without a reason; shared editor widgets belong in `ui/`.

## Key Files

| File | Role |
|------|------|
| `layout/AdminLayoutShell.tsx` | Client shell: collapse state, `pl-20`/`pl-64` content offset, `logoutAction` + redirect; `hasUnsavedChanges` state exists but is never set — visual only |
| `layout/AdminSidebar.tsx` | Fixed nav: Overview, collapsible CONTENT group (Home Page, Projects, Capabilities, Toolbox, Journey, Lab, Notes), Media, Publishing (draft-count badge), History, Settings, Account; footer links `http://localhost:3000` hardcoded |
| `layout/AdminTopbar.tsx` | Breadcrumb from pathname, NEW PROJECT shortcut, VIEW SITE link (hardcoded `:3000`), static `DN` avatar, logout button |
| `ui/Button.tsx` | 8 variants (`primary/sun/sky/lime/secondary/danger/ghost/outline`), 3 sizes, `isLoading` spinner; neo-brutal translate-on-press |
| `ui/Input.tsx` | `Input`, `Textarea`, `Select` with `label/helperText/error` slots and `*REQ` marker |
| `ui/Badge.tsx` | `Badge` (8 accent variants) + `StatusBadge` (`Live`/`Live (Draft Changes)`/`Draft`/`Archived`) |
| `ui/Card.tsx` | Surface/paper/sun/sky variants, neo shadows, 2/3/4px borders |
| `ui/Modal.tsx` | Escape-to-close dialog with title/description/body/footer slots |

## For AI Agents

- All primitives merge classes with `clsx` + `tailwind-merge` and read `var(--color-*)` / `var(--shadow-neo-*)` tokens — never hardcode hex or shadow values in new components.
- Icons: `lucide-react` only. Fonts: `font-display` (Space Grotesk), `font-body` (Manrope), `font-mono` (IBM Plex Mono).
- `localhost:3000` / `:3001` URLs and the `DN` avatar are hardcoded placeholders; parameterize via env if touching those lines, otherwise leave.
- Testing: no test runner. `pnpm typecheck` + visual check via `pnpm dev` (`:3001`).

## Dependencies

Internal: `layout/*` → `ui/*`, `@/app/admin/actions` (shell logout). External: `lucide-react`, `clsx`, `tailwind-merge`, `next/link`, `next/navigation`.

<!-- MANUAL: -->
