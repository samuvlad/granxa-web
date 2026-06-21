"use client";

import { useState } from "react";
import { PlusIcon, SaveIcon } from "lucide-react";

import type { Lote, LoteCreate, Plot, Rotation, RotationCreate } from "@/types";

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
import { useCreateLote } from "@/lib/queries";

interface RotationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rotation?: Rotation | null;
  plots: Plot[];
  lotes: Lote[];
  onSubmit: (data: RotationCreate) => void;
  isPending?: boolean;
  errorMessage?: string | null;
}

const today = () => new Date().toISOString().slice(0, 10);

function defaults(
  rotation: Rotation | null | undefined,
  plots: Plot[],
  lotes: Lote[]
): {
  parcelaId: string;
  loteId: string;
  dataInicio: string;
  dataFin: string;
  senDataFin: boolean;
  notas: string;
} {
  if (rotation) {
    const hasFin = !!rotation.data_fim;
    return {
      parcelaId: String(rotation.parcela_id),
      loteId: String(rotation.lote_id),
      dataInicio: rotation.data_inicio.slice(0, 10),
      dataFin: hasFin ? rotation.data_fim!.slice(0, 10) : "",
      senDataFin: !hasFin,
      notas: rotation.notas ?? "",
    };
  }
  return {
    parcelaId: plots[0] ? String(plots[0].id) : "",
    loteId: lotes[0] ? String(lotes[0].id) : "",
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
  lotes,
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
          lotes={lotes}
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
  lotes,
  onSubmit,
  onCancel,
  isPending,
  errorMessage,
}: {
  rotation?: Rotation | null;
  plots: Plot[];
  lotes: Lote[];
  onSubmit: (data: RotationCreate) => void;
  onCancel: () => void;
  isPending: boolean;
  errorMessage: string | null;
}) {
  const initial = defaults(rotation, plots, lotes);
  const [parcelaId, setParcelaId] = useState(initial.parcelaId);
  const [loteId, setLoteId] = useState(initial.loteId);
  const [dataInicio, setDataInicio] = useState(initial.dataInicio);
  const [dataFin, setDataFin] = useState(initial.dataFin);
  const [senDataFin, setSenDataFin] = useState(initial.senDataFin);
  const [notas, setNotas] = useState(initial.notas);

  const [createLoteOpen, setCreateLoteOpen] = useState(false);
  const createLote = useCreateLote();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parcelaId || !loteId) return;
    onSubmit({
      lote_id: Number(loteId),
      parcela_id: Number(parcelaId),
      data_inicio: new Date(dataInicio).toISOString(),
      data_fim: !senDataFin && dataFin ? new Date(dataFin).toISOString() : null,
      notas: notas.trim() || null,
    });
  };

  const dataFinInvalida = !!(
    !senDataFin &&
    dataFin &&
    dataInicio &&
    dataFin < dataInicio
  );

  return (
    <>
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
            <Label htmlFor="lote">Lote</Label>
            <div className="flex gap-2">
              <Select
                value={loteId}
                onValueChange={(v) => setLoteId(v ?? "")}
              >
                <SelectTrigger id="lote" className="w-full">
                  <SelectValue placeholder="Selecciona lote">
                    {loteId
                      ? lotes.find((l) => String(l.id) === loteId)?.name ??
                        "Selecciona lote"
                      : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {lotes.length === 0 ? (
                    <SelectItem value="__none__" disabled>
                      Non hai lotes rexistrados
                    </SelectItem>
                  ) : (
                    lotes.map((l) => (
                      <SelectItem key={l.id} value={String(l.id)}>
                        {l.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateLoteOpen(true)}
                disabled={isPending}
                aria-label="Engadir novo lote"
              >
                <PlusIcon className="size-4" />
                Novo
              </Button>
            </div>
          </div>

          <div className="space-y-1.5 col-span-2">
            <Label htmlFor="parcela">Parcela</Label>
            <Select
              value={parcelaId}
              onValueChange={(v) => setParcelaId(v ?? "")}
            >
              <SelectTrigger id="parcela" className="w-full">
                <SelectValue placeholder="Selecciona parcela">
                  {parcelaId
                    ? plots.find((p) => String(p.id) === parcelaId)?.name ??
                      "Selecciona parcela"
                    : null}
                </SelectValue>
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
              isPending ||
              !parcelaId ||
              !loteId ||
              dataFinInvalida
            }
          >
            <SaveIcon className="size-4" />
            {rotation ? "Gardar cambios" : "Crear rotación"}
          </Button>
        </DialogFooter>
      </form>

      <CreateLoteDialog
        open={createLoteOpen}
        onOpenChange={setCreateLoteOpen}
        onCreated={(lote) => setLoteId(String(lote.id))}
        isPending={createLote.isPending}
        onSubmit={(data: LoteCreate) =>
          createLote.mutate(data, {
            onSuccess: (created) => {
              setCreateLoteOpen(false);
              if (created) setLoteId(String(created.id));
            },
          })
        }
      />
    </>
  );
}

function CreateLoteDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (lote: Lote) => void;
  isPending: boolean;
  onSubmit: (data: LoteCreate) => void;
}) {
  const [name, setName] = useState("");
  const [notas, setNotas] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("O nome é obrigatorio");
      return;
    }
    onSubmit({ name: name.trim(), notas: notas.trim() || null });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Novo lote</DialogTitle>
            <DialogDescription>
              Crea un lote para agrupar ovellas e rotacionalas xuntas.
            </DialogDescription>
          </DialogHeader>
          {error ? (
            <Alert variant="destructive" title="Non se puido crear">
              {error}
            </Alert>
          ) : null}
          <div className="space-y-1.5">
            <Label htmlFor="lote-name">Nome</Label>
            <Input
              id="lote-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Lote 1 — Ovejas adultas"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lote-notas">Notas</Label>
            <textarea
              id="lote-notas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={2}
              className="flex w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              <SaveIcon className="size-4" />
              Crear lote
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
