"use client";

import { useEffect, useRef, useState } from "react";
import type * as L from "leaflet";
import {
  useCreatePlot,
  useDeletePlot,
  usePlots,
  useUpdatePlot,
} from "@/lib/queries";
import { getApiErrorMessage } from "@/lib/api";
import type { Plot } from "@/types";
import type { useMapDraft } from "@/app/(app)/parcelas/_hooks/use-map-draft";

type LeafletNS = typeof import("leaflet");

interface PmLayerEdit {
  enabled?: () => boolean;
  disable: () => void;
  enable: (opts?: {
    snappable?: boolean;
    snapDistance?: number;
    allowSelfIntersection?: boolean;
    draggable?: boolean;
  }) => void;
}

interface EditableLayer extends L.Layer {
  _plotId?: number;
  pm?: PmLayerEdit;
  toGeoJSON: () => GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>;
  setStyle?: (style: L.PathOptions) => void;
  getBounds?: () => L.LatLngBounds;
}

interface MapCallbacks {
  onSelectPlot: (id: number | null) => void;
  onCompleteCreate: () => void;
  createPlot: ReturnType<typeof useCreatePlot>;
  updatePlot: ReturnType<typeof useUpdatePlot>;
  deletePlot: ReturnType<typeof useDeletePlot>;
}

interface MapViewProps {
  selectedPlotId: number | null;
  onSelectPlot: (id: number | null) => void;
  editingPlotId: number | null;
  onEditingChange: (id: number | null) => void;
  isCreatingNew: boolean;
  onStartCreate: () => void;
  onCancelCreate: () => void;
  onCompleteCreate: () => void;
  draft: ReturnType<typeof useMapDraft>;
}

const TRANSLATIONS: L.PM.Translations = {
  tooltips: {
    placeMarker: "Fai clic para colocar un marcador",
    firstVertex: "Fai clic para colocar o primeiro vértice",
    continueLine: "Fai clic para continuar debuxando",
    finishLine: "Fai clic nun vértice existente para rematar",
    finishPoly: "Fai clic no primeiro vértice para rematar",
    finishRect: "Fai clic para rematar o rectángulo",
    startCircle: "Fai clic para colocar o centro do círculo",
    finishCircle: "Fai clic para rematar o círculo",
  },
  actions: {
    finish: "Rematar",
    cancel: "Cancelar",
    removeLastVertex: "Eliminar último vértice",
  },
  buttonTitles: {
    drawPolyButton: "Debuxar polígono",
    editButton: "Editar capas",
    dragButton: "Mover capas",
    deleteButton: "Eliminar capas",
  },
};

const TILE_LAYERS = {
  osm: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contribuidores',
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  },
} as const;

