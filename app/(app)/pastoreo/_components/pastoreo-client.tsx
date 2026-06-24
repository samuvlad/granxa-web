"use client";

import { useState } from "react";
import { PlusIcon, RotateCwIcon } from "lucide-react";

import type { Rotation, RotationCreate, Lote, Plot } from "@/types";

import { PageHeader } from "@/components/layout/PageHeader";
import { RotationFormDialog } from "@/components/grazing/RotationFormDialog";
import { RotationList } from "@/components/grazing/RotationList";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { getApiErrorMessage } from "@/lib/api";
import {
  useCreateRotation,
  useDeleteRotation,
  useLotes,
  usePlots,
  useRotations,
  useUpdateRotation,
} from "@/lib/queries";

interface PastoreoClientProps {
  initialPlots: Plot[];
  initialRotations: Rotation[];
  initialLotes: Lote[];
}

export function PastoreoClient({
  initialPlots,
  initialRotations,
  initialLotes,
}: PastoreoClientProps) {
  const { data: plots = [] } = usePlots(initialPlots);
  const { data: rotations = [], isLoading } = useRotations(initialRotations);
  const { data: lotes = [] } = useLotes(initialLotes);
  const createRotation = useCreateRotation();
  const updateRotation = useUpdateRotation();
  const deleteRotation = useDeleteRotation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Rotation | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { confirm, dialog: confirmDialog } = useConfirm();

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

  const handleDelete = async (r: Rotation) => {
    const ok = await confirm({
      title: "Eliminar rotación",
      description: "Vas eliminar esta rotación. Esta acción non se pode desfacer.",
      confirmLabel: "Eliminar",
      variant: "destructive",
    });
    if (!ok) return;
    deleteRotation.mutate(r.id, {
      onError: (err) => setFormError(getApiErrorMessage(err)),
    });
  };

  const handleFinish = (r: Rotation) => {
    updateRotation.mutate({
      id: r.id,
      rotation: { data_fim: new Date().toISOString() },
    });
  };

  const handleSubmit = (data: RotationCreate) => {
    setFormError(null);
    const onSuccess = () => setDialogOpen(false);
    const onError = (err: unknown) => setFormError(getApiErrorMessage(err));
    if (editing) {
      updateRotation.mutate(
        { id: editing.id, rotation: data },
        { onSuccess, onError }
      );
    } else {
      createRotation.mutate(data, { onSuccess, onError });
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
        lotes={lotes}
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
        lotes={lotes}
        onSubmit={handleSubmit}
        isPending={createRotation.isPending || updateRotation.isPending}
        errorMessage={formError}
      />
      {confirmDialog}
    </main>
  );
}
