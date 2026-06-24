import { Loader2Icon } from "lucide-react";

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex h-full w-full items-center justify-center text-muted-foreground"
    >
      <Loader2Icon className="size-5 animate-spin" aria-hidden />
      <span className="sr-only">Cargando…</span>
    </div>
  );
}
