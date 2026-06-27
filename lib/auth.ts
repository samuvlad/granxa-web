import { ApiError } from "@/lib/api";

export const COOKIE_NAME = "granxa_auth_token";
export const LS_KEY = "granxa.auth.token";
const TOKEN_MAX_AGE_SECONDS = 8 * 60 * 60;

function getLocalStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function getDocument(): Document | null {
  if (typeof document === "undefined") return null;
  return document;
}

function readCookie(name: string): string | null {
  const doc = getDocument();
  if (!doc) return null;
  const target = `${name}=`;
  const parts = doc.cookie ? doc.cookie.split("; ") : [];
  for (const part of parts) {
    if (part.startsWith(target)) {
      return decodeURIComponent(part.slice(target.length));
    }
  }
  return null;
}

function writeCookie(name: string, value: string, maxAgeSeconds: number) {
  const doc = getDocument();
  if (!doc) return;
  doc.cookie = `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
}

function clearCookie(name: string) {
  writeCookie(name, "", 0);
}

export function getClientToken(): string | null {
  const ls = getLocalStorage();
  if (!ls) return null;
  return ls.getItem(LS_KEY);
}

export function getClientTokenWithCookieMirror(): string | null {
  const ls = getLocalStorage();
  if (!ls) return null;
  const fromLs = ls.getItem(LS_KEY);
  if (fromLs && readCookie(COOKIE_NAME) !== fromLs) {
    writeCookie(COOKIE_NAME, fromLs, TOKEN_MAX_AGE_SECONDS);
  }
  return fromLs;
}

export async function getServerToken(): Promise<string | null> {
  if (typeof window !== "undefined") return null;
  const { cookies } = (await import("next/headers")) as typeof import("next/headers");
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value ?? null;
}

export async function getToken(): Promise<string | null> {
  if (typeof window === "undefined") return getServerToken();
  return getClientToken();
}

export function setToken(token: string): void {
  const ls = getLocalStorage();
  if (ls) ls.setItem(LS_KEY, token);
  writeCookie(COOKIE_NAME, token, TOKEN_MAX_AGE_SECONDS);
}

export function clearToken(): void {
  const ls = getLocalStorage();
  if (ls) ls.removeItem(LS_KEY);
  clearCookie(COOKIE_NAME);
}

export function isAuthError(err: unknown): boolean {
  return err instanceof ApiError && err.status === 401;
}
