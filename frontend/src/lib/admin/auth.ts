import { cookies } from 'next/headers';
import crypto from 'crypto';

const COOKIE_NAME = 'portfolio_admin_auth';
const DEFAULT_PIN = 'neo2026';

function getSecretHash(password: string): string {
  return crypto.createHash('sha256').update(password + '_salt_neo_brutal_2026').digest('hex');
}

export async function verifyAdminPassword(inputPin: string): Promise<boolean> {
  const expectedPin = process.env.ADMIN_PIN || DEFAULT_PIN;
  return inputPin.trim() === expectedPin.trim();
}

export async function setAdminSession(): Promise<void> {
  const expectedPin = process.env.ADMIN_PIN || DEFAULT_PIN;
  const token = getSecretHash(expectedPin);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const expectedPin = process.env.ADMIN_PIN || DEFAULT_PIN;
  const expectedToken = getSecretHash(expectedPin);
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(COOKIE_NAME);
  return authCookie?.value === expectedToken;
}
