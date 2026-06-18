import axios from "axios";
import type {
  Plot,
  PlotCreate,
  PlotUpdate,
  Rotation,
  RotationCreate,
  RotationUpdate,
  Sheep,
  SheepCreate,
  SheepUpdate,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export function getApiErrorMessage(
  err: unknown,
  fallback = "Produciuse un erro"
): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { detail?: unknown } | undefined;
    const detail = data?.detail;
    if (typeof detail === "string" && detail.trim().length > 0) {
      return detail;
    }
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as { msg?: string };
      if (first?.msg) return first.msg;
    }
    if (err.message) return err.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export async function listPlots(): Promise<Plot[]> {
  const res = await api.get<Plot[]>("/plots/");
  return res.data;
}

export async function createPlot(plot: PlotCreate): Promise<Plot> {
  const res = await api.post<Plot>("/plots/", plot);
  return res.data;
}

export async function updatePlot(id: number, plot: PlotUpdate): Promise<Plot> {
  const res = await api.patch<Plot>(`/plots/${id}`, plot);
  return res.data;
}

export async function deletePlot(id: number): Promise<void> {
  await api.delete(`/plots/${id}`);
}

export async function listSheep(): Promise<Sheep[]> {
  const res = await api.get<Sheep[]>("/sheep/");
  return res.data;
}

export async function getSheep(id: number): Promise<Sheep> {
  const res = await api.get<Sheep>(`/sheep/${id}`);
  return res.data;
}

export async function createSheep(sheep: SheepCreate): Promise<Sheep> {
  const res = await api.post<Sheep>("/sheep/", sheep);
  return res.data;
}

export async function updateSheep(
  id: number,
  sheep: SheepUpdate
): Promise<Sheep> {
  const res = await api.patch<Sheep>(`/sheep/${id}`, sheep);
  return res.data;
}

export async function deleteSheep(id: number): Promise<void> {
  await api.delete(`/sheep/${id}`);
}

export async function listRotations(): Promise<Rotation[]> {
  const res = await api.get<Rotation[]>("/rotations/");
  return res.data;
}

export async function getRotation(id: number): Promise<Rotation> {
  const res = await api.get<Rotation>(`/rotations/${id}`);
  return res.data;
}

export async function createRotation(rotation: RotationCreate): Promise<Rotation> {
  const res = await api.post<Rotation>("/rotations/", rotation);
  return res.data;
}

export async function updateRotation(
  id: number,
  rotation: RotationUpdate
): Promise<Rotation> {
  const res = await api.patch<Rotation>(`/rotations/${id}`, rotation);
  return res.data;
}

export async function deleteRotation(id: number): Promise<void> {
  await api.delete(`/rotations/${id}`);
}
