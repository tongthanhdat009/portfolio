<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 -->

# `src/content/` docs

Purpose: Typed local content fallback and admin-console persistence target. Each file exports one dataset consumed by `src/lib/cms`; the Laravel CMS API overrides these values at fetch time when reachable.

Key Files:

| File | Role |
| --- | --- |
| `projects.ts` | Project case studies (~1.6k lines, largest file — edit via admin console, not by hand) |
| `homePage.ts` | `heroData`, `marqueeKeywords`, `manifestoData` |
| `notes.ts` / `experiments.ts` | Detail-page bodies (`content: string[]` paragraphs) |
| `siteSettings.ts` / `announcements.ts` | Global SEO/socials and banner state |

Subdirectories: none.

Remaining files (`capabilities.ts`, `technologies.ts`, `experience.ts`) export small flat arrays; shape matches the same-named interface in `src/types/index.ts`.

For AI Agents:

- Never change an export name or object shape — `lib/cms` and `admin/actions.ts` depend on them.
- Prefer the `/admin` console or `scripts/sync-github.mjs` for bulk edits; hand edits risk breaking the file-writer round-trip.
- Add a content type by adding a file + type + `get*` accessor together.
- Test with `pnpm typecheck` from repo root.

Dependencies: internal `@/types`; external none.

<!-- MANUAL: -->
