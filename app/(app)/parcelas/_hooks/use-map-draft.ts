"use client";

import { useCallback, useMemo, useState } from "react";

const DEFAULT_COLOR = "#3388ff";

type DraftState = {
  name: string;
  color: string;
  notes: string;
};

const EMPTY_DRAFT: DraftState = {
  name: "",
  color: DEFAULT_COLOR,
  notes: "",
};

export function useMapDraft() {
  const [draft, setDraft] = useState<DraftState>(EMPTY_DRAFT);

  const update = useCallback((updates: Partial<DraftState>) => {
    setDraft((prev) => ({ ...prev, ...updates }));
  }, []);

  const reset = useCallback(() => {
    setDraft(EMPTY_DRAFT);
  }, []);

  return useMemo(
    () => ({
      name: draft.name,
      color: draft.color,
      notes: draft.notes,
      update,
      reset,
    }),
    [draft, update, reset]
  );
}