export function MapView({
  selectedPlotId,
  onSelectPlot,
  editingPlotId,
  onEditingChange,
  isCreatingNew,
  onStartCreate,
  onCancelCreate,
  onCompleteCreate,
  draft,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const LRef = useRef<LeafletNS | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const { data: plots = [], isLoading } = usePlots();
  const createPlot = useCreatePlot();
  const updatePlot = useUpdatePlot();
  const deletePlot = useDeletePlot();

  // Mantemos un ref sempre actualizado dos callbacks máis recentes para
  // que o effect de inicialización (que só corre unha vez) poida utilizalos
  // sen volverse a subscribir a eventos de Leaflet.
  const callbacksRef = useRef<MapCallbacks>({
    onSelectPlot,
    onCompleteCreate,
    createPlot,
    updatePlot,
    deletePlot,
  });
  useEffect(() => {
    callbacksRef.current = {
      onSelectPlot,
      onCompleteCreate,
      createPlot,
      updatePlot,
      deletePlot,
    };
  });

  // O mesmo patrón aplícase ao `draft`: o effect de inicialización do mapa
  // corre unha vez, pero o handler de `pm:create` necesita o valor máis recente.
  const draftRef = useRef(draft);
  useEffect(() => {
    draftRef.current = draft;
  });

  useEffect(() => {
    const mapEl = mapRef.current;
    if (!mapEl) return;

    let cancelled = false;

    async function initMap() {
      const L = await import("leaflet");
      await import("@geoman-io/leaflet-geoman-free");
      if (cancelled || !mapRef.current) return;

      LRef.current = L;

      const map = L.map(mapRef.current).setView([42.8, -8.0], 8);
      mapInstanceRef.current = map;

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            mapInstanceRef.current?.setView([latitude, longitude], 19);
          },
          undefined,
          { enableHighAccuracy: true, timeout: 10000 }
        );
      }

      const osm = L.tileLayer(TILE_LAYERS.osm.url, {
        attribution: TILE_LAYERS.osm.attribution,
        maxZoom: 19,
      });
      const satellite = L.tileLayer(TILE_LAYERS.satellite.url, {
        attribution: TILE_LAYERS.satellite.attribution,
        maxZoom: 19,
      });

      osm.addTo(map);
      L.control.layers(
        { Mapa: osm, Satélite: satellite },
        {},
        { position: "topright", collapsed: true }
      ).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;

      map.pm.addControls({
        position: "topright",
        drawMarker: false,
        drawCircleMarker: false,
        drawPolyline: false,
        drawRectangle: false,
        drawCircle: false,
        drawPolygon: false,
        drawText: false,
        editMode: false,
        dragMode: false,
        removalMode: false,
        rotateMode: false,
        cutPolygon: false,
      });

      map.pm.setLang("es", TRANSLATIONS, "en");

      map.on("pm:create", (e: { shape: string; layer: L.Layer }) => {
        if (e.shape !== "Polygon") return;
        const layer = e.layer as EditableLayer;
        const currentDraft = draftRef.current;
        const trimmedName = currentDraft.name.trim();
        if (!trimmedName) {
          setCreateError("O nome da parcela é obrigatorio antes de gardala.");
          map.removeLayer(layer);
          return;
        }
        const geojson = layer.toGeoJSON();
        setCreateError(null);
        callbacksRef.current.createPlot.mutate(
          {
            name: trimmedName,
            color: currentDraft.color,
            notes: currentDraft.notes.trim() || null,
            geometry: geojson.geometry,
          },
          {
            onSuccess: (newPlot) => {
              callbacksRef.current.onCompleteCreate();
              callbacksRef.current.onSelectPlot(newPlot.id);
            },
            onError: (err) => {
              setCreateError(getApiErrorMessage(err, "Non se puido gardar a parcela"));
            },
          }
        );
        layerGroup.removeLayer(layer);
      });

      map.on("pm:remove", (e: { layer: L.Layer }) => {
        const plotId = (e.layer as EditableLayer)._plotId;
        if (plotId) {
          callbacksRef.current.deletePlot.mutate(plotId, {
            onError: (err) =>
              setCreateError(
                getApiErrorMessage(err, "Non se puido eliminar a parcela")
              ),
          });
        }
      });

      setIsReady(true);
      setTimeout(() => mapInstanceRef.current?.invalidateSize(), 100);
    }

    initMap();

    return () => {
      cancelled = true;
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      layerGroupRef.current = null;
      LRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isReady || !layerGroupRef.current || !LRef.current) return;
    syncLayers(LRef.current, layerGroupRef.current, plots, callbacksRef);
  }, [plots, isReady]);

  useEffect(() => {
    if (!mapInstanceRef.current || selectedPlotId == null) return;
    const plot = plots.find((p) => p.id === selectedPlotId);
    if (!plot) return;
    const layer = findLayerByPlotId(
      layerGroupRef.current,
      selectedPlotId
    );
    if (layer?.getBounds) {
      mapInstanceRef.current.fitBounds(layer.getBounds(), {
        padding: [40, 40],
        maxZoom: 19,
      });
    }
  }, [selectedPlotId, plots]);

  useEffect(() => {
    if (!isReady || !layerGroupRef.current) return;
    const layerGroup = layerGroupRef.current;
    layerGroup.eachLayer((layer) => {
      const editable = layer as EditableLayer;
      if (editable.pm?.enabled?.()) editable.pm.disable();
    });
    if (editingPlotId) {
      const layer = findLayerByPlotId(layerGroup, editingPlotId);
      if (layer?.pm) {
        layer.pm.enable({
          snappable: true,
          snapDistance: 20,
          allowSelfIntersection: false,
          draggable: true,
        });
      } else {
        onEditingChange(null);
      }
    }
  }, [editingPlotId, plots, isReady, onEditingChange]);

  const handleStartDraw = () => {
    if (!mapInstanceRef.current) return;
    setCreateError(null);
    onStartCreate();
    mapInstanceRef.current.pm.enableDraw("Polygon", {
      snappable: true,
      snapDistance: 20,
    });
  };

  const handleCancelDraw = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.pm.disableDraw();
    setCreateError(null);
    onCancelCreate();
  };

  const drawButton = isCreatingNew ? (
    <button
      onClick={handleCancelDraw}
      disabled={!isReady}
      className="px-3 py-2 bg-background text-foreground border border-border rounded-md shadow hover:bg-muted disabled:opacity-50 text-sm font-medium"
    >
      Cancelar debuxo
    </button>
  ) : (
    <button
      onClick={handleStartDraw}
      disabled={!isReady || createPlot.isPending || !!editingPlotId}
      className="px-3 py-2 bg-primary text-primary-foreground rounded-md shadow hover:bg-primary/90 disabled:opacity-50 text-sm font-medium"
    >
      Nova parcela
    </button>
  );

  return (
    <div className="relative h-full w-full bg-blue-100">
      {!isReady && (
        <div className="absolute inset-0 z-[1001] bg-muted flex items-center justify-center">
          <p className="text-muted-foreground">Cargando mapa...</p>
        </div>
      )}
      <div
        ref={mapRef}
        className="absolute inset-0 z-[1]"
        style={{ width: "100%", height: "100%", minHeight: "100%" }}
      />

      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2 items-start">
        {drawButton}
        {isCreatingNew && (
          <div className="bg-background/95 border border-primary/30 rounded-md shadow px-3 py-2 text-xs max-w-xs">
            <p className="font-medium text-foreground mb-0.5">
              Debuxando nova parcela
            </p>
            <p className="text-muted-foreground">
              Fai clic no mapa para colocar os vértices e fai clic no primeiro
              vértice (ou preme Enter) para pechar o polígono.
            </p>
          </div>
        )}
        {createError && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-md shadow px-3 py-2 text-xs max-w-xs">
            {createError}
          </div>
        )}
        {createPlot.isPending && (
          <div className="bg-background/95 border border-border rounded-md shadow px-3 py-1.5 text-xs text-muted-foreground">
            Gardando parcela...
          </div>
        )}
      </div>

      {isLoading && (
        <div className="absolute bottom-4 right-4 z-[1000] bg-background/90 px-3 py-1.5 rounded-md shadow text-sm">
          Cargando parcelas...
        </div>
      )}
    </div>
  );
}

