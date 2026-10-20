<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 -->

# `src/components/` docs

Purpose: Presentational React components grouped by role: `layout/` shell chrome, `sections/` homepage blocks, `ui/` reusable primitives.

Key Files: none at this level; see subdirectories.

Subdirectories:

| Dir | Docs |
| --- | --- |
| `layout/` | `layout/AGENTS.md` |
| `sections/` | `sections/AGENTS.md` |
| `ui/` | `ui/AGENTS.md` |

For AI Agents:

- All components are typed props with `React.FC`; keep prop interfaces exported alongside.
- Sections take CMS data as props, never fetch directly.
- Use `ui/Button`, `ui/Card`, `ui/Badge` instead of inventing new primitives.
- Test with `pnpm typecheck` from repo root.

Dependencies: internal `@/types`; external `react`, `next/link`, `lucide-react`.

<!-- MANUAL: -->
