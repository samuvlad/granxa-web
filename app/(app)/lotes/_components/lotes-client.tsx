"use client";

import { useState } from "react";
import { PlusIcon, UsersIcon } from "lucide-react";

import type { Lote, LoteCreate, LoteUpdate, Plot, Rotation, Sheep } from "@/types";

import { PageHeader } from "@/components/layout/PageHeader";
import { LoteFormDialog } from "@/components/lotes/LoteFormDialog";
import { LoteList } from "@/components/lotes/LoteList";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { getApiErrorMessage } from "@/lib/api";
import {
  useCreateLote,
  useDeleteLote,
  useLotes,
  usePlots,
  useRotations,
  useSheep,
  useUpdateLote,
} from "@/lib/queries";

interface LotesClientProps {
  initialLotes: Lote[];
  initialSheep: Sheep[];
  initialRotations: Rotation[];
  initialPlots: Plot[];
}

export function LotesClient({
  initialLotes,
  initialSheep,
  initialRotations,
  initialPlots,
}: LotesClientProps) {
  const { data: lotes = [], isLoading } = useLotes(initialLotes);
  const { data: sheep = [] } = useSheep(initialSheep);
  const { data: rotations = [] } = useRotations(initialRotations);
  const { data: plots = [] } = usePlots(initialPlots);
  const createLote = useCreateLote();
  const updateLote = useUpdateLote();
  const deleteLote = useDeleteLote();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Lote | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { confirm, dialog: confirmDialog } = useConfirm();

  const handleAdd = () => {
    setEditing(null);
    setFormError(null);
    setDialogOpen(true);
  };

  const handleEdit = (l: Lote) => {
    setEditing(l);
    setFormError(null);
    setDialogOpen(true);
  };

  const handleDelete = async (l: Lote) => {
    const ok = await confirm({
      title: "Eliminar lote",
      description: `Vas eliminar o lote "${l.name}". Esta acción non se pode desfacer.`,
      confirmLabel: "Eliminar",
      variant: "destructive",
    });
    if (!ok) return;
    deleteLote.mutate(l.id, {
      onError: (err) => setFormError(getApiErrorMessage(err)),
    });
  };

  const handleSubmit = (data: LoteCreate | LoteUpdate) => {
    setFormError(null);
    const onSuccess = () => setDialogOpen(false);
    const onError = (err: unknown) => setFormError(getApiErrorMessage(err));
    if (editing) {
      updateLote.mutate(
        { id: editing.id, lote: data as LoteUpdate },
        { onSuccess, onError }
      );
    } else {
      createLote.mutate(data as LoteCreate, { onSuccess, onError });
    }
  };

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) setFormError(null);
  };

  const isPending =
    createLote.isPending || updateLote.isPending || deleteLote.isPending;

  return (
    <main className="h-full w-full overflow-y-auto p-6 space-y-6">
      <PageHeader
        title="Lotes"
        description="Grupos de ovellas para xestionar xuntos o pastoreo e as rotacións"
        icon={UsersIcon}
        actions={
          <Button onClick={handleAdd}>
            <PlusIcon className="size-4" />
            Novo lote
          </Button>
        }
      />
      <LoteList
        lotes={lotes}
        sheep={sheep}
        rotations={rotations}
        plots={plots}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <LoteFormDialog
        open={dialogOpen}
        onOpenChange={handleOpenChange}
        lote={editing}
        onSubmit={handleSubmit}
        isPending={isPending}
        errorMessage={formError}
      />
      {confirmDialog}
    </main>
  );
}
