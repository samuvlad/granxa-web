"use client";

import { useState } from "react";
import { PawPrintIcon } from "lucide-react";

import type { Sheep, SheepCreate, SheepUpdate, Lote } from "@/types";

import { PageHeader } from "@/components/layout/PageHeader";
import { SheepFormDialog } from "@/components/sheep/SheepFormDialog";
import { SheepTable } from "@/components/sheep/SheepTable";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { getApiErrorMessage } from "@/lib/api";
import {
  useCreateSheep,
  useDeleteSheep,
  useLotes,
  useSheep,
  useUpdateSheep,
} from "@/lib/queries";

interface RebanhoClientProps {
  initialSheep: Sheep[];
  initialLotes: Lote[];
}

export function RebanhoClient({ initialSheep, initialLotes }: RebanhoClientProps) {
  const { data: sheep = [], isLoading } = useSheep(initialSheep);
  const { data: lotes = [] } = useLotes(initialLotes);
  const createSheep = useCreateSheep();
  const updateSheep = useUpdateSheep();
  const deleteSheep = useDeleteSheep();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Sheep | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { confirm, dialog: confirmDialog } = useConfirm();

  const handleAdd = () => {
    setEditing(null);
    setFormError(null);
    setDialogOpen(true);
  };

  const handleEdit = (s: Sheep) => {
    setEditing(s);
    setFormError(null);
    setDialogOpen(true);
  };

  const handleDelete = async (s: Sheep) => {
    const ok = await confirm({
      title: "Eliminar ovella",
      description: `Vas eliminar a ovella ${s.nome ?? s.crotal}. Esta acción non se pode desfacer.`,
      confirmLabel: "Eliminar",
      variant: "destructive",
    });
    if (!ok) return;
    deleteSheep.mutate(s.id, {
      onSuccess: () => {
        if (editing?.id === s.id) setEditing(null);
      },
      onError: (err) => setFormError(getApiErrorMessage(err)),
    });
  };

  const handleSubmit = (data: SheepCreate | SheepUpdate) => {
    setFormError(null);
    const onSuccess = () => setDialogOpen(false);
    const onError = (err: unknown) => setFormError(getApiErrorMessage(err));
    if (editing) {
      updateSheep.mutate(
        { id: editing.id, sheep: data as SheepUpdate },
        { onSuccess, onError }
      );
    } else {
      createSheep.mutate(data as SheepCreate, { onSuccess, onError });
    }
  };

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) setFormError(null);
  };

  const isPending =
    createSheep.isPending || updateSheep.isPending || deleteSheep.isPending;

  return (
    <main className="h-full w-full overflow-y-auto p-6 space-y-6">
      <PageHeader
        title="Rebaño"
        description="Xestión das ovellas da granxa: crotal, sexo, raza, lote e estado"
        icon={PawPrintIcon}
      />
      <SheepTable
        sheep={sheep}
        isLoading={isLoading}
        lotes={lotes}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <SheepFormDialog
        open={dialogOpen}
        onOpenChange={handleOpenChange}
        sheep={editing}
        sheepOptions={sheep}
        lotes={lotes}
        onSubmit={handleSubmit}
        isPending={isPending}
        errorMessage={formError}
      />
      {confirmDialog}
    </main>
  );
}
