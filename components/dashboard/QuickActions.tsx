import Link from "next/link";
import {
  ArrowRightIcon,
  MapIcon,
  PawPrintIcon,
  RotateCwIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface QuickActionsProps {
  canCreatePlot: boolean;
}

export function QuickActions({ canCreatePlot }: QuickActionsProps) {
  const items: Array<{
    href: string;
    label: string;
    description: string;
    icon: LucideIcon;
  }> = [
    {
      href: "/parcelas",
      label: "Xestionar parcelas",
      description: canCreatePlot
        ? "Debuxa e edita parcelas no mapa"
        : "Abre o mapa de parcelas",
      icon: MapIcon,
    },
    {
      href: "/rebanho",
      label: "Engadir ovella",
      description: "Rexistra un novo animal no rabaño",
      icon: PawPrintIcon,
    },
    {
      href: "/pastoreo",
      label: "Nova rotación",
      description: "Move un lote entre parcelas",
      icon: RotateCwIcon,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <Link
            key={it.href}
            href={it.href}
            className="group rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:bg-primary/5 transition-colors flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Icon className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{it.label}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {it.description}
                </p>
              </div>
            </div>
            <ArrowRightIcon className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>
        );
      })}
    </div>
  );
}