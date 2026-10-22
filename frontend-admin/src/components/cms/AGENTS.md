<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# cms

## Purpose
Empty placeholder directory for CMS-specific shared components. Nothing is stored here today: no file in `src/` imports from `@/components/cms`, and the folder contains no source of its own.

## Key Files
| File | Description |
|------|-------------|
| — | None — the directory is empty. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| — | None |

## For AI Agents

### Working In This Directory
- Do not add files here speculatively. If you need a shared editor widget (a repeating field group, a media picker, a slug input), decide first whether it is generic enough for `ui/` — most shared widgets belong in `ui/` next to the other primitives.
- Only create a component here when at least two different content editors genuinely need the same CMS-specific widget and it cannot be expressed with the existing `ui/` primitives.
- The parent guide `../AGENTS.md` documents the same rule.

### Testing Requirements
- No code to test. If you add files here, they become part of the `pnpm -C frontend-admin typecheck` and `pnpm -C frontend-admin build` surface automatically.

### Common Patterns
- CMS-specific widgets should still follow the token rules: `var(--color-*)` / `var(--shadow-neo-*)` instead of literal colours, `lucide-react` for icons.

## Dependencies

### Internal
- None yet. Expected future dependencies would be `@/types` and `@/components/ui/*`.

### External
- None yet.

<!-- MANUAL: -->
