"use client";

import { useMemo } from "react";
import {
  CheckCircle2Icon,
  CircleDotIcon,
  MoreHorizontalIcon,
  PencilIcon,
  StopCircleIcon,
  Trash2Icon,
} from "lucide-react";

import type { Lote, Plot, Rotation } from "@/types";
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
import { formatDate } from "@/components/sheep/SheepStatusBadge";

interface RotationListProps {
  rotations: Rotation[];
  plots: Plot[];
  lotes: Lote[];
  isLoading: boolean;
  onEdit: (rotation: Rotation) => void;
  onDelete: (rotation: Rotation) => void;
  onFinish: (rotation: Rotation) => void;
}

function partitionByActive(rotations: Rotation[]) {
  const active: Rotation[] = [];
  const past: Rotation[] = [];
  for (const r of rotations) {
    if (!r.data_fim) active.push(r);
    else past.push(r);
  }
  return { active, past };
}

export function RotationList({
  rotations,
  plots,
  lotes,
  isLoading,
  onEdit,
  onDelete,
  onFinish,
}: RotationListProps) {
  const { active, past } = useMemo(() => partitionByActive(rotations), [rotations]);
  const plotById = useMemo(() => indexBy(plots, "id"), [plots]);
  const loteById = useMemo(() => indexBy(lotes, "id"), [lotes]);

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <header className="flex items-center gap-2">
          <CircleDotIcon className="size-4 text-primary" />
          <h2 className="text-base font-semibold">En curso ({active.length})</h2>
        </header>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : active.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Non hai rotacións activas. Crea unha para comezar.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {active.map((r) => (
              <RotationCard
                key={r.id}
                rotation={r}
                plot={plotById.get(r.parcela_id)}
                lote={loteById.get(r.lote_id)}
                onEdit={onEdit}
                onDelete={onDelete}
                onFinish={onFinish}
                active
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <header className="flex items-center gap-2">
          <CheckCircle2Icon className="size-4 text-muted-foreground" />
          <h2 className="text-base font-semibold">Histórico ({past.length})</h2>
        </header>
        {past.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aínda non hai rotacións finalizadas.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {past.map((r) => (
              <RotationCard
                key={r.id}
                rotation={r}
                plot={plotById.get(r.parcela_id)}
                lote={loteById.get(r.lote_id)}
                onEdit={onEdit}
                onDelete={onDelete}
                onFinish={onFinish}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function RotationCard({
  rotation,
  plot,
  lote,
  onEdit,
  onDelete,
  onFinish,
  active,
}: {
  rotation: Rotation;
  plot: Plot | undefined;
  lote: Lote | undefined;
  onEdit: (rotation: Rotation) => void;
  onDelete: (rotation: Rotation) => void;
  onFinish: (rotation: Rotation) => void;
  active?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {plot ? (
              <span
                className="size-3 rounded-full border border-black/10 shrink-0"
                style={{ backgroundColor: plot.color }}
              />
            ) : null}
            <CardTitle className="truncate">
              {lote?.name ?? `Lote ${rotation.lote_id}`}
            </CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon-sm" aria-label="Accións" />}
            >
              <MoreHorizontalIcon className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {active ? (
                <DropdownMenuItem onClick={() => onFinish(rotation)}>
                  <StopCircleIcon className="size-4" />
                  Rematar rotación
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem onClick={() => onEdit(rotation)}>
                <PencilIcon className="size-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(rotation)}>
                <Trash2Icon className="size-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Parcela</p>
          <p className="text-sm font-medium">
            {plot ? plot.name : `ID ${rotation.parcela_id}`}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Inicio</p>
            <p>{formatDate(rotation.data_inicio)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Fin</p>
            <p>{rotation.data_fim ? formatDate(rotation.data_fim) : "En curso"}</p>
          </div>
        </div>
        {rotation.notas ? (
          <p className="text-sm text-muted-foreground line-clamp-3">{rotation.notas}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
