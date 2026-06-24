"use client";

import { useMemo } from "react";
import {
  MoreHorizontalIcon,
  PencilIcon,
  PawPrintIcon,
  Trash2Icon,
} from "lucide-react";

import type { Lote, Plot, Rotation, Sheep } from "@/types";
import { indexBy } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LoteListProps {
  lotes: Lote[];
  sheep: Sheep[];
  rotations: Rotation[];
  plots: Plot[];
  isLoading: boolean;
  onEdit: (lote: Lote) => void;
  onDelete: (lote: Lote) => void;
}

export function LoteList({
  lotes,
  sheep,
  rotations,
  plots,
  isLoading,
  onEdit,
  onDelete,
}: LoteListProps) {
  const plotById = useMemo(() => indexBy(plots, "id"), [plots]);

  const activeRotationByLote = useMemo(() => {
    const map = new Map<number, Rotation>();
    for (const r of rotations) {
      if (!r.data_fim) map.set(r.lote_id, r);
    }
    return map;
  }, [rotations]);

  const countByLote = useMemo(() => {
    const map = new Map<number, number>();
    for (const s of sheep) {
      if (s.estado !== "activo" || s.lote_id == null) continue;
      map.set(s.lote_id, (map.get(s.lote_id) ?? 0) + 1);
    }
    return map;
  }, [sheep]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando…</p>;
  }
  if (lotes.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Non hai lotes rexistrados. Crea un para comezar a agrupar ovellas.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {lotes.map((l) => {
        const count = countByLote.get(l.id) ?? 0;
        const active = activeRotationByLote.get(l.id);
        const plot = active ? plotById.get(active.parcela_id) : undefined;
        return (
          <Card key={l.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="truncate">{l.name}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Accións"
                      />
                    }
                  >
                    <MoreHorizontalIcon className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(l)}>
                      <PencilIcon className="size-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDelete(l)}
                    >
                      <Trash2Icon className="size-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <PawPrintIcon className="size-4 text-muted-foreground" />
                <span className="font-medium">{count}</span>
                <span className="text-muted-foreground">
                  {count === 1 ? "ovella activa" : "ovellas activas"}
                </span>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Parcela actual
                </p>
                <p className="text-sm font-medium">
                  {active ? (
                    <span className="flex items-center gap-2">
                      {plot ? (
                        <span
                          className="size-3 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: plot.color }}
                        />
                      ) : null}
                      {plot ? plot.name : `ID ${active.parcela_id}`}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      Sen rotación activa
                    </span>
                  )}
                </p>
              </div>

              {l.notas ? (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {l.notas}
                </p>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
