"use client";

import { useEffect, useRef, useState } from "react";
import { usePlots, useCreatePlot, useUpdatePlot, useDeletePlot } from "@/lib/queries";
import { Plot, PlotUpdate } from "@/types";

interface MapViewProps {
  selectedPlotId: number | null;
  onSelectPlot: (id: number | null) => void;
  editingPlotId: number | null;
  onEditingChange: (id: number | null) => void;
  isCreatingNew: boolean;
  onStartCreate: () => void;
  onCancelCreate: () => void;
  draftName: string;
  draftColor: string;
  draftNotes: string;
}

export function MapView({
  selectedPlotId,
  onSelectPlot,
  editingPlotId,
  onEditingChange,
  isCreatingNew,
  onStartCreate,
  onCancelCreate,
  draftName,
  draftColor,
  draftNotes,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);
  const LRef = useRef<any>(null);

  const [isReady, setIsReady] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const { data: plots = [], isLoading } = usePlots();
  const createPlot = useCreatePlot();
  const updatePlot = useUpdatePlot();
  const deletePlot = useDeletePlot();

  // Inicializar mapa
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapRef.current) return;

      console.log("[MapView] Inicializando mapa...");
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

      // Configurar Geoman
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

      const translations: any = {
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
      map.pm.setLang("gl" as any, translations, "en" as any);

      // Evento: crear polígono
      map.on("pm:create", (e: any) => {
        if (e.shape !== "Polygon") return;

        const layer = e.layer;
        const geojson = layer.toGeoJSON();

        createPlot.mutate(
          {
            name: draftName,
            color: draftColor,
            notes: draftNotes || null,
            geometry: geojson.geometry as GeoJSON.Polygon,
          },
          {
            onSuccess: (newPlot) => {
              onCancelCreate();
              onSelectPlot(newPlot.id);
            },
          }
        );

        // Eliminar a capa temporal de Geoman, recargaremos dende o servidor
        layerGroup.removeLayer(layer);
      });

      // Evento: editar polígono
      map.on("pm:edit", (e: any) => {
        const layer = e.layer;
        const plotId = layer._plotId;
        if (!plotId) return;

        const geojson = layer.toGeoJSON();
        updatePlot.mutate({
          id: plotId,
          plot: {
            geometry: geojson.geometry as GeoJSON.Polygon,
          },
        });
      });

      // Evento: arrastrar polígono
      map.on("pm:dragend", (e: any) => {
        const layer = e.layer;
        const plotId = layer._plotId;
        if (!plotId) return;

        const geojson = layer.toGeoJSON();
        updatePlot.mutate({
          id: plotId,
          plot: {
            geometry: geojson.geometry as GeoJSON.Polygon,
          },
        });
      });

      // Evento: eliminar polígono dende Geoman
      map.on("pm:remove", (e: any) => {
        const plotId = e.layer._plotId;
        if (plotId) {
          deletePlot.mutate(plotId);
        }
      });

      setIsReady(true);

      // Asegurar que Leaflet recalcula o tamaño do contedor
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
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

  // Renderizar parcelas cando cambian (diff: conserva capas e estado pm)
  useEffect(() => {
    if (!isReady || !layerGroupRef.current || !LRef.current) return;

    const L = LRef.current;
    const layerGroup = layerGroupRef.current;

    const existing = new Map<number, any>();
    layerGroup.eachLayer((layer: any) => {
      if (layer._plotId != null) existing.set(layer._plotId, layer);
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

      const layer = geoJsonLayer.getLayers()[0];
      if (!layer) return;

      layer._plotId = plot.id;

      layer.on("click", (e: any) => {
        L.DomEvent.stopPropagation(e);
        onSelectPlot(plot.id);
      });

      layer.on("pm:edit", () => {
        const geojson = layer.toGeoJSON();
        updatePlot.mutate({
          id: plot.id,
          plot: { geometry: geojson.geometry as GeoJSON.Polygon },
        });
      });

      layer.on("pm:dragend", () => {
        const geojson = layer.toGeoJSON();
        updatePlot.mutate({
          id: plot.id,
          plot: { geometry: geojson.geometry as GeoJSON.Polygon },
        });
      });

      layerGroup.addLayer(layer);
    });
  }, [plots, isReady]);

  // Zoom a parcela seleccionada
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedPlotId) return;
    const plot = plots.find((p) => p.id === selectedPlotId);
    if (!plot) return;

    const layer = layerGroupRef.current
      .getLayers()
      .find((l: any) => l._plotId === selectedPlotId);

    if (layer && layer.getBounds) {
      mapInstanceRef.current.fitBounds(layer.getBounds(), {
        padding: [40, 40],
        maxZoom: 19,
      });
    }
  }, [selectedPlotId, plots]);

  // Activar/desactivar edición só na capa correspondente
  useEffect(() => {
    if (!isReady || !layerGroupRef.current) return;
    const layerGroup = layerGroupRef.current;

    layerGroup.eachLayer((layer: any) => {
      if (layer.pm && layer.pm.enabled?.()) {
        layer.pm.disable();
      }
    });

    if (editingPlotId) {
      const layer = layerGroup
        .getLayers()
        .find((l: any) => l._plotId === editingPlotId);
      if (layer && layer.pm) {
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
    onStartCreate();
    mapInstanceRef.current.pm.enableDraw("Polygon", {
      snappable: true,
      snapDistance: 20,
    });
    setIsDrawing(true);
  };

  const handleCancelDraw = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.pm.disableDraw();
    setIsDrawing(false);
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

      <div className="absolute top-4 left-4 z-[1000] flex gap-2">
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
      </div>

      {isLoading && (
        <div className="absolute bottom-4 right-4 z-[1000] bg-background/90 px-3 py-1.5 rounded-md shadow text-sm">
          Cargando parcelas...
        </div>
      )}
    </div>
  );
}
