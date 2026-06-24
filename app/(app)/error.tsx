"use client";

import { useEffect } from "react";
import { AlertTriangleIcon } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] Erro:", error);
  }, [error]);

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
          <AlertTriangleIcon className="size-4" aria-hidden />
          <span>Podes intentar de novo. Se persiste, reinicia a app.</span>
        </div>
        <Button onClick={reset}>Reintentar</Button>
      </div>
    </div>
  );
}
