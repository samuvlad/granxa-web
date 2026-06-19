"use client";

import { useState } from "react";
import { PawPrintIcon } from "lucide-react";

import type { Sheep, SheepCreate } from "@/types";

import { PageHeader } from "@/components/layout/PageHeader";
import { SheepFormDialog } from "@/components/sheep/SheepFormDialog";
import { SheepTable } from "@/components/sheep/SheepTable";
import { getApiErrorMessage } from "@/lib/api";
import {
  useCreateSheep,
  useDeleteSheep,
  useLotes,
  useSheep,
  useUpdateSheep,
} from "@/lib/queries";

export default function RebanhoPage() {
  const { data: sheep = [], isLoading } = useSheep();
  const { data: lotes = [] } = useLotes();
  const createSheep = useCreateSheep();
  const updateSheep = useUpdateSheep();
  const deleteSheep = useDeleteSheep();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Sheep | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

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

  const handleDelete = (s: Sheep) => {
    if (!confirm(`Eliminar a ovella ${s.nome ?? s.crotal}?`)) return;
    deleteSheep.mutate(s.id, {
      onSuccess: () => {
        if (editing?.id === s.id) setEditing(null);
      },
    });
  };

  const handleSubmit = (data: SheepCreate) => {
    setFormError(null);
    if (editing) {
      updateSheep.mutate(
        { id: editing.id, sheep: data },
        {
          onSuccess: () => setDialogOpen(false),
          onError: (err) => setFormError(getApiErrorMessage(err)),
        }
      );
    } else {
      createSheep.mutate(data, {
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
    </main>
  );
}
