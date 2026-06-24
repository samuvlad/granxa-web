import Link from "next/link";
import { HomeIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <p className="text-5xl font-semibold tabular-nums">404</p>
        <h1 className="text-xl font-semibold">Páxina non atopada</h1>
        <p className="text-sm text-muted-foreground">
          A ruta que buscas non existe ou foi movida.
        </p>
        <Button render={<Link href="/" />}>
          <HomeIcon className="size-4" />
          Volver ao inicio
        </Button>
      </div>
    </div>
  );
}
