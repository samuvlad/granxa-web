import { StethoscopeIcon } from "lucide-react";

import { SectionPlaceholder } from "@/components/layout/SectionPlaceholder";

export default function SanidadePage() {
  return (
    <SectionPlaceholder
      title="Sanidade"
      description="Vacinas, tratamentos e historial veterinario"
      icon={StethoscopeIcon}
    />
  );
}