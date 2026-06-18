import { PackageIcon } from "lucide-react";

import { SectionPlaceholder } from "@/components/layout/SectionPlaceholder";

export default function InventarioPage() {
  return (
    <SectionPlaceholder
      title="Inventario"
      description="Cercados, bebedoiros, ferramentas e almacén"
      icon={PackageIcon}
    />
  );
}