import type { Metadata } from "next";

import { lotes, plots, rotations } from "@/lib/api";

import { PastoreoClient } from "./_components/pastoreo-client";

export const metadata: Metadata = {
  title: "Pastoreo",
  description: "Rotación de lotes entre parcelas",
};

export default async function PastoreoPage() {
  const [initialPlots, initialRotations, initialLotes] = await Promise.all([
    plots.list(),
    rotations.list(),
    lotes.list(),
  ]);

  return (
    <PastoreoClient
      initialPlots={initialPlots}
      initialRotations={initialRotations}
      initialLotes={initialLotes}
    />
  );
}
