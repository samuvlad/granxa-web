"use client";

import { useMemo } from "react";
import {
  HomeIcon,
  MapIcon,
  PawPrintIcon,
  RotateCwIcon,
} from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { QuickActions } from "@/components/dashboard/QuickActions";
import {
  useLotes,
  usePlots,
  useRotations,
  useSheep,
} from "@/lib/queries";

export default function DashboardPage() {
  const { data: sheep = [] } = useSheep();
  const { data: plots = [] } = usePlots();
  const { data: rotations = [] } = useRotations();
  const { data: lotes = [] } = useLotes();

  const stats = useMemo(() => {
    const activeSheep = sheep.filter((s) => s.estado === "activo");
    const femias = activeSheep.filter((s) => s.sexo === "femia").length;
    const machos = activeSheep.filter((s) => s.sexo === "macho").length;
    const totalArea = plots.reduce(
      (sum, p) => sum + (p.area_m2 ?? 0),
      0
    );
    const activeRotations = rotations.filter((r) => !r.data_fim);
    return {
      activeSheep: activeSheep.length,
      femias,
      machos,
      totalPlots: plots.length,
      totalAreaHa: totalArea / 10000,
      activeRotations: activeRotations.length,
    };
  }, [sheep, plots, rotations]);

  return (
    <main className="h-full w-full overflow-y-auto p-6 space-y-6">
      <PageHeader
        title="Dashboard"
        description="Resumo da actividade da granxa"
        icon={HomeIcon}
      />

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Ovellas activas"
          value={stats.activeSheep}
          hint={`${stats.femias} femias · ${stats.machos} machos`}
          icon={PawPrintIcon}
        />
        <KPICard
          label="Parcelas"
          value={stats.totalPlots}
          hint={
            stats.totalAreaHa > 0
              ? `${stats.totalAreaHa.toFixed(2)} ha en total`
              : "Sen superficie rexistrada"
          }
          icon={MapIcon}
        />
        <KPICard
          label="Rotacións en curso"
          value={stats.activeRotations}
          hint={
            stats.activeRotations === 0
              ? "Sen movementos activos"
              : "Lotes actualmente en pastoreo"
          }
          icon={RotateCwIcon}
        />
        <KPICard
          label="Saúde do rabaño"
          value={
            stats.activeSheep === 0
              ? "—"
              : `${Math.round(
                  (sheep.filter((s) => s.estado === "activo").length /
                    Math.max(1, sheep.length)) *
                    100
                )}%`
          }
          hint={`${sheep.length} ovellas rexistradas`}
          icon={PawPrintIcon}
          accent="muted"
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Accións rápidas</h2>
        <QuickActions canCreatePlot={true} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ActivityFeed sheep={sheep} />
        <RotationsSummary rotations={rotations} plots={plots} lotes={lotes} />
      </section>
    </main>
  );
}

function RotationsSummary({
  rotations,
  plots,
  lotes,
}: {
  rotations: Awaited<ReturnType<typeof useRotations>>["data"];
  plots: Awaited<ReturnType<typeof usePlots>>["data"];
  lotes: Awaited<ReturnType<typeof useLotes>>["data"];
}) {
  const active = (rotations ?? []).filter((r) => !r.data_fim);
  const plotById = new Map((plots ?? []).map((p) => [p.id, p]));
  const loteById = new Map((lotes ?? []).map((l) => [l.id, l]));

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
                <span className="text-xs text-primary font-medium">
                  En curso
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
