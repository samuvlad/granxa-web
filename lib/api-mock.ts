import type { AxiosInstance } from "axios";

import type {
  Lote,
  LoteCreate,
  LoteUpdate,
  Rotation,
  RotationCreate,
  RotationUpdate,
  Sheep,
  SheepCreate,
  SheepUpdate,
} from "@/types";

let nextId = 1000;
let nextLoteId = 100;
let nextRotationId = 200;

const nowIso = () => new Date().toISOString();

function makeDates<T extends object>(obj: T): T & { created_at: string; updated_at: string } {
  return {
    ...obj,
    created_at: nowIso(),
    updated_at: nowIso(),
  };
}

const seedLotes: Lote[] = [
  makeDates({
    id: 1,
    name: "Lote 1 — Ovejas adultas",
    notas: "Ovejas adultas en produción",
  }) as Lote,
  makeDates({
    id: 2,
    name: "Lote 2 — Xatas",
    notas: "Xatas novas en pastoreo de primavera",
  }) as Lote,
  makeDates({
    id: 3,
    name: "Lote 3 — Machos reprodutores",
    notas: "Machos para monta",
  }) as Lote,
];

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
    lote_id: 1,
    parcela_actual_id: 1,
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
    lote_id: 1,
    parcela_actual_id: 1,
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
    lote_id: 3,
    parcela_actual_id: 2,
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
    lote_id: 2,
    parcela_actual_id: 2,
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
    lote_id: 1,
    parcela_actual_id: 1,
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
    lote_id: null,
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
    lote_id: 2,
    parcela_actual_id: 2,
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
    lote_id: null,
    parcela_actual_id: null,
    notas: null,
    created_at: nowIso(),
    updated_at: nowIso(),
  },
];

const seedRotations: Rotation[] = [
  {
    id: 1,
    lote_id: 1,
    parcela_id: 1,
    data_inicio: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    data_fim: null,
    notas: "Pasta principal durante o inverno",
    created_at: nowIso(),
    updated_at: nowIso(),
  },
  {
    id: 2,
    lote_id: 2,
    parcela_id: 2,
    data_inicio: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21).toISOString(),
    data_fim: null,
    notas: "Xatas novas en pasteiro de primavera",
    created_at: nowIso(),
    updated_at: nowIso(),
  },
  {
    id: 3,
    lote_id: 1,
    parcela_id: 3,
    data_inicio: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    data_fim: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    notas: "Rotación previa antes de pasar á parcela 1",
    created_at: nowIso(),
    updated_at: nowIso(),
  },
];

const sheepStore: Sheep[] = [...seedSheep];
const loteStore: Lote[] = [...seedLotes];
const rotationStore: Rotation[] = [...seedRotations];
nextId = 100;
nextLoteId = 100;
nextRotationId = 100;

function delay(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function matchId(path: string, prefix: string): number | null {
  const rest = path.slice(prefix.length).replace(/\/$/, "");
  const num = Number(rest);
  return Number.isFinite(num) && num > 0 ? num : null;
}

function activeRotationForLote(loteId: number): Rotation | null {
  return (
    rotationStore.find((r) => r.lote_id === loteId && !r.data_fim) ?? null
  );
}

function recalcParcelaActualForLote(loteId: number | null) {
  if (loteId == null) return;
  const active = activeRotationForLote(loteId);
  const newParcelaId = active ? active.parcela_id : null;
  sheepStore.forEach((s) => {
    if (s.lote_id === loteId && s.parcela_actual_id !== newParcelaId) {
      sheepStore[sheepStore.indexOf(s)] = {
        ...s,
        parcela_actual_id: newParcelaId,
        updated_at: nowIso(),
      };
    }
  });
}

export function installApiMocks(api: AxiosInstance) {
  api.interceptors.request.use(async (config) => {
    await delay();
    return config;
  });

  api.interceptors.response.use(async (response) => {
    const { method } = response.config;
    const url = (response.config.url ?? "").split("?")[0];

    if (url === "/lotes/" || url === "/lotes") {
      if (method === "get") {
        response.data = [...loteStore].sort((a, b) => a.id - b.id);
      } else if (method === "post") {
        const body = response.config.data ? JSON.parse(response.config.data) : {};
        const created: Lote = makeDates({
          id: ++nextLoteId,
          name: body.name ?? "",
          notas: body.notas ?? null,
        }) as Lote;
        loteStore.push(created);
        response.data = created;
      }
    } else {
      const id = matchId(url, "/lotes/");
      if (id != null) {
        const idx = loteStore.findIndex((l) => l.id === id);
        if (method === "get") {
          response.data = idx >= 0 ? loteStore[idx] : null;
        } else if (method === "patch" || method === "put") {
          if (idx >= 0) {
            const body = response.config.data ? JSON.parse(response.config.data) : {};
            const updated: Lote = {
              ...loteStore[idx],
              ...body,
              id: loteStore[idx].id,
              updated_at: nowIso(),
            };
            loteStore[idx] = updated;
            response.data = updated;
          }
        } else if (method === "delete") {
          if (idx >= 0) {
            const inUse =
              sheepStore.some((s) => s.lote_id === id) ||
              rotationStore.some((r) => r.lote_id === id);
            if (inUse) {
              response.status = 409;
              response.data = {
                detail: "O lote ten ovellas ou rotacións asociadas",
              };
            } else {
              loteStore.splice(idx, 1);
              response.data = null;
            }
          }
        }
      }
    }

    if (url === "/sheep/" || url === "/sheep") {
      if (method === "get") {
        response.data = [...sheepStore].sort((a, b) => a.id - b.id);
      } else if (method === "post") {
        const body = response.config.data ? JSON.parse(response.config.data) : {};
        const loteId = body.lote_id ?? null;
        const active = loteId != null ? activeRotationForLote(loteId) : null;
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
          lote_id: loteId,
          parcela_actual_id: active ? active.parcela_id : null,
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
            const previousLoteId = sheepStore[idx].lote_id;
            const nextLoteId =
              body.lote_id !== undefined ? body.lote_id : previousLoteId;
            const active =
              nextLoteId != null ? activeRotationForLote(nextLoteId) : null;
            const updated: Sheep = {
              ...sheepStore[idx],
              ...body,
              id: sheepStore[idx].id,
              lote_id: nextLoteId,
              parcela_actual_id: active ? active.parcela_id : null,
              updated_at: nowIso(),
            };
            sheepStore[idx] = updated;
            if (previousLoteId !== nextLoteId) {
              recalcParcelaActualForLote(previousLoteId);
            }
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
        const loteId = body.lote_id;
        const dataInicio = body.data_inicio ?? nowIso();
        const dataFim = body.data_fim ?? null;
        const created: Rotation = makeDates({
          id: ++nextRotationId,
          lote_id: loteId,
          parcela_id: body.parcela_id ?? 0,
          data_inicio: dataInicio,
          data_fim: dataFim,
          notas: body.notas ?? null,
        }) as Rotation;
        rotationStore.push(created);
        if (!dataFim) {
          recalcParcelaActualForLote(loteId);
        }
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
            const previousDataFim = rotationStore[idx].data_fim;
            const updated: Rotation = {
              ...rotationStore[idx],
              ...body,
              id: rotationStore[idx].id,
              updated_at: nowIso(),
            };
            rotationStore[idx] = updated;
            if (
              body.data_fim !== undefined &&
              previousDataFim === null &&
              updated.data_fim !== null
            ) {
              recalcParcelaActualForLote(updated.lote_id);
            }
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

export type { LoteCreate, LoteUpdate, SheepCreate, SheepUpdate, RotationCreate, RotationUpdate };
