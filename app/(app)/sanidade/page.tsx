import type { Metadata } from "next";
import { StethoscopeIcon } from "lucide-react";

import { SectionPlaceholder } from "@/components/layout/SectionPlaceholder";

export const metadata: Metadata = {
  title: "Sanidade",
  description: "Vacinas, tratamentos e historial veterinario",
};

export default function SanidadePage() {
  return (
    <SectionPlaceholder
      title="Sanidade"
      description="Vacinas, tratamentos e historial veterinario"
      icon={StethoscopeIcon}
    />
  );
}
