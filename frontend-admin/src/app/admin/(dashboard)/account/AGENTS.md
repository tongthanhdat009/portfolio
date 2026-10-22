<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# account

## Purpose
Operator profile and session-control page of the admin CMS. It shows a static identity card plus the session attributes and a single destructive action: terminate the session and sign out. There is no credential editing — the owner account lives in the Laravel backend.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | `force-dynamic` server component that renders `<AccountClient />` with no data fetching. |
| `AccountClient.tsx` | `'use client'` component. Renders the operator card ("Dat Nguyen (System Owner)", `DN` monogram), a SESSION ATTRIBUTES block, and a `TERMINATE SESSION & LOG OUT` danger button whose handler calls `logoutAction()` then `router.push('/admin/login')` + `router.refresh()`. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| — | None |

## For AI Agents

### Working In This Directory
- The session strings in `AccountClient.tsx` are hardcoded placeholders and are already wrong: it claims cookie `admin_session` and "Local Memory / Mongo Fallback Store", but `@/lib/auth` actually uses the httpOnly `admin_api_token` cookie against the Laravel API on `:9000`. Do not treat them as source of truth, and do not copy them elsewhere.
- The `DN` avatar and "Dat Nguyen" name are literals, not data from the API. If you want real values, read them via `getCurrentUser()` in `@/lib/auth` — it returns `{ id, name, email, role, capabilities }` from `/api/v1/auth/me`.
- Signing out must go through `logoutAction` (which revokes the token server-side and clears the cookie), not a bare cookie delete.

### Testing Requirements
- `pnpm -C frontend-admin typecheck`; manual check: click the logout button → the API token is revoked, the cookie is cleared, and the browser lands on `/admin/login`.
- Clicking "VIEW SITE"-style cross-links is irrelevant here; no public link exists on this page.

### Common Patterns
- Display-only page: state is minimal (just the logout handler), and the layout follows the shared `Card` + `Button variant="danger"` primitives.

## Dependencies

### Internal
- `@/app/admin/actions` (`logoutAction`), `@/components/ui/{Card,Button,Input}`.

### External
- next 16 (`next/navigation`), react 19, lucide-react (`User`, `ShieldCheck`, `KeyRound`, `LogOut`, `CheckCircle2`).

<!-- MANUAL: -->
