<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 -->

# `src/components/layout/` docs

Purpose: Site shell rendered by `src/app/layout.tsx`: accessibility skip link, announcement banner, sticky header nav, and footer.

Key Files:

| File | Role |
| --- | --- |
| `Header.tsx` | Client nav with mobile menu, active-path highlight |
| `Footer.tsx` | Sitemap, socials, back-to-top from `SiteSettings` |
| `AnnouncementStrip.tsx` | Dismissible banner; renders nothing when disabled |
| `SkipLink.tsx` | A11y skip-to-`#main-content` link |

Subdirectories: none.

For AI Agents:

- `Header` is `'use client'` (uses `usePathname`); others are server components.
- Nav items are hardcoded in `Header.tsx`; update there when adding routes.
- Keep `:focus-visible` and skip-link behavior intact for a11y.

Dependencies: internal `@/types`; external `next/link`, `next/navigation`, `lucide-react`.

<!-- MANUAL: -->
