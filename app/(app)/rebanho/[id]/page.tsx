"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  PawPrintIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";

import type { SheepCreate } from "@/types";

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
import {
  useDeleteSheep,
  usePlots,
  useSheep,
  useSheepDetail,
  useUpdateSheep,
} from "@/lib/queries";

export default function SheepDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const sheepId = Number(id);
  const { data: sheep } = useSheepDetail(sheepId);
  const { data: allSheep = [] } = useSheep();
  const { data: plots = [] } = usePlots();
  const updateSheep = useUpdateSheep();
  const deleteSheep = useDeleteSheep();

  const [editOpen, setEditOpen] = useState(false);

  if (!Number.isFinite(sheepId)) {
    return <div className="p-6 text-muted-foreground">ID non válido.</div>;
  }

  if (!sheep) {
    return (
      <main className="h-full w-full overflow-y-auto p-6">
        <Link
          href="/rebanho"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeftIcon className="size-4" />
          Volver ao rabaño
        </Link>
        <p className="text-muted-foreground">Cargando ficha ou ovella non atopada…</p>
      </main>
    );
  }

  const nai = sheep.nai_id ? allSheep.find((s) => s.id === sheep.nai_id) : null;
  const pai = sheep.pai_id ? allSheep.find((s) => s.id === sheep.pai_id) : null;
  const fillos = allSheep.filter((s) => s.nai_id === sheep.id || s.pai_id === sheep.id);

  const handleDelete = () => {
    if (!confirm(`Eliminar a ovella ${sheep.nome ?? sheep.crotal}?`)) return;
    deleteSheep.mutate(sheep.id, {
      onSuccess: () => {
        window.location.href = "/rebanho";
      },
    });
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
              {sheep.nome ?? "Ovella sen nome"}
            </h1>
            <p className="text-sm text-muted-foreground font-mono">
              {sheep.crotal}
            </p>
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
              <SexBadge sexo={sheep.sexo} />
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Estado</CardDescription>
            <CardTitle>
              <StatusBadge estado={sheep.estado} />
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Idade</CardDescription>
            <CardTitle className="text-2xl">
              {formatIdade(sheep.data_nacemento)}
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
            <Field label="Raza" value={sheep.raca} />
            <Field label="Data de nacemento" value={formatDate(sheep.data_nacemento)} />
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
          {sheep.notas ? (
            <>
              <Separator className="my-4" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                  Notas
                </p>
                <p className="text-sm whitespace-pre-wrap">{sheep.notas}</p>
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
        sheep={sheep}
        sheepOptions={allSheep}
        plots={plots}
        isPending={updateSheep.isPending}
        onSubmit={(data: SheepCreate) => {
          updateSheep.mutate(
            { id: sheep.id, sheep: data },
            { onSuccess: () => setEditOpen(false) }
          );
        }}
      />
    </main>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
        {label}
      </dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}