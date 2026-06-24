import type { Metadata } from "next";
import { DropletIcon } from "lucide-react";

import { SectionPlaceholder } from "@/components/layout/SectionPlaceholder";

export const metadata: Metadata = {
  title: "Produción",
  description: "Rexistro de leite, la e carne por animal ou lote",
};

export default function ProduccionPage() {
  return (
    <SectionPlaceholder
      title="Produción"
      description="Rexistro de leite, la e carne por animal ou lote"
      icon={DropletIcon}
    />
  );
}
