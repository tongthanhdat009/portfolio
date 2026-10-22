<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# api

## Purpose
Route-handler root for the public site. Everything under here is machine-facing — no UI, no layout. The only handler in the tree is the CMS revalidation webhook, which the Laravel backend calls after a publish so the statically generated pages pick up new content.

## Key Files
| File | Description |
|------|-------------|
| None at this level | The only route handler lives in `internal/revalidate/route.ts` |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `internal/` | Internal (non-public) endpoints; holds the revalidation webhook (see `internal/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Route handlers here are authenticated by HMAC signature, not by session cookies. Any new handler under `internal/` must implement its own verification — nothing is protected by default.
- Handlers must be plain `export async function POST(req: Request): Promise<Response>` functions; use `Response.json(...)` for replies.
- Read the raw body with `await req.text()` when the signature covers the body — `req.json()` cannot be called twice.
- This directory is excluded from the page layout: there is no `layout.tsx` here, and none should be added.
- Do not add public, unauthenticated endpoints under `api/internal/`.

### Testing Requirements
- `pnpm typecheck` from the repo root.
- `pnpm build` after adding a handler — Next validates route exports at build time.
- Exercise the handler with `curl` against `next dev`, replaying the exact header set and body the backend sends.

### Common Patterns
- Errors are returned as `Response.json({ message: '…' }, { status: … })` — 503 when the endpoint is unconfigured, 403 on a bad signature.
- Secrets come from `process.env` and are read inside the handler, never imported at module scope.

## Dependencies

### Internal
- `internal/revalidate/route.ts` → `next/cache` (`revalidatePath`)

### External
- `next` — `next/cache`
- `node:crypto` — `createHmac`, `timingSafeEqual`

<!-- MANUAL: -->
