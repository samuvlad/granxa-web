"use client";

import { useState } from "react";
import { SaveIcon } from "lucide-react";

import type {
  Lote,
  Sexo,
  Sheep,
  SheepCreate,
  SheepUpdate,
  EstadoAnimal,
} from "@/types";

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
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";

interface SheepFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sheep?: Sheep | null;
  sheepOptions: Sheep[];
  lotes?: Lote[];
  onSubmit: (data: SheepCreate | SheepUpdate) => void;
  isPending?: boolean;
  errorMessage?: string | null;
}

const SEXO_VALUES: Sexo[] = ["femia", "macho"];
const ESTADO_VALUES: EstadoAnimal[] = ["activo", "vendido", "morto"];

const today = () => new Date().toISOString().slice(0, 10);

const SEXO_LABEL: Record<Sexo, string> = { femia: "Femia", macho: "Macho" };
const ESTADO_LABEL: Record<EstadoAnimal, string> = {
  activo: "Activo",
  vendido: "Vendido",
  morto: "Morto",
};

function defaultsFromSheep(sheep?: Sheep | null) {
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
      loteId: sheep.lote_id ? String(sheep.lote_id) : "",
      notas: sheep.notas ?? "",
    };
  }
  return {
    crotal: "",
    nome: "",
    sexo: "femia" as Sexo,
    dataNacemento: today(),
    raca: "Gallega",
    estado: "activo" as EstadoAnimal,
    naiId: "",
    paiId: "",
    loteId: "",
    notas: "",
  };
}

export function SheepFormDialog({
  open,
  onOpenChange,
  sheep,
  sheepOptions,
  lotes = [],
  onSubmit,
  isPending,
  errorMessage,
}: SheepFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <SheepFormBody
          key={sheep?.id ?? "new"}
          sheep={sheep}
          sheepOptions={sheepOptions}
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

function SheepFormBody({
  sheep,
  sheepOptions,
  lotes,
  onSubmit,
  onCancel,
  isPending,
  errorMessage,
}: {
  sheep?: Sheep | null;
  sheepOptions: Sheep[];
  lotes: Lote[];
  onSubmit: (data: SheepCreate | SheepUpdate) => void;
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
  const [loteId, setLoteId] = useState<string>(initial.loteId);
  const [notas, setNotas] = useState(initial.notas);

  const trimmedCrotal = crotal.trim();
  const trimmedNome = nome.trim();
  const trimmedRaca = raca.trim();
  const finalNome = trimmedNome || null;
  const finalRaca = trimmedRaca || "Gallega";
  const finalNaiId = naiId ? Number(naiId) : null;
  const finalPaiId = paiId ? Number(paiId) : null;
  const finalLoteId = loteId ? Number(loteId) : null;
  const finalNotas = notas.trim() || null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmedCrotal) return;
    if (sheep) {
      const patch: SheepUpdate = {};
      if (trimmedCrotal !== sheep.crotal) patch.crotal = trimmedCrotal;
      if (finalNome !== (sheep.nome ?? null)) patch.nome = finalNome;
      if (sexo !== sheep.sexo) patch.sexo = sexo;
      if (dataNacemento !== sheep.data_nacemento.slice(0, 10))
        patch.data_nacemento = dataNacemento;
      if (finalRaca !== sheep.raca) patch.raca = finalRaca;
      if (estado !== sheep.estado) patch.estado = estado;
      if (finalNaiId !== (sheep.nai_id ?? null)) patch.nai_id = finalNaiId;
      if (finalPaiId !== (sheep.pai_id ?? null)) patch.pai_id = finalPaiId;
      if (finalLoteId !== (sheep.lote_id ?? null)) patch.lote_id = finalLoteId;
      if (finalNotas !== (sheep.notas ?? null)) patch.notas = finalNotas;
      onSubmit(patch);
    } else {
      onSubmit({
        crotal: trimmedCrotal,
        nome: finalNome,
        sexo,
        data_nacemento: dataNacemento,
        raca: finalRaca,
        estado,
        nai_id: finalNaiId,
        pai_id: finalPaiId,
        lote_id: finalLoteId,
        notas: finalNotas,
      });
    }
  };

  const possibleParents = sheepOptions.filter((s) => s.id !== sheep?.id);
  const mothers = possibleParents.filter((s) => s.sexo === "femia");
  const fathers = possibleParents.filter((s) => s.sexo === "macho");

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
          <Input id="raca" value={raca} onChange={(e) => setRaca(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sexo">Sexo</Label>
          <Select value={sexo} onValueChange={(v) => setSexo(v as Sexo)}>
            <SelectTrigger id="sexo" className="w-full">
              <SelectValue>{SEXO_LABEL[sexo]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {SEXO_VALUES.map((s) => (
                <SelectItem key={s} value={s}>
                  {SEXO_LABEL[s]}
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
          <Label htmlFor="lote">Lote</Label>
          <Select value={loteId} onValueChange={(v) => setLoteId(v ?? "")}>
            <SelectTrigger id="lote" className="w-full">
              <SelectValue placeholder="Sen asignar">
                {loteId ? (lotes.find((l) => String(l.id) === loteId)?.name ?? null) : null}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sen asignar</SelectItem>
              {lotes.map((l) => (
                <SelectItem key={l.id} value={String(l.id)}>
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            A parcela actual derivarase automaticamente da rotación activa do lote.
          </p>
        </div>

        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="estado">Estado</Label>
          <Select
            value={estado}
            onValueChange={(v) => setEstado(v as EstadoAnimal)}
          >
            <SelectTrigger id="estado" className="w-full">
              <SelectValue>{ESTADO_LABEL[estado]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {ESTADO_VALUES.map((s) => (
                <SelectItem key={s} value={s}>
                  {ESTADO_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ParentSelect
          id="nai"
          label="Nai"
          value={naiId}
          onChange={setNaiId}
          options={mothers}
        />

        <ParentSelect
          id="pai"
          label="Pai"
          value={paiId}
          onChange={setPaiId}
          options={fathers}
        />

        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="notas">Notas</Label>
          <Textarea
            id="notas"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={3}
            placeholder="Observacións, tratamentos, particularidades…"
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

function ParentSelect({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Sheep[];
}) {
  const selected = options.find((s) => String(s.id) === value);
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={(v) => onChange(v ?? "")}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder="Sen asignar">
            {selected ? (selected.nome ?? selected.crotal) : null}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Sen asignar</SelectItem>
          {options.map((s) => (
            <SelectItem key={s.id} value={String(s.id)}>
              {s.nome ?? s.crotal}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
