<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# validation

## Purpose
Small, dependency-free validators shared by the contact form and the admin console. They are plain functions with no React and no framework coupling, so they can be called from a client component, a server action, or a script.

## Key Files
| File | Description |
|------|-------------|
| `index.ts` | Exports `validateProjectSlug(slug: string): boolean` — tests `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`, i.e. lowercase alphanumeric segments joined by single hyphens. Exports `validateContactForm(input: { name, email, message }): { valid: boolean; errors: Record<string, string> }` — requires a name of at least 2 trimmed characters, an email matching `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`, and a message of at least 10 trimmed characters, collecting one message per failed field |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| None | — |

## For AI Agents

### Working In This Directory
- Keep these functions pure and synchronous — no I/O, no framework imports.
- The `errors` map is keyed by field name (`name`, `email`, `message`). Callers read `errors.name` etc. directly, so the keys are part of the contract.
- `validateContactForm` returns `valid: true` only when the error map is empty; check `valid` rather than the map length.
- `validateProjectSlug` is strict — it rejects uppercase, underscores, spaces, and leading/trailing hyphens. Slugs in `src/content/*.ts` follow it.
- The contact form in `src/app/contact/ContactContent.tsx` does **not** call `validateContactForm`; it re-implements a weaker check (non-empty fields only). If you unify them, the stricter rules will change the live form's behaviour.
- Neither function currently has a caller anywhere in `src/`. The admin console does **not** validate slugs with `validateProjectSlug`, and the contact form does not call `validateContactForm`. Wire them in rather than assuming they already run.

### Testing Requirements
- No test runner in this app. `pnpm typecheck` from the repo root is the automated check.
- For a behavioural check, exercise the validator from the console or a scratch script (do not add a test file — none exist in this app):
  ```
  node -e "console.log(/^[a-z0-9]+(?:-[a-z0-9]+)*\$/.test('my-slug'))"
  ```
- Manual: submit the contact form with a short name, a malformed email, and a one-word message and confirm the reported messages match the rules above.

### Common Patterns
- Regex literals are declared inline in the function body.
- Error messages are user-facing sentences ending in a period.
- Length checks trim before measuring.

## Dependencies

### Internal
- `@/types` — `Project`, `Experiment`, `Note` (imported for the domain context)

### External
- None — pure TypeScript, no runtime dependencies

<!-- MANUAL: -->
