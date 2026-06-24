"use client";

import { PlotSidebar } from "@/components/map/PlotSidebar";
import { MapView } from "@/components/map/MapView";

import { useMapDraft } from "../_hooks/use-map-draft";
import { useParcelasSelection } from "../_hooks/use-parcelas-selection";

export function ParcelasClient() {
  const selection = useParcelasSelection();
  const draft = useMapDraft();

  return (
    <main className="grid h-full w-full grid-cols-[20rem_1fr] grid-rows-[100vh] overflow-hidden">
      <PlotSidebar
        selectedPlotId={selection.selectedPlotId}
        onSelectPlot={selection.setSelectedPlotId}
        editingPlotId={selection.editingPlotId}
        onEditingChange={selection.setEditingPlotId}
        isCreatingNew={selection.isCreatingNew}
        draft={draft}
        onCancelCreate={() => {
          selection.cancelCreate();
          draft.reset();
        }}
      />
      <MapView
        selectedPlotId={selection.selectedPlotId}
        onSelectPlot={selection.setSelectedPlotId}
        editingPlotId={selection.editingPlotId}
        onEditingChange={selection.setEditingPlotId}
        isCreatingNew={selection.isCreatingNew}
        onStartCreate={() => {
          draft.reset();
          selection.startCreate();
        }}
        onCancelCreate={() => {
          selection.cancelCreate();
          draft.reset();
        }}
        onCompleteCreate={() => {
          selection.completeCreate();
          draft.reset();
        }}
        draft={draft}
      />
    </main>
  );
}
