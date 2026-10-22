<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-22 | Updated: 2026-10-22 -->

# revalidate

## Purpose
The single public-facing-but-signed webhook. The Laravel CMS backend fires an HMAC-signed POST here after a publish so Next.js drops the stale caches for the affected routes. It maps a CMS payload (`type` + `slug`/`key`) to concrete paths and calls `revalidatePath` on each.

## Key Files
| File | Description |
|------|-------------|
| `route.ts` | `export async function POST(req: Request): Promise<Response>`. Reads `NEXT_REVALIDATE_SECRET` (503 if unset), reads the raw body, recomputes `HMAC-SHA256(secret, \`${timestamp}.${nonce}.${raw}\`)` and compares it to the `X-Revalidate-Signature` header with `timingSafeEqual` inside a length-checked try/catch, rejects timestamps more than 300 s from server time, then `JSON.parse`s the body and calls `revalidatePath` for each path from `pathsFor()`. Responds `{ revalidated: true, paths }` |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| None | — |

## For AI Agents

### Working In This Directory
- Required headers: `X-Revalidate-Timestamp` (unix seconds), `X-Revalidate-Nonce` (uuid), `X-Revalidate-Signature` (hex HMAC-SHA256 of `timestamp.nonce.rawBody`).
- The signed string must use the **raw** request body. The backend computes `hash_hmac('sha256', $timestamp.'.'.$nonce.'.'.json_encode($body), $secret)` — the body it sends, byte for byte.
- The freshness window is 300 s. A valid signature with a stale timestamp is rejected with 403.
- `pathsFor(body)` maps the payload to paths:
  - `type: 'project'` → `/work` and `/work/<slug>`
  - `type: 'note'` → `/notes` and `/notes/<slug>`
  - `type: 'experiment'` → `/lab` and `/lab/<slug>`
  - `type: 'page'` → `/` when `key === 'home'`, otherwise `/<key>`
  - anything else → `/`
- The backend additionally appends `timestamp` and `nonce` **into the JSON body**; the route ignores those fields and only reads `type`, `slug`, `key`.
- The endpoint does not check the nonce for uniqueness — only the timestamp window bounds replay. Keep the timestamp check first.
- `pathsFor` is a pure function with a `switch`; extend it there rather than adding conditionals inline.
- The secret must never be echoed in a response or a log.

### Testing Requirements
- `pnpm typecheck` from the repo root; `pnpm build` (route handlers are validated at build).
- Manual check against `next dev` — compute the signature locally and POST it:
  ```
  TS=$(date +%s); NONCE=$(uuidgen); BODY='{"type":"project","slug":"cua"}'
  SIG=$(printf '%s' "$TS.$NONCE.$BODY" | openssl dgst -sha256 -hmac "$NEXT_REVALIDATE_SECRET" -hex | awk '{print $2}')
  curl -i -X POST http://localhost:3000/api/internal/revalidate \
    -H "X-Revalidate-Timestamp: $TS" -H "X-Revalidate-Nonce: $NONCE" \
    -H "X-Revalidate-Signature: $SIG" -d "$BODY"
  ```
  Expect `200 {"revalidated":true,"paths":["/work","/work/cua"]}`. A wrong or missing signature must return `403`.
- End-to-end: publish an entry in the backend, confirm the outbox operation reaches `delivered` and the public page shows the change.

### Common Patterns
- Status codes: `503` (secret not configured), `403` (bad signature or stale timestamp), `200` (revalidated).
- One handler, one responsibility: verify, then invalidate. No CMS data is fetched here — the site re-reads the CMS on the next request.

## Dependencies

### Internal
- Backend counterpart `backend/app/Jobs/RevalidateNextSite.php` signs and delivers the request; `backend/config/cms.php` holds the shared secret and target URL

### External
- `next` — `next/cache` (`revalidatePath`)
- `node:crypto` — `createHmac`, `timingSafeEqual`

<!-- MANUAL: -->
