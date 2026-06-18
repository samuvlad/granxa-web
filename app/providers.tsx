"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import { installApiMocks } from "@/lib/api-mock";

const USE_MOCKS =
  process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
  process.env.NEXT_PUBLIC_USE_MOCKS === "1";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  useEffect(() => {
    if (USE_MOCKS) {
      installApiMocks(api);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}