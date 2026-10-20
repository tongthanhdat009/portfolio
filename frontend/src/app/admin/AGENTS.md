<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 -->

# `src/app/admin/` docs

Purpose: Local content console. PIN login sets an HTTP-only cookie; authenticated editors manage announcement, projects, experiments, and notes through server actions that persist back to `src/content/*.ts` and revalidate affected paths.

Key Files:

| File | Role |
| --- | --- |
| `page.tsx` | `force-dynamic`, `noindex`; loads initial data, renders `AdminClient` |
| `AdminClient.tsx` | Client dashboard: PIN form, CRUD tables, search, publish controls |
| `actions.ts` | Server actions: `loginAction`/`logoutAction`, `save*`/`delete*` per content type |

Subdirectories: none.

For AI Agents:

- Auth lives in `@/lib/admin/auth`: PIN from `ADMIN_PIN` env, SHA-256 cookie token, 7-day expiry.
- File writes resolve via `getContentFilePath` (supports both repo-root and `frontend/` cwd); keep that dual-path logic intact.
- After mutations call `revalidatePath` for every affected route.
- Never log or expose the PIN; never index this route.
- Test with `pnpm typecheck` from repo root; exercise login + one save via `next dev`.

Dependencies: internal `@/lib/admin/auth`, `@/lib/cms`, `@/types`, `@/lib/validation`; external `next/cache`, `lucide-react`.

<!-- MANUAL: -->
