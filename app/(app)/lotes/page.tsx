"use client";

import { useState } from "react";
import { PlusIcon, UsersIcon } from "lucide-react";

import type { Lote, LoteCreate } from "@/types";

import { PageHeader } from "@/components/layout/PageHeader";
import { LoteFormDialog } from "@/components/lotes/LoteFormDialog";
import { LoteList } from "@/components/lotes/LoteList";
import { Button } from "@/components/ui/button";
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

export default function LotesPage() {
  const { data: lotes = [], isLoading } = useLotes();
  const { data: sheep = [] } = useSheep();
  const { data: rotations = [] } = useRotations();
  const { data: plots = [] } = usePlots();
  const createLote = useCreateLote();
  const updateLote = useUpdateLote();
  const deleteLote = useDeleteLote();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Lote | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

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

  const handleDelete = (l: Lote) => {
    if (!confirm(`Eliminar o lote "${l.name}"?`)) return;
    deleteLote.mutate(l.id, {
      onError: (err) => alert(getApiErrorMessage(err)),
    });
  };

  const handleSubmit = (data: LoteCreate) => {
    setFormError(null);
    if (editing) {
      updateLote.mutate(
        { id: editing.id, lote: data },
        {
          onSuccess: () => setDialogOpen(false),
          onError: (err) => setFormError(getApiErrorMessage(err)),
        }
      );
    } else {
      createLote.mutate(data, {
        onSuccess: () => setDialogOpen(false),
        onError: (err) => setFormError(getApiErrorMessage(err)),
      });
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
    </main>
  );
}
