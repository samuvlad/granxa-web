import type {
  Lote,
  LoteCreate,
  LoteUpdate,
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

const API_URL =
  (typeof window === "undefined" ? process.env.API_URL : undefined) ??
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "";

type RequestInitJson = Omit<RequestInit, "body" | "headers"> & {
  body?: unknown;
  headers?: HeadersInit;
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: string
  ) {
    super(detail);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init: RequestInitJson = {}): Promise<T> {
  const { body, headers, ...rest } = init;
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    const detail = await safeReadDetail(res);
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

async function safeReadDetail(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { detail?: unknown };
    const detail = data?.detail;
    if (typeof detail === "string" && detail.trim().length > 0) return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as { msg?: string };
      if (first?.msg) return first.msg;
    }
  } catch {
    // ignored: response without JSON body
  }
  return res.statusText || `Erro ${res.status}`;
}

export function getApiErrorMessage(
  err: unknown,
  fallback = "Produciuse un erro"
): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return fallback;
}

export const plots = {
  list: () => request<Plot[]>("/api/plots"),
  create: (data: PlotCreate) => request<Plot>("/api/plots", { method: "POST", body: data }),
  update: (id: number, data: PlotUpdate) =>
    request<Plot>(`/api/plots/${id}`, { method: "PATCH", body: data }),
  remove: (id: number) => request<void>(`/api/plots/${id}`, { method: "DELETE" }),
};

export const sheep = {
  list: () => request<Sheep[]>("/api/sheep"),
  get: (id: number) => request<Sheep>(`/api/sheep/${id}`),
  create: (data: SheepCreate) => request<Sheep>("/api/sheep", { method: "POST", body: data }),
  update: (id: number, data: SheepUpdate) =>
    request<Sheep>(`/api/sheep/${id}`, { method: "PATCH", body: data }),
  remove: (id: number) => request<void>(`/api/sheep/${id}`, { method: "DELETE" }),
};

export const lotes = {
  list: () => request<Lote[]>("/api/lotes"),
  get: (id: number) => request<Lote>(`/api/lotes/${id}`),
  create: (data: LoteCreate) => request<Lote>("/api/lotes", { method: "POST", body: data }),
  update: (id: number, data: LoteUpdate) =>
    request<Lote>(`/api/lotes/${id}`, { method: "PATCH", body: data }),
  remove: (id: number) => request<void>(`/api/lotes/${id}`, { method: "DELETE" }),
};

export const rotations = {
  list: () => request<Rotation[]>("/api/rotations"),
  get: (id: number) => request<Rotation>(`/api/rotations/${id}`),
  create: (data: RotationCreate) =>
    request<Rotation>("/api/rotations", { method: "POST", body: data }),
  update: (id: number, data: RotationUpdate) =>
    request<Rotation>(`/api/rotations/${id}`, { method: "PATCH", body: data }),
  remove: (id: number) => request<void>(`/api/rotations/${id}`, { method: "DELETE" }),
};
