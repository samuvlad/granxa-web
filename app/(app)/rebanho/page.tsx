import type { Metadata } from "next";

import { lotes, sheep } from "@/lib/api";

import { RebanhoClient } from "./_components/rebanho-client";

export const metadata: Metadata = {
  title: "Rebaño",
  description: "Xestión das ovellas da granxa: crotal, sexo, raza, lote e estado",
};

export default async function RebanhoPage() {
  const [initialSheep, initialLotes] = await Promise.all([sheep.list(), lotes.list()]);

  return <RebanhoClient initialSheep={initialSheep} initialLotes={initialLotes} />;
}
