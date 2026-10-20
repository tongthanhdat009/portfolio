import { cookies } from 'next/headers';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:9000';
const TOKEN_COOKIE = 'admin_api_token';

export class ApiError extends Error {
  status: number;
  errorCode?: string;

  constructor(status: number, message: string, errorCode?: string) {
    super(message);
    this.status = status;
    this.errorCode = errorCode;
  }
}

export async function getApiToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(TOKEN_COOKIE)?.value ?? null;
}

interface FetchOptions {
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  token?: string | null;
  /**
   * Return the raw response payload instead of unwrapping the `{ data }`
   * envelope. Needed for paginated endpoints where `meta` must be kept.
   */
  raw?: boolean;
}

export async function apiFetch<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const token = opts.token !== undefined ? opts.token : await getApiToken();

  const url = new URL('/api/v1' + path, API_BASE);
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }

  const res = await fetch(url.toString(), {
    method: opts.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    cache: 'no-store',
  });

  if (res.status === 204) return null as T;

  let payload: any = null;
  try {
    payload = await res.json();
  } catch {
    throw new ApiError(res.status, `API request failed with status ${res.status}`);
  }

  if (!res.ok) {
    const message =
      payload?.message ||
      (payload?.errors ? Object.values(payload.errors).flat().join('; ') : null) ||
      `API request failed with status ${res.status}`;
    throw new ApiError(res.status, message, payload?.errorCode);
  }

  if (opts.raw) return payload as T;
  return (payload?.data !== undefined ? payload.data : payload) as T;
}

export { API_BASE, TOKEN_COOKIE };
