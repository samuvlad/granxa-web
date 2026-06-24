import type { Metadata } from "next";
import { WheatIcon } from "lucide-react";

import { SectionPlaceholder } from "@/components/layout/SectionPlaceholder";

export const metadata: Metadata = {
  title: "Alimentación",
  description: "Stock de penso, forraxe e plans de alimentación",
};

export default function AlimentacionPage() {
  return (
    <SectionPlaceholder
      title="Alimentación"
      description="Stock de penso, forraxe e plans de alimentación"
      icon={WheatIcon}
    />
  );
}
