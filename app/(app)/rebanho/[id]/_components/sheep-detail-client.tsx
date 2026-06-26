"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeftIcon,
  PawPrintIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";

import type { Sheep, SheepCreate, SheepUpdate, Lote, Plot } from "@/types";
import { indexBy } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SheepFormDialog } from "@/components/sheep/SheepFormDialog";
import {
  formatDate,
  formatIdade,
  SexBadge,
  StatusBadge,
} from "@/components/sheep/SheepStatusBadge";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useDeleteSheep, useUpdateSheep } from "@/lib/queries";

interface SheepDetailClientProps {
  initialSheep: Sheep;
  initialAllSheep: Sheep[];
  initialLotes: Lote[];
  initialPlots: Plot[];
}

export function SheepDetailClient({
  initialSheep,
  initialAllSheep,
  initialLotes,
  initialPlots,
}: SheepDetailClientProps) {
  const router = useRouter();
  const updateSheep = useUpdateSheep();
  const deleteSheep = useDeleteSheep();
  const [editOpen, setEditOpen] = useState(false);

  const { confirm, dialog: confirmDialog } = useConfirm();

  const sheepById = indexBy(initialAllSheep, "id");
  const loteById = indexBy(initialLotes, "id");
  const plotById = indexBy(initialPlots, "id");

  const nai = initialSheep.nai_id ? sheepById.get(initialSheep.nai_id) : null;
  const pai = initialSheep.pai_id ? sheepById.get(initialSheep.pai_id) : null;
  const fillos = initialAllSheep.filter(
    (s) => s.nai_id === initialSheep.id || s.pai_id === initialSheep.id
  );
  const lote = initialSheep.lote_id
    ? loteById.get(initialSheep.lote_id) ?? null
    : null;
  const parcela = initialSheep.parcela_actual_id
    ? plotById.get(initialSheep.parcela_actual_id) ?? null
    : null;

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Eliminar ovella",
      description: `Vas eliminar a ovella ${initialSheep.nome ?? initialSheep.crotal}. Esta acción non se pode desfacer.`,
      confirmLabel: "Eliminar",
      variant: "destructive",
    });
    if (!ok) return;
    deleteSheep.mutate(initialSheep.id, {
      onSuccess: () => router.push("/rebanho"),
    });
  };

  const handleEditSubmit = (data: SheepCreate | SheepUpdate) => {
    updateSheep.mutate(
      { id: initialSheep.id, sheep: data as SheepUpdate },
      { onSuccess: () => setEditOpen(false) }
    );
  };

  return (
    <main className="h-full w-full overflow-y-auto p-6 space-y-6">
      <Link
        href="/rebanho"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Volver ao rabaño
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <PawPrintIcon className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {initialSheep.nome ?? "Ovella sen nome"}
            </h1>
            <p className="text-sm text-muted-foreground font-mono">{initialSheep.crotal}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <PencilIcon className="size-4" />
            Editar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteSheep.isPending}
          >
            <Trash2Icon className="size-4" />
            Eliminar
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardDescription>Sexo</CardDescription>
            <CardTitle>
              <SexBadge sexo={initialSheep.sexo} />
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Estado</CardDescription>
            <CardTitle>
              <StatusBadge estado={initialSheep.estado} />
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Idade</CardDescription>
            <CardTitle className="text-2xl">
              {formatIdade(initialSheep.data_nacemento)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos principais</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <Field label="Raza" value={initialSheep.raca} />
            <Field
              label="Data de nacemento"
              value={formatDate(initialSheep.data_nacemento)}
            />
            <Field label="Lote" value={lote ? lote.name : "—"} />
            <Field
              label="Parcela actual"
              value={
                parcela ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="size-2.5 rounded-full border border-black/10"
                      style={{ backgroundColor: parcela.color }}
                    />
                    {parcela.name}
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    Sen parcela (o lote non ten rotación activa)
                  </span>
                )
              }
            />
            <Field
              label="Nai"
              value={
                nai ? (
                  <Link
                    href={`/rebanho/${nai.id}`}
                    className="text-primary hover:underline"
                  >
                    {nai.nome ?? nai.crotal}
                  </Link>
                ) : (
                  "—"
                )
              }
            />
            <Field
              label="Pai"
              value={
                pai ? (
                  <Link
                    href={`/rebanho/${pai.id}`}
                    className="text-primary hover:underline"
                  >
                    {pai.nome ?? pai.crotal}
                  </Link>
                ) : (
                  "—"
                )
              }
            />
          </dl>
          {initialSheep.notas ? (
            <>
              <Separator className="my-4" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                  Notas
                </p>
                <p className="text-sm whitespace-pre-wrap">{initialSheep.notas}</p>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      {fillos.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Descendencia ({fillos.length})</CardTitle>
            <CardDescription>Ovellas das que é nai ou pai</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {fillos.map((f) => (
                <li key={f.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <SexBadge sexo={f.sexo} />
                    <div>
                      <Link
                        href={`/rebanho/${f.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {f.nome ?? f.crotal}
                      </Link>
                      <p className="text-xs text-muted-foreground font-mono">
                        {f.crotal}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatIdade(f.data_nacemento)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <SheepFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        sheep={initialSheep}
        sheepOptions={initialAllSheep}
        lotes={initialLotes}
        isPending={updateSheep.isPending}
        onSubmit={handleEditSubmit}
      />
      {confirmDialog}
    </main>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
        {label}
      </dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}
