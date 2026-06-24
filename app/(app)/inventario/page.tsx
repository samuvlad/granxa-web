import type { Metadata } from "next";
import { PackageIcon } from "lucide-react";

import { SectionPlaceholder } from "@/components/layout/SectionPlaceholder";

export const metadata: Metadata = {
  title: "Inventario",
  description: "Cercados, bebedoiros, ferramentas e almacén",
};

export default function InventarioPage() {
  return (
    <SectionPlaceholder
      title="Inventario"
      description="Cercados, bebedoiros, ferramentas e almacén"
      icon={PackageIcon}
    />
  );
}
