import type { Metadata } from "next";
import { HomeIcon, MapIcon, PawPrintIcon, RotateCwIcon } from "lucide-react";

import { lotes, plots, rotations, sheep } from "@/lib/api";

import { PageHeader } from "@/components/layout/PageHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RotationsSummary } from "@/components/dashboard/rotations-summary";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Resumo da actividade da granxa",
};

export default async function DashboardPage() {
  const [sheepData, plotsData, rotationsData, lotesData] = await Promise.all([
    sheep.list(),
    plots.list(),
    rotations.list(),
    lotes.list(),
  ]);

  const stats = computeStats(sheepData, plotsData, rotationsData);

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
                  (stats.activeSheep / Math.max(1, sheepData.length)) * 100
                )}%`
          }
          hint={`${sheepData.length} ovellas rexistradas`}
          icon={PawPrintIcon}
          accent="muted"
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Accións rápidas</h2>
        <QuickActions canCreatePlot />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ActivityFeed sheep={sheepData} />
        <RotationsSummary
          rotations={rotationsData}
          plots={plotsData}
          lotes={lotesData}
        />
      </section>
    </main>
  );
}

function computeStats(
  sheepData: Awaited<ReturnType<typeof sheep.list>>,
  plotsData: Awaited<ReturnType<typeof plots.list>>,
  rotationsData: Awaited<ReturnType<typeof rotations.list>>
) {
  const activeSheep = sheepData.filter((s) => s.estado === "activo");
  const femias = activeSheep.filter((s) => s.sexo === "femia").length;
  const machos = activeSheep.filter((s) => s.sexo === "macho").length;
  const totalAreaM2 = plotsData.reduce((sum, p) => sum + (p.area_m2 ?? 0), 0);
  const activeRotations = rotationsData.filter((r) => !r.data_fim);
  return {
    activeSheep: activeSheep.length,
    femias,
    machos,
    totalPlots: plotsData.length,
    totalAreaHa: totalAreaM2 / 10_000,
    activeRotations: activeRotations.length,
  };
}
