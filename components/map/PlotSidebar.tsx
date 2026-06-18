"use client";

import { useEffect, useState } from "react";
import { usePlots, useUpdatePlot, useDeletePlot } from "@/lib/queries";

interface PlotSidebarProps {
  selectedPlotId: number | null;
  onSelectPlot: (id: number | null) => void;
  editingPlotId: number | null;
  onEditingChange: (id: number | null) => void;
  isCreatingNew: boolean;
}

export function PlotSidebar({
  selectedPlotId,
  onSelectPlot,
  editingPlotId,
  onEditingChange,
  isCreatingNew,
}: PlotSidebarProps) {
  const { data: plots = [], isLoading } = usePlots();
  const updatePlot = useUpdatePlot();
  const deletePlot = useDeletePlot();

  const selectedPlot = plots.find((p) => p.id === selectedPlotId);
  const sortedPlots = [...plots].sort((a, b) => a.id - b.id);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3388ff");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isCreatingNew) return;
    if (selectedPlot) {
      setName(selectedPlot.name);
      setColor(selectedPlot.color);
      setNotes(selectedPlot.notes || "");
    } else {
      setName("");
      setColor("#3388ff");
      setNotes("");
    }
  }, [selectedPlot, isCreatingNew]);

  const handleSelect = (id: number) => {
    onSelectPlot(id);
  };

  const handleClear = () => {
    onSelectPlot(null);
  };

  const handleSave = () => {
    if (!selectedPlotId) return;
    updatePlot.mutate({
      id: selectedPlotId,
      plot: { name, color, notes: notes || null },
    });
    if (editingPlotId === selectedPlotId) {
      onEditingChange(null);
    }
  };

  const handleDelete = () => {
    if (!selectedPlotId) return;
    if (!confirm("Eliminar a parcela seleccionada?")) return;
    deletePlot.mutate(selectedPlotId);
    handleClear();
  };

  const handleToggleEdit = () => {
    if (!selectedPlotId) return;
    onEditingChange(editingPlotId === selectedPlotId ? null : selectedPlotId);
  };

  return (
    <aside className="w-80 min-w-80 bg-background border-r border-border flex flex-col h-full overflow-hidden">
      <header className="p-4 border-b border-border bg-muted/30">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Detalles da parcela
        </h2>
      </header>

      <section className="p-4 border-b border-border">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          {selectedPlot ? "Editar" : "Información"}
        </h3>
        {isCreatingNew ? (
          <p className="text-sm text-muted-foreground">
            Debuxa a parcela no mapa. Os detalles aparecerán ao rematar.
          </p>
        ) : selectedPlot ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                Nome
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-input rounded-md bg-background"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                Cor
              </label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-9 border border-input rounded-md"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                Notas
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-2 py-1.5 text-sm border border-input rounded-md bg-background resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-muted p-2 rounded-md">
                <span className="text-muted-foreground text-xs">Área</span>
                <p className="font-medium">
                  {selectedPlot.area_m2
                    ? `${selectedPlot.area_m2.toFixed(2)} m²`
                    : "-"}
                </p>
              </div>
              <div className="bg-muted p-2 rounded-md">
                <span className="text-muted-foreground text-xs">Perímetro</span>
                <p className="font-medium">
                  {selectedPlot.perimeter_m
                    ? `${selectedPlot.perimeter_m.toFixed(2)} m`
                    : "-"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={updatePlot.isPending}
                className="flex-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                Gardar
              </button>
              <button
                onClick={handleDelete}
                disabled={deletePlot.isPending}
                className="px-3 py-1.5 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm font-medium hover:bg-destructive/20 disabled:opacity-50"
              >
                Eliminar
              </button>
            </div>
            <button
              onClick={handleToggleEdit}
              className={`w-full px-3 py-1.5 rounded-md text-sm font-medium border ${
                editingPlotId === selectedPlotId
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:bg-muted"
              }`}
            >
              {editingPlotId === selectedPlotId
                ? "Rematar edición"
                : "Editar xeometría"}
            </button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Selecciona unha parcela no mapa ou na lista para ver os detalles.
          </p>
        )}
      </section>

      <section className="flex-1 overflow-y-auto p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Lista ({plots.length})
        </h2>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando...</p>
        ) : sortedPlots.length === 0 ? (
          <p className="text-sm text-muted-foreground">Non hai parcelas</p>
        ) : (
          <div className="space-y-2">
            {sortedPlots.map((plot) => (
              <div
                key={plot.id}
                onClick={() => handleSelect(plot.id)}
                className={`w-full text-left p-3 rounded-md border cursor-pointer transition-colors ${
                  selectedPlotId === plot.id
                    ? "bg-primary/10 border-primary"
                    : "bg-card border-border hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: plot.color }}
                  />
                  <span className="font-medium text-sm truncate flex-1">
                    {plot.name}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {plot.area_m2 ? `${plot.area_m2.toFixed(2)} m²` : "-"} ·{" "}
                  {plot.perimeter_m ? `${plot.perimeter_m.toFixed(2)} m` : "-"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </aside>
  );
}
