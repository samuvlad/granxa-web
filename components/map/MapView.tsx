"use client";

import { useEffect, useRef, useState } from "react";
import type * as L from "leaflet";
import { usePlots, useCreatePlot, useUpdatePlot, useDeletePlot } from "@/lib/queries";
import { getApiErrorMessage } from "@/lib/api";

type LeafletNS = typeof import("leaflet");
type PmShape = L.PM.SUPPORTED_SHAPES;

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
  draftName: string;
  draftColor: string;
  draftNotes: string;
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

export function MapView({
  selectedPlotId,
  onSelectPlot,
  editingPlotId,
  onEditingChange,
  isCreatingNew,
  onStartCreate,
  onCancelCreate,
  onCompleteCreate,
  draftName,
  draftColor,
  draftNotes,
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

  const draftRef = useRef({ name: draftName, color: draftColor, notes: draftNotes });
  useEffect(() => {
    draftRef.current = { name: draftName, color: draftColor, notes: draftNotes };
  }, [draftName, draftColor, draftNotes]);

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

  useEffect(() => {
    let isMounted = true;
    const mapEl = mapRef.current;
    if (!mapEl) return;

    async function initMap() {
      const L = await import("leaflet");
      await import("@geoman-io/leaflet-geoman-free");
      if (!isMounted || !mapRef.current) {
        console.log("[MapView] Componente desmontado antes de inicializar");
        return;
      }
      console.log("[MapView] Leaflet e Geoman cargados");

      LRef.current = L;

      const map = L.map(mapRef.current).setView([42.8, -8.0], 8);
      mapInstanceRef.current = map;

      const recenterOnUser = () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            mapInstanceRef.current?.setView([latitude, longitude], 19);
          },
          (err) => {
            console.warn("[MapView] Geolocation non dispoñible:", err.message);
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      };

      recenterOnUser();

      const osm = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contribuidores',
          maxZoom: 19,
        }
      );

      const satellite = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
          maxZoom: 19,
        }
      );

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

      // Geoman non inclúe "gl" (galego) nas súas localizacións integradas.
      // Usamos "es" como base (lingua máis próxima) e sobreescribimos
      // as cadeas con traducións propias ao galego.
      map.pm.setLang("es", TRANSLATIONS, "en");

      const onCreate = (e: { shape: PmShape; layer: L.Layer }) => {
        if (e.shape !== "Polygon") return;

        const layer = e.layer as EditableLayer;
        const draft = draftRef.current;
        const trimmedName = (draft.name || "").trim();

        if (!trimmedName) {
          setCreateError("O nome da parcela é obrigatorio antes de gardala.");
          mapInstanceRef.current?.removeLayer(layer);
          return;
        }

        const geojson = layer.toGeoJSON();

        setCreateError(null);
        callbacksRef.current.createPlot.mutate(
          {
            name: trimmedName,
            color: draft.color,
            notes: (draft.notes || "").trim() || null,
            geometry: geojson.geometry as GeoJSON.Polygon,
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
      };

      const onEdit = (e: { layer: L.Layer }) => {
        const layer = e.layer as EditableLayer;
        const plotId = layer._plotId;
        if (!plotId) return;

        const geojson = layer.toGeoJSON();
        callbacksRef.current.updatePlot.mutate({
          id: plotId,
          plot: { geometry: geojson.geometry as GeoJSON.Polygon },
        });
      };

      const onDragEnd = (e: { layer: L.Layer }) => {
        const layer = e.layer as EditableLayer;
        const plotId = layer._plotId;
        if (!plotId) return;

        const geojson = layer.toGeoJSON();
        callbacksRef.current.updatePlot.mutate({
          id: plotId,
          plot: { geometry: geojson.geometry as GeoJSON.Polygon },
        });
      };

      const onRemove = (e: { layer: L.Layer }) => {
        const layer = e.layer as EditableLayer;
        const plotId = layer._plotId;
        if (plotId) {
          callbacksRef.current.deletePlot.mutate(plotId);
        }
      };

      map.on("pm:create", onCreate);
      map.on("pm:edit", onEdit);
      map.on("pm:dragend", onDragEnd);
      map.on("pm:remove", onRemove);

      setIsReady(true);

      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 100);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        layerGroupRef.current = null;
        LRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isReady || !layerGroupRef.current || !LRef.current) return;

    const L = LRef.current;
    const layerGroup = layerGroupRef.current;

    const existing = new Map<number, EditableLayer>();
    layerGroup.eachLayer((layer) => {
      const editable = layer as EditableLayer;
      if (editable._plotId != null) existing.set(editable._plotId, editable);
    });

    const newIds = new Set(plots.map((p) => p.id));
    existing.forEach((layer, id) => {
      if (!newIds.has(id)) layerGroup.removeLayer(layer);
    });

    plots.forEach((plot) => {
      const prev = existing.get(plot.id);
      if (prev && typeof prev.setStyle === "function") {
        prev.setStyle({
          color: plot.color,
          fillColor: plot.color,
        });
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
        callbacksRef.current.onSelectPlot(plot.id);
      });

      layer.on("pm:edit", () => {
        const geojson = layer.toGeoJSON();
        callbacksRef.current.updatePlot.mutate({
          id: plot.id,
          plot: { geometry: geojson.geometry as GeoJSON.Polygon },
        });
      });

      layer.on("pm:dragend", () => {
        const geojson = layer.toGeoJSON();
        callbacksRef.current.updatePlot.mutate({
          id: plot.id,
          plot: { geometry: geojson.geometry as GeoJSON.Polygon },
        });
      });

      layerGroup.addLayer(layer);
    });
  }, [plots, isReady]);

  useEffect(() => {
    if (!mapInstanceRef.current || !selectedPlotId) return;
    const plot = plots.find((p) => p.id === selectedPlotId);
    if (!plot) return;

    const layer = layerGroupRef.current
      ?.getLayers()
      .find((l) => (l as EditableLayer)._plotId === selectedPlotId) as
      | EditableLayer
      | undefined;

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
      if (editable.pm?.enabled?.()) {
        editable.pm.disable();
      }
    });

    if (editingPlotId) {
      const layer = layerGroup
        .getLayers()
        .find((l) => (l as EditableLayer)._plotId === editingPlotId) as
        | EditableLayer
        | undefined;
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
        {isCreatingNew ? (
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
        )}
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
