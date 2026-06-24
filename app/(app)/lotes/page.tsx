import type { Metadata } from "next";

import { lotes, plots, rotations, sheep } from "@/lib/api";

import { LotesClient } from "./_components/lotes-client";

export const metadata: Metadata = {
  title: "Lotes",
  description: "Grupos de ovellas para xestionar xuntos o pastoreo e as rotacións",
};

export default async function LotesPage() {
  const [initialLotes, initialSheep, initialRotations, initialPlots] =
    await Promise.all([lotes.list(), sheep.list(), rotations.list(), plots.list()]);

  return (
    <LotesClient
      initialLotes={initialLotes}
      initialSheep={initialSheep}
      initialRotations={initialRotations}
      initialPlots={initialPlots}
    />
  );
}
