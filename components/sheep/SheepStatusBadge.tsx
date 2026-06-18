import type { EstadoAnimal, Sexo } from "@/types";

import { Badge } from "@/components/ui/badge";

const sexConfig: Record<Sexo, { label: string; variant: "default" | "secondary" | "outline" }> = {
  femia: { label: "Femia", variant: "secondary" },
  macho: { label: "Macho", variant: "outline" },
};

const statusConfig: Record<EstadoAnimal, { label: string; className: string }> = {
  activo: {
    label: "Activo",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  },
  vendido: {
    label: "Vendido",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  },
  morto: {
    label: "Morto",
    className: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  },
};

export function SexBadge({ sexo }: { sexo: Sexo }) {
  const config = sexConfig[sexo];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function StatusBadge({ estado }: { estado: EstadoAnimal }) {
  const config = statusConfig[estado];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export function calcIdade(dataNacemento: string): number {
  const birth = new Date(dataNacemento);
  if (Number.isNaN(birth.getTime())) return 0;
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) years -= 1;
  return Math.max(0, years);
}

export function formatIdade(dataNacemento: string): string {
  const years = calcIdade(dataNacemento);
  if (years === 0) {
    const months = Math.max(
      0,
      Math.floor(
        (Date.now() - new Date(dataNacemento).getTime()) / (1000 * 60 * 60 * 24 * 30)
      )
    );
    return months > 0 ? `${months} meses` : "Recén nacida";
  }
  return `${years} ${years === 1 ? "ano" : "anos"}`;
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("gl-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}