function findLayerByPlotId(
  group: L.LayerGroup | null,
  plotId: number
): EditableLayer | undefined {
  return group
    ?.getLayers()
    .find((l) => (l as EditableLayer)._plotId === plotId) as
    | EditableLayer
    | undefined;
}

function syncLayers(
  L: LeafletNS,
  group: L.LayerGroup,
  plots: Plot[],
  callbacksRef: React.RefObject<MapCallbacks>
) {
  const existing = new Map<number, EditableLayer>();
  group.eachLayer((layer) => {
    const editable = layer as EditableLayer;
    if (editable._plotId != null) existing.set(editable._plotId, editable);
  });

  const newIds = new Set(plots.map((p) => p.id));
  existing.forEach((layer, id) => {
    if (!newIds.has(id)) group.removeLayer(layer);
  });

  plots.forEach((plot) => {
    const prev = existing.get(plot.id);
    if (prev?.setStyle) {
      prev.setStyle({ color: plot.color, fillColor: plot.color });
      return;
    }
    const geoJsonLayer = L.geoJSON(plot.geometry, {
      style: {
        color: plot.color,
        fillColor: plot.color,
        fillOpacity: 0.25,
        weight: 3,
      },
      pmIgnore: false,
    });
    const layer = geoJsonLayer.getLayers()[0] as EditableLayer | undefined;
    if (!layer) return;
    layer._plotId = plot.id;
    layer.on("click", (e: L.LeafletMouseEvent) => {
      L.DomEvent.stopPropagation(e);
      callbacksRef.current?.onSelectPlot(plot.id);
    });
    layer.on("pm:edit", () => {
      const geojson = layer.toGeoJSON();
      callbacksRef.current?.updatePlot.mutate({
        id: plot.id,
        plot: { geometry: geojson.geometry },
      });
    });
    layer.on("pm:dragend", () => {
      const geojson = layer.toGeoJSON();
      callbacksRef.current?.updatePlot.mutate({
        id: plot.id,
        plot: { geometry: geojson.geometry },
      });
    });
    group.addLayer(layer);
  });
}
