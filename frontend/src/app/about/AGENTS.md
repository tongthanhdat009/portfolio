<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# about

## Purpose
The `/about` route — an extended background and philosophy page. It is a Server Component with a static narrative (the "builder mindset" prose, three principle cards) plus two data-driven pieces: the career milestone timeline from `getExperience()` and the contact CTA rail. Its title block also acts as the canonical header poster for the site's editorial pages.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | Server component. Static `metadata` (`title: 'About & Background'`). Fetches `getSiteSettings()` (for `resumeUrl`) and `getExperience()` (for the timeline). Renders: breadcrumb back to `/`, yellow poster header with `BUILD LOUD. THINK CLEAR.` plus "Work Together" and a resume CTA, a narrative card, a three-card "How I Work" grid (`Systems Over Hacks`, `Utility-First UX`, `Continuous Craft` — each a `ui/Card`), the career milestones list, and a sky-blue contact CTA rail. Imports `Card` from `@/components/ui/Card` and `Button` from `@/components/ui/Button` |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| None | — |

## For AI Agents

### Working In This Directory
- Server Component — no `'use client'`, no state. All interactivity comes from `next/link` and `ui/Button`.
- The narrative prose is hard-coded inline in the JSX. To change the story, edit the paragraphs directly; to change the structure, keep the section order: breadcrumb → poster header → narrative → principles → milestones → CTA rail.
- The milestones list renders `exp.organization`, `exp.year`, `exp.roleAtTime`, `exp.description` only — `ExperienceItem.highlights` is not used here (the homepage `JourneySection` is what renders highlights).
- The resume button is conditional on `settings.resumeUrl`; it links to `/resume.pdf`, which does not exist in `public/` yet.
- Reuse `ui/Card` with `accent` / `border` / `shadow` props rather than adding raw bordered `<div>`s.

### Testing Requirements
- `pnpm typecheck` from the repo root.
- `pnpm build` after changing metadata or adding an import (route must stay statically renderable).
- Visually check `/about` in `next dev` — the timeline depends on `getExperience()` returning data, which differs between CMS API and local fallback.

### Common Patterns
- Uses the same design vocabulary as the rest of the site: `neo-border-poster`, `neo-shadow-lg`, uppercase `font-display` headings, `font-mono` eyebrows prefixed with `//`.
- Colours are hard-coded hex (`#FFF9E9` paper, `#FFDB58` sun, `#111111` ink) to match sibling pages.
- Metadata is a static `export const metadata` object, unlike the slug pages which use `generateMetadata`.

## Dependencies

### Internal
- `@/lib/cms` — `getSiteSettings()`, `getExperience()`
- `@/components/ui/Card`, `@/components/ui/Button`
- `@/types` — `ExperienceItem`, `SiteSettings`

### External
- `next` (`next/link`, `next` `Metadata`), `lucide-react` (`ArrowLeft`, `ArrowUpRight`, `Code`, `Cpu`, `ShieldCheck` are used; `CheckCircle2` and `Terminal` are imported but unused)

<!-- MANUAL: -->
