import type { Metadata } from "next";
import { HeartHandshakeIcon } from "lucide-react";

import { SectionPlaceholder } from "@/components/layout/SectionPlaceholder";

export const metadata: Metadata = {
  title: "Reprodución",
  description: "Cubracións, xestacións, partos e lactación",
};

export default function ReproducionPage() {
  return (
    <SectionPlaceholder
      title="Reprodución"
      description="Cubracións, xestacións, partos e lactación"
      icon={HeartHandshakeIcon}
    />
  );
}
