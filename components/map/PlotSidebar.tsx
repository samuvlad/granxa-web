"use client";

import { useState } from "react";
import { useDeletePlot, usePlots, useUpdatePlot } from "@/lib/queries";
import { getApiErrorMessage } from "@/lib/api";
import { useConfirm } from "@/components/ui/confirm-dialog";
import type { Plot, PlotUpdate } from "@/types";
import type { useMapDraft } from "@/app/(app)/parcelas/_hooks/use-map-draft";

interface PlotSidebarProps {
  selectedPlotId: number | null;
  onSelectPlot: (id: number | null) => void;
  editingPlotId: number | null;
  onEditingChange: (id: number | null) => void;
  isCreatingNew: boolean;
  draft: ReturnType<typeof useMapDraft>;
  onCancelCreate: () => void;
}

const PARCEL_COLORS: { value: string; label: string }[] = [
  { value: "#22c55e", label: "Verde (pasto)" },
  { value: "#84cc16", label: "Lima" },
  { value: "#eab308", label: "Amarelo" },
  { value: "#f59e0b", label: "Laranxa" },
  { value: "#ef4444", label: "Vermello" },
  { value: "#a855f7", label: "Morado" },
  { value: "#3b82f6", label: "Azul" },
];

export function PlotSidebar({
  selectedPlotId,
  onSelectPlot,
  editingPlotId,
  onEditingChange,
  isCreatingNew,
  draft,
  onCancelCreate,
}: PlotSidebarProps) {
  const { data: plots = [], isLoading } = usePlots();
  const updatePlot = useUpdatePlot();
  const deletePlot = useDeletePlot();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedPlot = plots.find((p) => p.id === selectedPlotId);
  const sortedPlots = [...plots].sort((a, b) => a.id - b.id);

  const { confirm, dialog: confirmDialog } = useConfirm();

  const handleDelete = async (id: number, name: string) => {
    const ok = await confirm({
      title: "Eliminar parcela",
      description: `Vas eliminar a parcela "${name}". Esta acción non se pode desfacer.`,
      confirmLabel: "Eliminar",
      variant: "destructive",
    });
    if (!ok) return;
    deletePlot.mutate(id, {
      onSuccess: () => onSelectPlot(null),
      onError: (err) => setErrorMessage(getApiErrorMessage(err)),
    });
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
          {isCreatingNew
            ? "Nova parcela"
            : selectedPlot
              ? "Editar"
              : "Información"}
        </h3>
        {isCreatingNew ? (
          <NewPlotForm
            draft={draft}
            onCancel={onCancelCreate}
          />
        ) : selectedPlot ? (
          <PlotEditForm
            key={selectedPlot.id}
            plot={selectedPlot}
            editing={editingPlotId === selectedPlot.id}
            errorMessage={errorMessage}
            onSave={(data) => {
              setErrorMessage(null);
              updatePlot.mutate(
                { id: selectedPlot.id, plot: data },
                {
                  onSuccess: () => {
                    if (editingPlotId === selectedPlot.id) {
                      onEditingChange(null);
                    }
                  },
                  onError: (err) => setErrorMessage(getApiErrorMessage(err)),
                }
              );
            }}
            onDelete={() => handleDelete(selectedPlot.id, selectedPlot.name)}
            onToggleEdit={() =>
              onEditingChange(
                editingPlotId === selectedPlot.id ? null : selectedPlot.id
              )
            }
            savePending={updatePlot.isPending}
            deletePending={deletePlot.isPending}
          />
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
                onClick={() => onSelectPlot(plot.id)}
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
      {confirmDialog}
    </aside>
  );
}

function PlotEditForm({
  plot,
  editing,
  errorMessage,
  onSave,
  onDelete,
  onToggleEdit,
  savePending,
  deletePending,
}: {
  plot: Plot;
  editing: boolean;
  errorMessage: string | null;
  onSave: (data: PlotUpdate) => void;
  onDelete: () => void;
  onToggleEdit: () => void;
  savePending: boolean;
  deletePending: boolean;
}) {
  const [name, setName] = useState(plot.name);
  const [color, setColor] = useState(plot.color);
  const [notes, setNotes] = useState(plot.notes ?? "");

  const trimmedName = name.trim();
  const trimmedNotes = notes.trim();
  const patch: PlotUpdate = {};
  if (trimmedName && trimmedName !== plot.name) patch.name = trimmedName;
  if (color !== plot.color) patch.color = color;
  if ((trimmedNotes || null) !== (plot.notes ?? null)) {
    patch.notes = trimmedNotes || null;
  }
  const hasChanges = Object.keys(patch).length > 0;

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-muted-foreground mb-1">Nome</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-2 py-1.5 text-sm border border-input rounded-md bg-background"
        />
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1">Cor</label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-full h-9 border border-input rounded-md"
        />
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1">
          Observacións
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
            {plot.area_m2 ? `${plot.area_m2.toFixed(2)} m²` : "-"}
          </p>
        </div>
        <div className="bg-muted p-2 rounded-md">
          <span className="text-muted-foreground text-xs">Perímetro</span>
          <p className="font-medium">
            {plot.perimeter_m ? `${plot.perimeter_m.toFixed(2)} m` : "-"}
          </p>
        </div>
      </div>
      {errorMessage ? (
        <p className="text-xs text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <div className="flex gap-2">
        <button
          onClick={() => onSave(patch)}
          disabled={savePending || !hasChanges || !trimmedName}
          className="flex-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {savePending ? "Gardando..." : "Gardar"}
        </button>
        <button
          onClick={onDelete}
          disabled={deletePending}
          className="px-3 py-1.5 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm font-medium hover:bg-destructive/20 disabled:opacity-50"
        >
          Eliminar
        </button>
      </div>
      <button
        onClick={onToggleEdit}
        className={`w-full px-3 py-1.5 rounded-md text-sm font-medium border ${
          editing
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-background text-foreground border-border hover:bg-muted"
        }`}
      >
        {editing ? "Rematar edición" : "Editar xeometría"}
      </button>
    </div>
  );
}

function NewPlotForm({
  draft,
  onCancel,
}: {
  draft: ReturnType<typeof useMapDraft>;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="rounded-md border border-primary/30 bg-primary/5 p-2.5 text-xs text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Como debuxar</p>
        <ol className="list-decimal list-inside space-y-0.5">
          <li>Define o nome, a cor e as observacións.</li>
          <li>Fai clic no mapa para colocar os vértices.</li>
          <li>Fai clic no primeiro vértice para pechar o polígono.</li>
        </ol>
      </div>

      <div>
        <label className="block text-xs text-muted-foreground mb-1">
          Nome <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          value={draft.name}
          onChange={(e) => draft.update({ name: e.target.value })}
          placeholder="Ex.: Pasto do río"
          className="w-full px-2 py-1.5 text-sm border border-input rounded-md bg-background"
          autoFocus
        />
      </div>

      <div>
        <label className="block text-xs text-muted-foreground mb-1">Cor</label>
        <div className="flex flex-wrap gap-1.5 items-center">
          {PARCEL_COLORS.map((c) => {
            const active =
              c.value.toLowerCase() === (draft.color || "").toLowerCase();
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => draft.update({ color: c.value })}
                className={`w-7 h-7 rounded-md border-2 transition-all ${
                  active
                    ? "border-foreground scale-110"
                    : "border-transparent hover:scale-105"
                }`}
                style={{ backgroundColor: c.value }}
                title={c.label}
                aria-label={c.label}
              />
            );
          })}
          <label
            className="w-7 h-7 rounded-md border border-input overflow-hidden cursor-pointer relative"
            title="Cor personalizada"
          >
            <span
              className="absolute inset-0.5 rounded-sm"
              style={{ backgroundColor: draft.color }}
            />
            <input
              type="color"
              value={draft.color}
              onChange={(e) => draft.update({ color: e.target.value })}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </label>
        </div>
      </div>

      <div>
        <label className="block text-xs text-muted-foreground mb-1">
          Observacións
        </label>
        <textarea
          value={draft.notes}
          onChange={(e) => draft.update({ notes: e.target.value })}
          rows={3}
          placeholder="Notas, manexo, accesos…"
          className="w-full px-2 py-1.5 text-sm border border-input rounded-md bg-background resize-none"
        />
      </div>

      <button
        type="button"
        onClick={onCancel}
        className="w-full px-3 py-1.5 rounded-md text-sm font-medium border border-border bg-background text-foreground hover:bg-muted"
      >
        Cancelar creación
      </button>
    </div>
  );
}
