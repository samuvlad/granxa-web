import type { Metadata } from "next";

import { ParcelasClient } from "./_components/parcelas-client";

export const metadata: Metadata = {
  title: "Parcelas",
  description: "Xestión de parcelas no mapa: debuxo, edición e xeometría",
};

export default function ParcelasPage() {
  return <ParcelasClient />;
}
