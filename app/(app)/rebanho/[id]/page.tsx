import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ApiError, lotes, plots, sheep } from "@/lib/api";

import { SheepDetailClient } from "./_components/sheep-detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const detail = await sheep.get(Number(id));
    const name = detail.nome ?? detail.crotal ?? id;
    return {
      title: name,
      description: `Ficha da ovella ${name}`,
    };
  } catch {
    return {
      title: id,
      description: `Ficha da ovella ${id}`,
    };
  }
}

export default async function SheepDetailPage({ params }: PageProps) {
  const { id } = await params;
  const sheepId = Number(id);
  if (!Number.isFinite(sheepId) || sheepId <= 0) notFound();

  let detail;
  try {
    detail = await sheep.get(sheepId);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const [initialAllSheep, initialLotes, initialPlots] = await Promise.all([
    sheep.list(),
    lotes.list(),
    plots.list(),
  ]);

  return (
    <SheepDetailClient
      initialSheep={detail}
      initialAllSheep={initialAllSheep}
      initialLotes={initialLotes}
      initialPlots={initialPlots}
    />
  );
}
