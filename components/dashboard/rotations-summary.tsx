import { HomeIcon, MapIcon, PawPrintIcon, RotateCwIcon } from "lucide-react";

import type { Lote, Plot, Rotation, Sheep } from "@/types";

interface RotationsSummaryProps {
  rotations: Rotation[];
  plots: Plot[];
  lotes: Lote[];
}

export function RotationsSummary({ rotations, plots, lotes }: RotationsSummaryProps) {
  const active = rotations.filter((r) => !r.data_fim);
  const plotById = new Map(plots.map((p) => [p.id, p]));
  const loteById = new Map(lotes.map((l) => [l.id, l]));

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <p className="text-sm font-semibold">Rotacións activas</p>
        <p className="text-xs text-muted-foreground">
          Movementos de lote actualmente en curso
        </p>
      </div>
      {active.length === 0 ? (
        <p className="px-4 py-8 text-sm text-muted-foreground text-center">
          Non hai rotacións activas neste momento.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {active.slice(0, 5).map((r) => {
            const plot = plotById.get(r.parcela_id);
            const lote = loteById.get(r.lote_id);
            return (
              <li key={r.id} className="px-4 py-3 flex items-center gap-3">
                {plot ? (
                  <span
                    className="size-3 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: plot.color }}
                  />
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {lote?.name ?? `Lote ${r.lote_id}`}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {plot?.name ?? `Parcela ${r.parcela_id}`}
                  </p>
                </div>
                <span className="text-xs text-primary font-medium">En curso</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function getActivityFeedItems(sheep: Sheep[], limit = 5): Sheep[] {
  return [...sheep]
    .sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, limit);
}

export const DASHBOARD_ICONS = { HomeIcon, MapIcon, PawPrintIcon, RotateCwIcon } as const;
