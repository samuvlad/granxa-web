"use client";

import { useState } from "react";
import { SaveIcon } from "lucide-react";

import type { Lote, LoteCreate } from "@/types";

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
import { Textarea } from "@/components/ui/textarea";

interface LoteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lote?: Lote | null;
  onSubmit: (data: LoteCreate) => void;
  isPending?: boolean;
  errorMessage?: string | null;
}

function defaultsFromLote(lote?: Lote | null) {
  if (lote) {
    return { name: lote.name, notas: lote.notas ?? "" };
  }
  return { name: "", notas: "" };
}

export function LoteFormDialog({
  open,
  onOpenChange,
  lote,
  onSubmit,
  isPending,
  errorMessage,
}: LoteFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <LoteFormBody
          key={lote?.id ?? "new"}
          lote={lote}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isPending={!!isPending}
          errorMessage={errorMessage ?? null}
        />
      </DialogContent>
    </Dialog>
  );
}

function LoteFormBody({
  lote,
  onSubmit,
  onCancel,
  isPending,
  errorMessage,
}: {
  lote?: Lote | null;
  onSubmit: (data: LoteCreate) => void;
  onCancel: () => void;
  isPending: boolean;
  errorMessage: string | null;
}) {
  const initial = defaultsFromLote(lote);
  const [name, setName] = useState(initial.name);
  const [notas, setNotas] = useState(initial.notas);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: name.trim(),
      notas: notas.trim() || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>{lote ? "Editar lote" : "Novo lote"}</DialogTitle>
        <DialogDescription>
          {lote
            ? "Actualiza os datos do lote seleccionado."
            : "Crea un lote para agrupar ovellas e rotacionalas xuntas."}
        </DialogDescription>
      </DialogHeader>

      {errorMessage ? (
        <Alert variant="destructive" title="Non se puido gardar">
          {errorMessage}
        </Alert>
      ) : null}

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="lote-name">Nome</Label>
          <Input
            id="lote-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Lote 1 — Ovejas adultas"
            required
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lote-notas">Notas</Label>
          <Textarea
            id="lote-notas"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={3}
            placeholder="Observacións sobre o lote, composición, manexo…"
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
        <Button type="submit" disabled={isPending || !name.trim()}>
          <SaveIcon className="size-4" />
          {lote ? "Gardar cambios" : "Crear lote"}
        </Button>
      </DialogFooter>
    </form>
  );
}
