export interface Plot {
  id: number;
  name: string;
  color: string;
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  area_m2: number | null;
  perimeter_m: number | null;
  cadastral_ref: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlotCreate {
  name: string;
  color: string;
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  cadastral_ref?: string | null;
  notes?: string | null;
}

export interface PlotUpdate {
  name?: string;
  color?: string;
  geometry?: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  cadastral_ref?: string | null;
  notes?: string | null;
}

export type Sexo = "macho" | "femia";
export type EstadoAnimal = "activo" | "vendido" | "morto";

export interface Sheep {
  id: number;
  crotal: string;
  nome: string | null;
  sexo: Sexo;
  data_nacemento: string;
  raca: string;
  estado: EstadoAnimal;
  nai_id: number | null;
  pai_id: number | null;
  parcela_actual_id: number | null;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export type SheepCreate = Omit<Sheep, "id" | "created_at" | "updated_at">;
export type SheepUpdate = Partial<SheepCreate>;

export interface Rotation {
  id: number;
  parcela_id: number;
  lote_nome: string;
  data_inicio: string;
  data_fim: string | null;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export type RotationCreate = Omit<Rotation, "id" | "created_at" | "updated_at">;
export type RotationUpdate = Partial<RotationCreate>;