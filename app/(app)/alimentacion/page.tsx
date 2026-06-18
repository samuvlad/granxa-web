import { WheatIcon } from "lucide-react";

import { SectionPlaceholder } from "@/components/layout/SectionPlaceholder";

export default function AlimentacionPage() {
  return (
    <SectionPlaceholder
      title="Alimentación"
      description="Stock de penso, forraxe e plans de alimentación"
      icon={WheatIcon}
    />
  );
}