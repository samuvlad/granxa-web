"use client";

import { useState } from "react";
import { SaveIcon } from "lucide-react";

import type { Plot, Rotation, RotationCreate } from "@/types";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RotationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rotation?: Rotation | null;
  plots: Plot[];
  onSubmit: (data: RotationCreate) => void;
  isPending?: boolean;
  errorMessage?: string | null;
}

const today = () => new Date().toISOString().slice(0, 10);

function defaults(
  rotation: Rotation | null | undefined,
  plots: Plot[]
): {
  parcelaId: string;
  loteNome: string;
  dataInicio: string;
  dataFin: string;
  senDataFin: boolean;
  notas: string;
} {
  if (rotation) {
    const hasFin = !!rotation.data_fim;
    return {
      parcelaId: String(rotation.parcela_id),
      loteNome: rotation.lote_nome,
      dataInicio: rotation.data_inicio.slice(0, 10),
      dataFin: hasFin ? rotation.data_fim!.slice(0, 10) : "",
      senDataFin: !hasFin,
      notas: rotation.notas ?? "",
    };
  }
  return {
    parcelaId: plots[0] ? String(plots[0].id) : "",
    loteNome: "",
    dataInicio: today(),
    dataFin: "",
    senDataFin: true,
    notas: "",
  };
}

export function RotationFormDialog({
  open,
  onOpenChange,
  rotation,
  plots,
  onSubmit,
  isPending,
  errorMessage,
}: RotationFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <RotationFormBody
          key={rotation?.id ?? "new"}
          rotation={rotation}
          plots={plots}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isPending={!!isPending}
          errorMessage={errorMessage ?? null}
        />
      </DialogContent>
    </Dialog>
  );
}

function RotationFormBody({
  rotation,
  plots,
  onSubmit,
  onCancel,
  isPending,
  errorMessage,
}: {
  rotation?: Rotation | null;
  plots: Plot[];
  onSubmit: (data: RotationCreate) => void;
  onCancel: () => void;
  isPending: boolean;
  errorMessage: string | null;
}) {
  const initial = defaults(rotation, plots);
  const [parcelaId, setParcelaId] = useState(initial.parcelaId);
  const [loteNome, setLoteNome] = useState(initial.loteNome);
  const [dataInicio, setDataInicio] = useState(initial.dataInicio);
  const [dataFin, setDataFin] = useState(initial.dataFin);
  const [senDataFin, setSenDataFin] = useState(initial.senDataFin);
  const [notas, setNotas] = useState(initial.notas);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parcelaId) return;
    onSubmit({
      parcela_id: Number(parcelaId),
      lote_nome: loteNome.trim() || "Lote",
      data_inicio: new Date(dataInicio).toISOString(),
      data_fim: !senDataFin && dataFin ? new Date(dataFin).toISOString() : null,
      notas: notas.trim() || null,
    });
  };

  const dataFinInvalida =
    !senDataFin && dataFin && dataInicio && dataFin < dataInicio;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>
          {rotation ? "Editar rotación" : "Nova rotación"}
        </DialogTitle>
        <DialogDescription>
          Rexistra o movemento dun lote entre parcelas. Podes deixar a data de
          fin baleira se aínda está en curso.
        </DialogDescription>
      </DialogHeader>

      {errorMessage ? (
        <Alert variant="destructive" title="Non se puido gardar">
          {errorMessage}
        </Alert>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="parcela">Parcela</Label>
          <Select
            value={parcelaId}
            onValueChange={(v) => setParcelaId(v ?? "")}
          >
            <SelectTrigger id="parcela" className="w-full">
              <SelectValue placeholder="Selecciona parcela" />
            </SelectTrigger>
            <SelectContent>
              {plots.length === 0 ? (
                <SelectItem value="__none__" disabled>
                  Non hai parcelas rexistradas
                </SelectItem>
              ) : (
                plots.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="lote">Nome do lote</Label>
          <Input
            id="lote"
            value={loteNome}
            onChange={(e) => setLoteNome(e.target.value)}
            placeholder="Lote 1 — Ovejas"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="inicio">Data de inicio</Label>
          <Input
            id="inicio"
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="fin">Data de fin</Label>
          <Input
            id="fin"
            type="date"
            value={senDataFin ? "" : dataFin}
            onChange={(e) => setDataFin(e.target.value)}
            disabled={senDataFin}
            placeholder={senDataFin ? "En curso" : ""}
            aria-invalid={dataFinInvalida ? true : undefined}
          />
          {dataFinInvalida ? (
            <p className="text-xs text-destructive">
              A data de fin non pode ser anterior á de inicio.
            </p>
          ) : null}
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <input
              type="checkbox"
              checked={senDataFin}
              onChange={(e) => setSenDataFin(e.target.checked)}
              className="size-3.5 accent-[var(--primary)]"
            />
            Aínda en curso
          </label>
        </div>

        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="notas">Notas</Label>
          <textarea
            id="notas"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={3}
            placeholder="Observacións sobre a rotación, motivo, densidade…"
            className="flex w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
          />
        </div>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={
            isPending || !parcelaId || !loteNome.trim() || !!dataFinInvalida
          }
        >
          <SaveIcon className="size-4" />
          {rotation ? "Gardar cambios" : "Crear rotación"}
        </Button>
      </DialogFooter>
    </form>
  );
}