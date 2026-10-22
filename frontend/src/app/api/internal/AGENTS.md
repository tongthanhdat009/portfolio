<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# internal

## Purpose
Namespace for endpoints that are called by other services rather than by visitors. The backend Laravel application signs and POSTs to these routes after publishing content, so every handler under here must verify the request itself. Currently a single endpoint exists: the CMS revalidation webhook.

## Key Files
| File | Description |
|------|-------------|
| None at this level | The only handler is `revalidate/route.ts` |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `revalidate/` | HMAC-signed cache invalidation webhook called by the CMS backend (see `revalidate/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- "Internal" means server-to-server, not "private network". These routes are still reachable from the internet in a deployed build — the HMAC check is the only thing protecting them.
- The signing contract is shared with `backend/app/Jobs/RevalidateNextSite.php` in the Laravel app. If you change the signature input, the header names, or the body shape, change the backend job in the same commit.
- Secret: `NEXT_REVALIDATE_SECRET` in `frontend/.env.local` (gitignored). The backend holds the same value in `config('cms.revalidate.secret')`.
- Signature input string is exactly `timestamp.nonce.rawBody` — the raw body bytes, not a re-serialised JSON string.

### Testing Requirements
- `pnpm typecheck` from the repo root; `pnpm build` for route validation.
- End-to-end: publish an entry in the backend and confirm the outbox worker flips the operation to `delivered` and the public page updates.

### Common Patterns
- Freshness window: reject requests whose timestamp is more than 300 s from server time (replay protection).
- Constant-time comparison via `timingSafeEqual`, guarded by a length check and a try/catch.
- Return `503` when the secret is not configured, `403` when the signature or timestamp fails, `200` with the revalidated path list on success.

## Dependencies

### Internal
- `revalidate/route.ts` → `next/cache`
- Backend counterpart: `backend/app/Jobs/RevalidateNextSite.php`

### External
- `node:crypto` — `createHmac`, `timingSafeEqual`
- `next` — `next/cache`

<!-- MANUAL: -->
