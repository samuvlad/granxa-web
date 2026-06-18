"use client";

import { useState } from "react";
import { PlusIcon, RotateCwIcon } from "lucide-react";

import type { Rotation, RotationCreate } from "@/types";

import { PageHeader } from "@/components/layout/PageHeader";
import { RotationFormDialog } from "@/components/grazing/RotationFormDialog";
import { RotationList } from "@/components/grazing/RotationList";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api";
import {
  useCreateRotation,
  useDeleteRotation,
  usePlots,
  useRotations,
  useUpdateRotation,
} from "@/lib/queries";

export default function PastoreoPage() {
  const { data: plots = [] } = usePlots();
  const { data: rotations = [], isLoading } = useRotations();
  const createRotation = useCreateRotation();
  const updateRotation = useUpdateRotation();
  const deleteRotation = useDeleteRotation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Rotation | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleAdd = () => {
    setEditing(null);
    setFormError(null);
    setDialogOpen(true);
  };

  const handleEdit = (r: Rotation) => {
    setEditing(r);
    setFormError(null);
    setDialogOpen(true);
  };

  const handleDelete = (r: Rotation) => {
    if (!confirm(`Eliminar a rotación "${r.lote_nome}"?`)) return;
    deleteRotation.mutate(r.id);
  };

  const handleFinish = (r: Rotation) => {
    updateRotation.mutate({
      id: r.id,
      rotation: { data_fim: new Date().toISOString() },
    });
  };

  const handleSubmit = (data: RotationCreate) => {
    setFormError(null);
    if (editing) {
      updateRotation.mutate(
        { id: editing.id, rotation: data },
        {
          onSuccess: () => setDialogOpen(false),
          onError: (err) => setFormError(getApiErrorMessage(err)),
        }
      );
    } else {
      createRotation.mutate(data, {
        onSuccess: () => setDialogOpen(false),
        onError: (err) => setFormError(getApiErrorMessage(err)),
      });
    }
  };

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) setFormError(null);
  };

  return (
    <main className="h-full w-full overflow-y-auto p-6 space-y-6">
      <PageHeader
        title="Pastoreo"
        description="Rotación de lotes entre parcelas"
        icon={RotateCwIcon}
        actions={
          <Button onClick={handleAdd}>
            <PlusIcon className="size-4" />
            Nova rotación
          </Button>
        }
      />
      <RotationList
        rotations={rotations}
        plots={plots}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onFinish={handleFinish}
      />
      <RotationFormDialog
        open={dialogOpen}
        onOpenChange={handleOpenChange}
        rotation={editing}
        plots={plots}
        onSubmit={handleSubmit}
        isPending={createRotation.isPending || updateRotation.isPending}
        errorMessage={formError}
      />
    </main>
  );
}
