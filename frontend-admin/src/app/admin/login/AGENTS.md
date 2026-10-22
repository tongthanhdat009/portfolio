<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# login

## Purpose
The only unauthenticated page of the admin CMS. It renders the neo-brutalist sign-in card and calls `loginAction` from the parent `admin/` directory; on success it pushes `/admin` and refreshes the router so the dashboard layout's auth guard re-runs with the new session cookie.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | `'use client'` component. Holds `email` / `password` / `error` state plus a `useTransition`; `handleSubmit` calls `loginAction(email, password)` and on `res.success` does `router.push('/admin')` + `router.refresh()`, otherwise sets the generic message `Invalid email or password. Please check your credentials.` The form uses the shared `Card`, `Button` and `Input` primitives; it renders the dev default credential pair `owner@example.com / ownerpass123` inline as a hint. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| — | None |

## For AI Agents

### Working In This Directory
- Do not add a redirect here: an unauthenticated visitor must be able to reach this page. The auth guard lives in the `(dashboard)/layout.tsx`, not here.
- Login goes through `loginAction` (`../actions.ts`), which calls `login()` in `@/lib/auth` — the Laravel API issues the Sanctum token and the cookie is set there. Never fetch the token endpoint from the browser.
- Keep error text generic and identical for unknown-email and wrong-password cases; distinguishing them leaks account existence.
- The `owner@example.com / ownerpass123` hint is a development placeholder. The real owner account is seeded in the Laravel backend (`make owner`), so treat the hint as removable, not authoritative.

### Testing Requirements
- `pnpm -C frontend-admin typecheck`; manual check with the API up: wrong credentials show the error and stay on the page, correct credentials land on `/admin`.
- Cookie check: a successful login sets the httpOnly `admin_api_token` cookie (7-day max age, `secure` in production, `sameSite: lax`).

### Common Patterns
- Client-side form state in `useState`, the server call wrapped in `startTransition` so the submit button can show its `isLoading` spinner.
- Uses the shared `Input` component's `label` / `error` / `required` slots rather than hand-rolled labels.

## Dependencies

### Internal
- `../actions.ts` (`loginAction`), `@/lib/auth` (invoked server-side), `@/components/ui/{Card,Button,Input}`.

### External
- next 16 (`next/navigation` router), lucide-react (`Lock`, `ArrowRight`, `ShieldCheck`, `KeyRound`), react 19.

<!-- MANUAL: -->
