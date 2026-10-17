import { cookies } from 'next/headers';
import { API_BASE, TOKEN_COOKIE } from '@/lib/api/client';

interface TokenResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    capabilities: string[];
  };
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(TOKEN_COOKIE)?.value;
  if (!token) return false;

  try {
    const res = await fetch(new URL('/api/v1/auth/me', API_BASE).toString(), {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      cache: 'no-store',
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function login(email: string, password: string): Promise<boolean> {
  let data: { data: TokenResponse };
  try {
    const res = await fetch(new URL('/api/v1/auth/token', API_BASE).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });
    if (!res.ok) return false;
    data = await res.json();
  } catch {
    return false;
  }

  if (!data?.data?.token) return false;

  const store = await cookies();
  store.set(TOKEN_COOKIE, data.data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return true;
}

export async function logout(): Promise<void> {
  const store = await cookies();
  const token = store.get(TOKEN_COOKIE)?.value;
  if (token) {
    try {
      await fetch(new URL('/api/v1/auth/token', API_BASE).toString(), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        cache: 'no-store',
      });
    } catch {
      // Revocation is best-effort; the cookie is cleared regardless.
    }
  }
  store.delete(TOKEN_COOKIE);
}

export async function getCurrentUser(): Promise<TokenResponse['user'] | null> {
  const store = await cookies();
  const token = store.get(TOKEN_COOKIE)?.value;
  if (!token) return null;

  try {
    const res = await fetch(new URL('/api/v1/auth/me', API_BASE).toString(), {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data ?? null;
  } catch {
    return null;
  }
}
