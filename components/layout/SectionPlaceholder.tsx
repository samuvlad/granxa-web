import type { LucideIcon } from "lucide-react";
import { ClockIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SectionPlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function SectionPlaceholder({
  title,
  description,
  icon,
}: SectionPlaceholderProps) {
  return (
    <main className="h-full w-full overflow-y-auto p-6 space-y-6">
      <PageHeader title={title} description={description} icon={icon} />
      <Card className="max-w-xl">
        <CardHeader>
          <div className="size-10 rounded-lg bg-muted text-muted-foreground flex items-center justify-center">
            <ClockIcon className="size-5" />
          </div>
          <CardTitle>Próximamente</CardTitle>
          <CardDescription>
            Esta sección está en desenvolvemento. Incluirá ferramentas
            específicas para a xestión diaria da granxa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            A estrutura xa está lista para que poidas implementala nunha
            iteración posterior seguindo os patróns das seccións de Rebaño e
            Pastoreo.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}