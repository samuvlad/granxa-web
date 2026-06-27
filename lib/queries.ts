import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { auth, lotes, plots, rotations, sheep } from "@/lib/api";
import { clearToken } from "@/lib/auth";
import type {
  Lote,
  LoteUpdate,
  LoginRequest,
  Plot,
  PlotUpdate,
  Rotation,
  RotationUpdate,
  Sheep,
  SheepUpdate,
  Token,
  User,
} from "@/types";

export const QUERY_KEYS = {
  plots: ["plots"] as const,
  sheep: ["sheep"] as const,
  lotes: ["lotes"] as const,
  rotations: ["rotations"] as const,
  me: ["me"] as const,
};

export function useMe(initialData?: User) {
  return useQuery({
    queryKey: QUERY_KEYS.me,
    queryFn: auth.me,
    initialData,
    retry: false,
    staleTime: 60 * 1000,
  });
}

export function useLogin() {
  return useMutation<Token, Error, LoginRequest>({
    mutationFn: auth.login,
  });
}

export function useLogout() {
  const qc = useQueryClient();
  const router = useRouter();
  return () => {
    clearToken();
    qc.clear();
    router.push("/login");
  };
}

export function usePlots(initialData?: Plot[]) {
  return useQuery({
    queryKey: QUERY_KEYS.plots,
    queryFn: plots.list,
    initialData,
  });
}

export function useCreatePlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: plots.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.plots }),
  });
}

export function useUpdatePlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, plot }: { id: number; plot: PlotUpdate }) =>
      plots.update(id, plot),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.plots }),
  });
}

export function useDeletePlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: plots.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.plots }),
  });
}

export function useSheep(initialData?: Sheep[]) {
  return useQuery({
    queryKey: QUERY_KEYS.sheep,
    queryFn: sheep.list,
    initialData,
  });
}

export function useSheepDetail(id: number, initialData?: Sheep) {
  return useQuery({
    queryKey: [...QUERY_KEYS.sheep, id] as const,
    queryFn: () => sheep.get(id),
    enabled: Number.isFinite(id) && id > 0,
    initialData,
  });
}

export function useCreateSheep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sheep.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.sheep }),
  });
}

export function useUpdateSheep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, sheep: data }: { id: number; sheep: SheepUpdate }) =>
      sheep.update(id, data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.sheep });
      if (data) {
        qc.invalidateQueries({ queryKey: [...QUERY_KEYS.sheep, data.id] });
      }
    },
  });
}

export function useDeleteSheep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sheep.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.sheep }),
  });
}

export function useLotes(initialData?: Lote[]) {
  return useQuery({
    queryKey: QUERY_KEYS.lotes,
    queryFn: lotes.list,
    initialData,
  });
}

export function useLoteDetail(id: number, initialData?: Lote) {
  return useQuery({
    queryKey: [...QUERY_KEYS.lotes, id] as const,
    queryFn: () => lotes.get(id),
    enabled: Number.isFinite(id) && id > 0,
    initialData,
  });
}

export function useCreateLote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: lotes.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.lotes }),
  });
}

export function useUpdateLote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, lote }: { id: number; lote: LoteUpdate }) =>
      lotes.update(id, lote),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.lotes }),
  });
}

export function useDeleteLote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: lotes.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.lotes }),
  });
}

export function useRotations(initialData?: Rotation[]) {
  return useQuery({
    queryKey: QUERY_KEYS.rotations,
    queryFn: rotations.list,
    initialData,
  });
}

export function useRotationDetail(id: number, initialData?: Rotation) {
  return useQuery({
    queryKey: [...QUERY_KEYS.rotations, id] as const,
    queryFn: () => rotations.get(id),
    enabled: Number.isFinite(id) && id > 0,
    initialData,
  });
}

export function useCreateRotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: rotations.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.rotations });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.sheep });
    },
  });
}

export function useUpdateRotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rotation }: { id: number; rotation: RotationUpdate }) =>
      rotations.update(id, rotation),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.rotations });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.sheep });
    },
  });
}

export function useDeleteRotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: rotations.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.rotations }),
  });
}
