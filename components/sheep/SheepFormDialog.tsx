"use client";

import { useState } from "react";
import { SaveIcon } from "lucide-react";

import type { Plot, Sexo, Sheep, SheepCreate, EstadoAnimal } from "@/types";

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
import { Alert } from "@/components/ui/alert";

interface SheepFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sheep?: Sheep | null;
  sheepOptions: Sheep[];
  plots?: Plot[];
  onSubmit: (data: SheepCreate) => void;
  isPending?: boolean;
  errorMessage?: string | null;
}

const SEXO_VALUES: Sexo[] = ["femia", "macho"];
const ESTADO_VALUES: EstadoAnimal[] = ["activo", "vendido", "morto"];

const today = () => new Date().toISOString().slice(0, 10);

function defaultsFromSheep(
  sheep?: Sheep | null
): {
  crotal: string;
  nome: string;
  sexo: Sexo;
  dataNacemento: string;
  raca: string;
  estado: EstadoAnimal;
  naiId: string;
  paiId: string;
  parcelaActualId: string;
  notas: string;
} {
  if (sheep) {
    return {
      crotal: sheep.crotal,
      nome: sheep.nome ?? "",
      sexo: sheep.sexo,
      dataNacemento: sheep.data_nacemento.slice(0, 10),
      raca: sheep.raca,
      estado: sheep.estado,
      naiId: sheep.nai_id ? String(sheep.nai_id) : "",
      paiId: sheep.pai_id ? String(sheep.pai_id) : "",
      parcelaActualId: sheep.parcela_actual_id
        ? String(sheep.parcela_actual_id)
        : "",
      notas: sheep.notas ?? "",
    };
  }
  return {
    crotal: "",
    nome: "",
    sexo: "femia",
    dataNacemento: today(),
    raca: "Gallega",
    estado: "activo",
    naiId: "",
    paiId: "",
    parcelaActualId: "",
    notas: "",
  };
}

export function SheepFormDialog({
  open,
  onOpenChange,
  sheep,
  sheepOptions,
  plots = [],
  onSubmit,
  isPending,
  errorMessage,
}: SheepFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {/* The `key` ensures a fresh form state every time we open the dialog
            or switch between editing a different sheep. */}
        <SheepFormBody
          key={sheep?.id ?? "new"}
          sheep={sheep}
          sheepOptions={sheepOptions}
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

function SheepFormBody({
  sheep,
  sheepOptions,
  plots,
  onSubmit,
  onCancel,
  isPending,
  errorMessage,
}: {
  sheep?: Sheep | null;
  sheepOptions: Sheep[];
  plots: Plot[];
  onSubmit: (data: SheepCreate) => void;
  onCancel: () => void;
  isPending: boolean;
  errorMessage: string | null;
}) {
  const initial = defaultsFromSheep(sheep);
  const [crotal, setCrotal] = useState(initial.crotal);
  const [nome, setNome] = useState(initial.nome);
  const [sexo, setSexo] = useState<Sexo>(initial.sexo);
  const [dataNacemento, setDataNacemento] = useState(initial.dataNacemento);
  const [raca, setRaca] = useState(initial.raca);
  const [estado, setEstado] = useState<EstadoAnimal>(initial.estado);
  const [naiId, setNaiId] = useState<string>(initial.naiId);
  const [paiId, setPaiId] = useState<string>(initial.paiId);
  const [parcelaActualId, setParcelaActualId] = useState<string>(
    initial.parcelaActualId
  );
  const [notas, setNotas] = useState(initial.notas);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      crotal: crotal.trim(),
      nome: nome.trim() || null,
      sexo,
      data_nacemento: dataNacemento,
      raca: raca.trim() || "Gallega",
      estado,
      nai_id: naiId ? Number(naiId) : null,
      pai_id: paiId ? Number(paiId) : null,
      parcela_actual_id: parcelaActualId ? Number(parcelaActualId) : null,
      notas: notas.trim() || null,
    });
  };

  const possibleParents = sheepOptions.filter((s) => s.id !== sheep?.id);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>{sheep ? "Editar ovella" : "Engadir ovella"}</DialogTitle>
        <DialogDescription>
          {sheep
            ? "Actualiza os datos da ovella seleccionada."
            : "Rexistra unha nova ovella no rabaño."}
        </DialogDescription>
      </DialogHeader>

      {errorMessage ? (
        <Alert variant="destructive" title="Non se puido gardar">
          {errorMessage}
        </Alert>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="crotal">Crotal</Label>
          <Input
            id="crotal"
            value={crotal}
            onChange={(e) => setCrotal(e.target.value)}
            placeholder="ES001234567890"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="nome">Nome</Label>
          <Input
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Opcional"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="raca">Raza</Label>
          <Input
            id="raca"
            value={raca}
            onChange={(e) => setRaca(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sexo">Sexo</Label>
          <Select value={sexo} onValueChange={(v) => setSexo(v as Sexo)}>
            <SelectTrigger id="sexo" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEXO_VALUES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "femia" ? "Femia" : "Macho"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="data">Data de nacemento</Label>
          <Input
            id="data"
            type="date"
            value={dataNacemento}
            onChange={(e) => setDataNacemento(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="estado">Estado</Label>
          <Select
            value={estado}
            onValueChange={(v) => setEstado(v as EstadoAnimal)}
          >
            <SelectTrigger id="estado" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ESTADO_VALUES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "activo"
                    ? "Activo"
                    : s === "vendido"
                      ? "Vendido"
                      : "Morto"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="parcela-actual">Parcela actual</Label>
          <Select
            value={parcelaActualId}
            onValueChange={(v) => setParcelaActualId(v ?? "")}
          >
            <SelectTrigger id="parcela-actual" className="w-full">
              <SelectValue placeholder="Sen asignar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sen asignar</SelectItem>
              {plots.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="nai">Nai</Label>
          <Select
            value={naiId}
            onValueChange={(v) => setNaiId(v ?? "")}
          >
            <SelectTrigger id="nai" className="w-full">
              <SelectValue placeholder="Sen asignar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sen asignar</SelectItem>
              {possibleParents
                .filter((s) => s.sexo === "femia")
                .map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.nome ?? s.crotal}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pai">Pai</Label>
          <Select
            value={paiId}
            onValueChange={(v) => setPaiId(v ?? "")}
          >
            <SelectTrigger id="pai" className="w-full">
              <SelectValue placeholder="Sen asignar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sen asignar</SelectItem>
              {possibleParents
                .filter((s) => s.sexo === "macho")
                .map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.nome ?? s.crotal}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="notas">Notas</Label>
          <textarea
            id="notas"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={3}
            placeholder="Observacións, tratamentos, particularidades…"
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
        <Button type="submit" disabled={isPending || !crotal.trim()}>
          <SaveIcon className="size-4" />
          {sheep ? "Gardar cambios" : "Engadir ovella"}
        </Button>
      </DialogFooter>
    </form>
  );
}