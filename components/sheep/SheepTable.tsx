"use client";

import { useMemo, useState } from "react";
import { MoreHorizontalIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";

import type { EstadoAnimal, Lote, Sexo, Sheep } from "@/types";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatIdade,
  SexBadge,
  StatusBadge,
} from "@/components/sheep/SheepStatusBadge";

interface SheepTableProps {
  sheep: Sheep[];
  isLoading: boolean;
  lotes: Lote[];
  onAdd: () => void;
  onEdit: (sheep: Sheep) => void;
  onDelete: (sheep: Sheep) => void;
}

const ALL = "__all__";
const NO_LOTE = "__none__";

export function SheepTable({
  sheep,
  isLoading,
  lotes,
  onAdd,
  onEdit,
  onDelete,
}: SheepTableProps) {
  const [search, setSearch] = useState("");
  const [sexFilter, setSexFilter] = useState<Sexo | typeof ALL>(ALL);
  const [statusFilter, setStatusFilter] = useState<EstadoAnimal | typeof ALL>(ALL);
  const [loteFilter, setLoteFilter] = useState<string>(ALL);

  const loteById = useMemo(() => {
    const map = new Map<number, Lote>();
    lotes.forEach((l) => map.set(l.id, l));
    return map;
  }, [lotes]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return sheep.filter((s) => {
      if (sexFilter !== ALL && s.sexo !== sexFilter) return false;
      if (statusFilter !== ALL && s.estado !== statusFilter) return false;
      if (loteFilter !== ALL) {
        if (loteFilter === NO_LOTE) {
          if (s.lote_id != null) return false;
        } else if (String(s.lote_id ?? "") !== loteFilter) {
          return false;
        }
      }
      if (!term) return true;
      return (
        s.crotal.toLowerCase().includes(term) ||
        (s.nome ?? "").toLowerCase().includes(term) ||
        s.raca.toLowerCase().includes(term)
      );
    });
  }, [sheep, search, sexFilter, statusFilter, loteFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por crotal, nome ou raza…"
          className="max-w-xs"
        />
        <Select
          value={sexFilter}
          onValueChange={(v) => setSexFilter(v as Sexo | typeof ALL)}
        >
          <SelectTrigger className="w-36">
            <SelectValue>
              {sexFilter === ALL
                ? "Todos os sexos"
                : sexFilter === "femia"
                  ? "Femias"
                  : "Machos"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos os sexos</SelectItem>
            <SelectItem value="femia">Femias</SelectItem>
            <SelectItem value="macho">Machos</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as EstadoAnimal | typeof ALL)}
        >
          <SelectTrigger className="w-40">
            <SelectValue>
              {statusFilter === ALL
                ? "Todos os estados"
                : statusFilter === "activo"
                  ? "Activos"
                  : statusFilter === "vendido"
                    ? "Vendidos"
                    : "Mertos"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos os estados</SelectItem>
            <SelectItem value="activo">Activos</SelectItem>
            <SelectItem value="vendido">Vendidos</SelectItem>
            <SelectItem value="morto">Mertos</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={loteFilter}
          onValueChange={(v) => setLoteFilter(v ?? ALL)}
        >
          <SelectTrigger className="w-48">
            <SelectValue>
              {loteFilter === ALL
                ? "Todos os lotes"
                : loteFilter === NO_LOTE
                  ? "Sen lote"
                  : loteById.get(Number(loteFilter))?.name ?? "Todos os lotes"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos os lotes</SelectItem>
            <SelectItem value={NO_LOTE}>Sen lote</SelectItem>
            {lotes.map((l) => (
              <SelectItem key={l.id} value={String(l.id)}>
                {l.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <div className="text-sm text-muted-foreground">
          {filtered.length} de {sheep.length}
        </div>
        <Button onClick={onAdd}>
          <PlusIcon className="size-4" />
          Engadir ovella
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Crotal</th>
                <th className="px-4 py-3 text-left font-medium">Nome</th>
                <th className="px-4 py-3 text-left font-medium">Sexo</th>
                <th className="px-4 py-3 text-left font-medium">Raza</th>
                <th className="px-4 py-3 text-left font-medium">Lote</th>
                <th className="px-4 py-3 text-left font-medium">Idade</th>
                <th className="px-4 py-3 text-left font-medium">Estado</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    Cargando…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    Non hai ovellas que coincidan cos filtros.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">{s.crotal}</td>
                    <td className="px-4 py-3 font-medium">{s.nome ?? "—"}</td>
                    <td className="px-4 py-3">
                      <SexBadge sexo={s.sexo} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{s.raca}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {s.lote_id != null
                        ? loteById.get(s.lote_id)?.name ?? `Lote ${s.lote_id}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatIdade(s.data_nacemento)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge estado={s.estado} />
                    </td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon-sm" aria-label="Accións" />
                          }
                        >
                          <MoreHorizontalIcon className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(s)}>
                            <PencilIcon className="size-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => onDelete(s)}
                          >
                            <Trash2Icon className="size-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
