import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createPlot,
  createRotation,
  createSheep,
  deletePlot,
  deleteRotation,
  deleteSheep,
  getRotation,
  getSheep,
  listPlots,
  listRotations,
  listSheep,
  updatePlot,
  updateRotation,
  updateSheep,
} from "@/lib/api";
import type {
  PlotUpdate,
  RotationUpdate,
  SheepUpdate,
} from "@/types";

export const PLOTS_KEY = "plots";
export const SHEEP_KEY = "sheep";
export const ROTATIONS_KEY = "rotations";

export function usePlots() {
  return useQuery({
    queryKey: [PLOTS_KEY],
    queryFn: listPlots,
  });
}

export function useCreatePlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PLOTS_KEY] });
    },
  });
}

export function useUpdatePlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, plot }: { id: number; plot: PlotUpdate }) =>
      updatePlot(id, plot),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PLOTS_KEY] });
    },
  });
}

export function useDeletePlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PLOTS_KEY] });
    },
  });
}

export function useSheep() {
  return useQuery({
    queryKey: [SHEEP_KEY],
    queryFn: listSheep,
  });
}

export function useSheepDetail(id: number) {
  return useQuery({
    queryKey: [SHEEP_KEY, id],
    queryFn: () => getSheep(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useCreateSheep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSheep,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SHEEP_KEY] });
    },
  });
}

export function useUpdateSheep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, sheep }: { id: number; sheep: SheepUpdate }) =>
      updateSheep(id, sheep),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [SHEEP_KEY] });
      if (data) {
        queryClient.invalidateQueries({ queryKey: [SHEEP_KEY, data.id] });
      }
    },
  });
}

export function useDeleteSheep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSheep,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SHEEP_KEY] });
    },
  });
}

export function useRotations() {
  return useQuery({
    queryKey: [ROTATIONS_KEY],
    queryFn: listRotations,
  });
}

export function useRotationDetail(id: number) {
  return useQuery({
    queryKey: [ROTATIONS_KEY, id],
    queryFn: () => getRotation(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useCreateRotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRotation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ROTATIONS_KEY] });
    },
  });
}

export function useUpdateRotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      rotation,
    }: {
      id: number;
      rotation: RotationUpdate;
    }) => updateRotation(id, rotation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ROTATIONS_KEY] });
    },
  });
}

export function useDeleteRotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRotation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ROTATIONS_KEY] });
    },
  });
}
