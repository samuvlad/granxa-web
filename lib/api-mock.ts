import type { AxiosInstance } from "axios";

import type { Rotation, RotationCreate, RotationUpdate, Sheep, SheepCreate, SheepUpdate } from "@/types";

let nextId = 1000;

const nowIso = () => new Date().toISOString();

function makeDates<T extends object>(obj: T): T & { created_at: string; updated_at: string } {
  return {
    ...obj,
    created_at: nowIso(),
    updated_at: nowIso(),
  };
}

const seedSheep: Sheep[] = [
  {
    id: 1,
    crotal: "ES001234567890",
    nome: "Margarita",
    sexo: "femia",
    data_nacemento: "2021-03-12",
    raca: "Gallega",
    estado: "activo",
    nai_id: null,
    pai_id: null,
    parcela_actual_id: null,
    notas: "Ovelha líder do lote 1",
    created_at: nowIso(),
    updated_at: nowIso(),
  },
  {
    id: 2,
    crotal: "ES001234567891",
    nome: "Lúa",
    sexo: "femia",
    data_nacemento: "2022-04-05",
    raca: "Gallega",
    estado: "activo",
    nai_id: 1,
    pai_id: null,
    parcela_actual_id: null,
    notas: null,
    created_at: nowIso(),
    updated_at: nowIso(),
  },
  {
    id: 3,
    crotal: "ES001234567892",
    nome: "Branco",
    sexo: "macho",
    data_nacemento: "2020-02-20",
    raca: "Gallega",
    estado: "activo",
    nai_id: null,
    pai_id: null,
    parcela_actual_id: null,
    notas: "Macho reprodutor",
    created_at: nowIso(),
    updated_at: nowIso(),
  },
  {
    id: 4,
    crotal: "ES001234567893",
    nome: null,
    sexo: "femia",
    data_nacemento: "2023-05-18",
    raca: "Gallega",
    estado: "activo",
    nai_id: 2,
    pai_id: 3,
    parcela_actual_id: null,
    notas: null,
    created_at: nowIso(),
    updated_at: nowIso(),
  },
  {
    id: 5,
    crotal: "ES001234567894",
    nome: "Negra",
    sexo: "femia",
    data_nacemento: "2021-09-30",
    raca: "Gallega",
    estado: "activo",
    nai_id: null,
    pai_id: null,
    parcela_actual_id: null,
    notas: null,
    created_at: nowIso(),
    updated_at: nowIso(),
  },
  {
    id: 6,
    crotal: "ES001234567895",
    nome: "Tizón",
    sexo: "macho",
    data_nacemento: "2019-11-08",
    raca: "Gallega",
    estado: "vendido",
    nai_id: null,
    pai_id: null,
    parcela_actual_id: null,
    notas: "Vendido en feira de Ortigueira",
    created_at: nowIso(),
    updated_at: nowIso(),
  },
  {
    id: 7,
    crotal: "ES001234567896",
    nome: "Primavera",
    sexo: "femia",
    data_nacemento: "2024-03-22",
    raca: "Gallega",
    estado: "activo",
    nai_id: 4,
    pai_id: 3,
    parcela_actual_id: null,
    notas: "Xata nova",
    created_at: nowIso(),
    updated_at: nowIso(),
  },
  {
    id: 8,
    crotal: "ES001234567897",
    nome: "Estreliña",
    sexo: "femia",
    data_nacemento: "2022-12-01",
    raca: "Gallega",
    estado: "activo",
    nai_id: 5,
    pai_id: null,
    parcela_actual_id: null,
    notas: null,
    created_at: nowIso(),
    updated_at: nowIso(),
  },
];

const seedRotations: Rotation[] = [
  {
    id: 1,
    parcela_id: 1,
    lote_nome: "Lote 1 — Ovejas",
    data_inicio: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    data_fim: null,
    notas: "Pasta principal durante o inverno",
    created_at: nowIso(),
    updated_at: nowIso(),
  },
  {
    id: 2,
    parcela_id: 2,
    lote_nome: "Lote 2 — Xatas",
    data_inicio: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21).toISOString(),
    data_fim: null,
    notas: "Xatas novas en pasteiro de primavera",
    created_at: nowIso(),
    updated_at: nowIso(),
  },
  {
    id: 3,
    parcela_id: 3,
    lote_nome: "Lote 1 — Ovejas",
    data_inicio: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    data_fim: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    notas: "Rotación previa antes de pasar á parcela 1",
    created_at: nowIso(),
    updated_at: nowIso(),
  },
];

