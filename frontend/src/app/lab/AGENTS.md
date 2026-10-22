<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# lab

## Purpose
The `/lab` route — the index of experiments, prototypes, and benchmarks. It renders every experiment as an interactive card with a status chip, tags, a link to the detail page, and optional live-demo and source-repo links. This directory holds the index; the detail pages live in `[slug]/`.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | Server component. Static `metadata` (`title: 'Digital Lab & Experiments'`). Fetches `getExperiments()` and renders a 2-column grid of `ui/Card`s. Each card shows a status chip styled by the local `statusStyles` map (`Prototype`, `Exploring`, `Shipped`, `Archived`), the title linked to `/lab/<slug>`, the summary, `ui/Badge` tags, an "Experiment Details" link, and conditional `demoUrl` / `repoUrl` external links |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `[slug]/` | `/lab/[slug]` — experiment detail page (see `[slug]/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Server Component — no `'use client'`. Data comes from `getExperiments()` only.
- `statusStyles` is a local `Record<string, string>` keyed by `Experiment['status']`. It duplicates the `statusBadgeStyles` map in `src/components/sections/LabSection.tsx` — if you change one, change the other.
- External links must keep `target="_blank" rel="noopener noreferrer"`.
- The breadcrumb, title poster, and grid layout mirror `/work` and `/notes` — keep them visually consistent when changing one.
- The header uses a dark inverted chip (`// EXPERIMENTAL LAB`) rather than the plain coral eyebrow used on `/work` and `/notes`; that is intentional.

### Testing Requirements
- `pnpm typecheck` from the repo root.
- `pnpm build` — the index is statically generated, and `generateStaticParams` for `[slug]` depends on the same accessor.
- Manual: load `/lab` in `next dev` and open one card to confirm the detail route resolves.

### Common Patterns
- Cards use `accent={exp.accent}`, `border="md"`, `shadow="md"`, `interactive={true}`, and `flex flex-col justify-between` so the footer aligns across the grid.
- Status labels are rendered uppercase with the `STATUS: ` prefix.
- `getExperiments()` accepts an optional status filter; this page calls it with no argument.

## Dependencies

### Internal
- `@/lib/cms` — `getExperiments()`
- `@/components/ui/Card`, `@/components/ui/Badge`, `@/components/ui/Icons` (`GithubIcon`)
- `@/types` — `Experiment`

### External
- `next` (`next/link`, `Metadata`), `lucide-react` (`ArrowLeft`, `ArrowUpRight`, `FlaskConical`, `ExternalLink`)

<!-- MANUAL: -->
