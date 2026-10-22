<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# layout

## Purpose
The site shell rendered by `src/app/layout.tsx`: the accessibility skip link, the announcement banner, the sticky header with its mobile drawer, and the footer with sitemap, social links, and back-to-top. Everything here wraps the page content and reads its copy from `SiteSettings`.

## Key Files
| File | Description |
|------|-------------|
| `Header.tsx` | `'use client'`. Sticky bar with the `DAT.BUILD` wordmark, desktop nav with active-path underline (`usePathname`), a "Say Hello ↗" CTA, and a mobile drawer (`role="dialog"`, `aria-modal`) toggled by a 44×44 button. `NAV_ITEMS` is a hard-coded array of `/work`, `/about`, `/lab`, `/notes`, `/contact`. Closes the drawer on route change, on `Escape`, and locks `body` scroll while open |
| `Footer.tsx` | Server component. Three columns: wordmark + description, navigation links (including a dimmed "Admin Console" link to `/admin`), and social profiles from `settings.socialLinks` plus the `mailto:` link. Bottom row with copyright and a `#main-content` "Back to top" anchor |
| `AnnouncementStrip.tsx` | Server component. Renders `null` when `data.enabled` is false. Otherwise a yellow `aside` with `aria-label="Announcement"`, the label chip, a truncated message, and an optional link |
| `SkipLink.tsx` | Server component. A single `sr-only focus:not-sr-only` anchor to `#main-content` — the first focusable element on every page |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| None | — |

## For AI Agents

### Working In This Directory
- Only `Header.tsx` is a client component (it uses `useState`, `useEffect`, `usePathname`). The other three must stay server components.
- `Header` and `Footer` both duplicate the route list. When you add a route, update `NAV_ITEMS` in `Header.tsx` **and** the navigation column in `Footer.tsx`.
- The header's active state uses `pathname.startsWith(item.href)`, so `/work/cua` highlights "Work". Keep that rule when adding entries.
- The mobile drawer locks `document.body.style.overflow`; the cleanup function must always reset it, or the page stays unscrollable after navigating.
- Keep the skip link first in the DOM and the `:focus-visible` ring intact — they are the site's only a11y shortcuts.
- `AnnouncementStrip` renders nothing when disabled; do not replace the early return with a hidden element (it would still be announced).

### Testing Requirements
- `pnpm typecheck` from the repo root.
- `pnpm build` after changing exports.
- Manual in `next dev`: tab through the header to confirm the skip link appears first; open the mobile drawer at a narrow viewport, check `Escape` closes it and the page scrolls again afterwards; confirm the active underline follows the route.

### Common Patterns
- `aria-label` on every landmark (`Announcement`, `Main Navigation`, `Mobile Navigation Menu`).
- Copy comes from `SiteSettings` (`logoText`, `tagline`, `description`, `socialLinks`, `contactEmail`) — do not hard-code owner details.
- Neo-brutalist styling: `neo-border`, `neo-shadow-sm`, `neo-btn-press`, uppercase `font-display` labels, `font-mono` for micro-labels.

## Dependencies

### Internal
- `@/types` — `SiteSettings`, `Announcement`
- Rendered by `src/app/layout.tsx`

### External
- `react` (`useState`, `useEffect`), `next/link`, `next/navigation` (`usePathname`), `lucide-react` (`Menu`, `X`, `ArrowUpRight`, `ArrowUp`)

<!-- MANUAL: -->