const sheepStore: Sheep[] = [...seedSheep];
const rotationStore: Rotation[] = [...seedRotations];
nextId = 100;

function delay(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function matchId(path: string, prefix: string): number | null {
  const rest = path.slice(prefix.length).replace(/\/$/, "");
  const num = Number(rest);
  return Number.isFinite(num) && num > 0 ? num : null;
}

export function installApiMocks(api: AxiosInstance) {
  api.interceptors.request.use(async (config) => {
    await delay();
    return config;
  });

  api.interceptors.response.use(async (response) => {
    const { method } = response.config;
    const url = (response.config.url ?? "").split("?")[0];

    if (url === "/sheep/" || url === "/sheep") {
      if (method === "get") {
        response.data = [...sheepStore].sort((a, b) => a.id - b.id);
      } else if (method === "post") {
        const body = response.config.data ? JSON.parse(response.config.data) : {};
        const created: Sheep = makeDates({
          id: ++nextId,
          crotal: body.crotal ?? "",
          nome: body.nome ?? null,
          sexo: body.sexo ?? "femia",
          data_nacemento: body.data_nacemento ?? nowIso().slice(0, 10),
          raca: body.raca ?? "Gallega",
          estado: body.estado ?? "activo",
          nai_id: body.nai_id ?? null,
          pai_id: body.pai_id ?? null,
          parcela_actual_id: body.parcela_actual_id ?? null,
          notas: body.notas ?? null,
        }) as Sheep;
        sheepStore.push(created);
        response.data = created;
      }
    } else {
      const id = matchId(url, "/sheep/");
      if (id != null) {
        const idx = sheepStore.findIndex((s) => s.id === id);
        if (method === "get") {
          response.data = idx >= 0 ? sheepStore[idx] : null;
        } else if (method === "patch" || method === "put") {
          if (idx >= 0) {
            const body = response.config.data ? JSON.parse(response.config.data) : {};
            const updated: Sheep = {
              ...sheepStore[idx],
              ...body,
              id: sheepStore[idx].id,
              updated_at: nowIso(),
            };
            sheepStore[idx] = updated;
            response.data = updated;
          }
        } else if (method === "delete") {
          if (idx >= 0) sheepStore.splice(idx, 1);
          response.data = null;
        }
      }
    }

    if (url === "/rotations/" || url === "/rotations") {
      if (method === "get") {
        response.data = [...rotationStore].sort(
          (a, b) => Date.parse(b.data_inicio) - Date.parse(a.data_inicio)
        );
      } else if (method === "post") {
        const body = response.config.data ? JSON.parse(response.config.data) : {};
        const created: Rotation = makeDates({
          id: ++nextId,
          parcela_id: body.parcela_id ?? 0,
          lote_nome: body.lote_nome ?? "",
          data_inicio: body.data_inicio ?? nowIso(),
          data_fim: body.data_fim ?? null,
          notas: body.notas ?? null,
        }) as Rotation;
        rotationStore.push(created);
        response.data = created;
      }
    } else {
      const id = matchId(url, "/rotations/");
      if (id != null) {
        const idx = rotationStore.findIndex((r) => r.id === id);
        if (method === "get") {
          response.data = idx >= 0 ? rotationStore[idx] : null;
        } else if (method === "patch" || method === "put") {
          if (idx >= 0) {
            const body = response.config.data ? JSON.parse(response.config.data) : {};
            const updated: Rotation = {
              ...rotationStore[idx],
              ...body,
              id: rotationStore[idx].id,
              updated_at: nowIso(),
            };
            rotationStore[idx] = updated;
            response.data = updated;
          }
        } else if (method === "delete") {
          if (idx >= 0) rotationStore.splice(idx, 1);
          response.data = null;
        }
      }
    }

    return response;
  });
}

export type { SheepCreate, SheepUpdate, RotationCreate, RotationUpdate };