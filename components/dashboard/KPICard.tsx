import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface KPICardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  accent?: "default" | "warning" | "muted";
}

const accentClass: Record<NonNullable<KPICardProps["accent"]>, string> = {
  default: "bg-primary/10 text-primary",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200",
  muted: "bg-muted text-muted-foreground",
};

export function KPICard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "default",
}: KPICardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardDescription className="uppercase tracking-wide">
            {label}
          </CardDescription>
          <div
            className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${accentClass[accent]}`}
          >
            <Icon className="size-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle className="text-3xl font-semibold tabular-nums">
          {value}
        </CardTitle>
        {hint ? (
          <p className="text-xs text-muted-foreground mt-1">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}