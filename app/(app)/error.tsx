"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

import { isAuthError } from "@/lib/auth";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("[app] Erro:", error);
    if (isAuthError(error)) {
      router.replace("/login");
    }
  }, [error, router]);

  if (isAuthError(error)) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive" title="Sesión caducada">
            <p>A túa sesión expirou. Volvendo ao inicio de sesión…</p>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <div className="max-w-md w-full space-y-4">
        <Alert variant="destructive" title="Algo non foi ben">
          <p>
            {error.message ||
              "Produciuse un erro inesperado ao cargar a sección."}
          </p>
        </Alert>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertTriangle className="size-4" aria-hidden />
          <span>Podes intentar de novo. Se persiste, reinicia a app.</span>
        </div>
        <Button onClick={reset}>Reintentar</Button>
      </div>
    </div>
  );
}
