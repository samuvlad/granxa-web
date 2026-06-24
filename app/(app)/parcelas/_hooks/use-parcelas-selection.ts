"use client";

import { useCallback, useMemo, useState } from "react";

export function useParcelasSelection() {
  const [selectedPlotId, setSelectedPlotId] = useState<number | null>(null);
  const [editingPlotId, setEditingPlotId] = useState<number | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const startCreate = useCallback(() => {
    setSelectedPlotId(null);
    setEditingPlotId(null);
    setIsCreatingNew(true);
  }, []);

  const cancelCreate = useCallback(() => {
    setIsCreatingNew(false);
  }, []);

  const completeCreate = useCallback(() => {
    setIsCreatingNew(false);
  }, []);

  return useMemo(
    () => ({
      selectedPlotId,
      setSelectedPlotId,
      editingPlotId,
      setEditingPlotId,
      isCreatingNew,
      startCreate,
      cancelCreate,
      completeCreate,
    }),
    [
      selectedPlotId,
      editingPlotId,
      isCreatingNew,
      startCreate,
      cancelCreate,
      completeCreate,
    ]
  );
}
