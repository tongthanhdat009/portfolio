<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# scripts

## Purpose
One-off maintenance scripts that run from `frontend/` via `pnpm`. The only script is the GitHub sync: it reads the public repositories of the GitHub account, categorises them, and regenerates the project content module so the case-study list stays current without hand-editing ~1.6k lines of JSON-in-TypeScript.

## Key Files
| File | Description |
|------|-------------|
| `sync-github.mjs` | ESM Node script. Lists repos for owner `tongthanhdat009` via the `gh` CLI (`gh repo list --limit 60 --json …`), falls back to the public GitHub REST API (`api.github.com/users/<owner>/repos`) when `gh` is unavailable; filters out private repos, the `portfolio`/`cv`/profile repos and description-less forks; assigns category via `getCategoryByRepo` and accent via `getAccentByIndex`; rewrites `src/content/projects.ts` and patches the hero's `featuredProjectId` in `src/content/homePage.ts` |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| None | — |

## For AI Agents

### Working In This Directory
- Run with `pnpm sync:github` from `frontend/` (root `pnpm sync:github` forwards to it).
- The script **overwrites** `src/content/projects.ts` entirely. Commit or stash before running so the diff stays reviewable; hand-edits to that file are lost.
- Paths are resolved relative to the script's own location (`FRONTEND_ROOT = path.resolve(__dirname, '..')`), so it works from any cwd.
- Category is a keyword heuristic over repo name, description, and primary language (`getCategoryByRepo`); tune the keyword lists there, never downstream.
- Requires network access. The GitHub CLI path needs an authenticated `gh`; the REST fallback is unauthenticated and subject to tighter rate limits.
- No secret is hardcoded in the script — it relies on ambient `gh` auth.

### Testing Requirements
- No test runner. Verify by running the script and diffing `src/content/projects.ts`:
  - `pnpm sync:github` then `git diff src/content/projects.ts src/content/homePage.ts`
- After regenerating, run `pnpm typecheck` — the generated file must still satisfy the `Project` interface in `src/types/index.ts`.
- Run `pnpm build` if `caseStudy` fields changed shape, since `/work/[slug]` dereferences `caseStudy.overview`, `caseStudy.approach`, etc.

### Common Patterns
- Plain Node ESM (`.mjs`), no build step, no dependencies — only `node:child_process`, `node:fs`, `node:path`, `node:url`.
- Output is `JSON.stringify(data, null, 2)` embedded in a TS module with a typed import header, e.g. `import { Project } from '@/types';\n\nexport const projectsData: Project[] = …`.
- The `/admin` console can invoke this same script server-side through `triggerGithubSyncAction()` in `src/app/admin/actions.ts`.

## Dependencies

### Internal
- `src/content/projects.ts` (rewritten), `src/content/homePage.ts` (hero `featuredProjectId` patched)
- `src/app/admin/actions.ts` → `triggerGithubSyncAction()` shells out to this script

### External
- Node.js runtime (`node:child_process`, `node:fs`, `node:path`, `node:url`)
- GitHub CLI (`gh`) — primary path
- GitHub REST API `https://api.github.com/users/tongthanhdat009/repos` — fallback path

<!-- MANUAL: -->
