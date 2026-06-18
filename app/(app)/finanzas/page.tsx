import { WalletIcon } from "lucide-react";

import { SectionPlaceholder } from "@/components/layout/SectionPlaceholder";

export default function FinanzasPage() {
  return (
    <SectionPlaceholder
      title="Finanzas"
      description="Gastos, ingresos, balance e subvencións"
      icon={WalletIcon}
    />
  );
}