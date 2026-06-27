"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { COOKIE_NAME, LS_KEY } from "@/lib/auth";

const DEFAULT_STALE_TIME = 5 * 1000;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const target = `${name}=`;
  const parts = document.cookie ? document.cookie.split("; ") : [];
  for (const part of parts) {
    if (part.startsWith(target)) {
      return decodeURIComponent(part.slice(target.length));
    }
  }
  return null;
}

function writeCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
}

function AuthBootstrap() {
  useEffect(() => {
    try {
      const ls = window.localStorage.getItem(LS_KEY);
      const cookie = readCookie(COOKIE_NAME);
      if (ls && ls !== cookie) {
        writeCookie(COOKIE_NAME, ls, 8 * 60 * 60);
      } else if (!ls && cookie) {
        window.localStorage.setItem(LS_KEY, cookie);
      }
    } catch {
      // ignored: storage may be unavailable
    }
  }, []);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: DEFAULT_STALE_TIME,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap />
      {children}
    </QueryClientProvider>
  );
}
