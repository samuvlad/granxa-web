"use client";

import { useState } from "react";
import { PlotSidebar } from "@/components/map/PlotSidebar";
import { MapView } from "@/components/map/MapView";

export default function ParcelasPage() {
  const [selectedPlotId, setSelectedPlotId] = useState<number | null>(null);
  const [editingPlotId, setEditingPlotId] = useState<number | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftColor, setDraftColor] = useState("#3388ff");
  const [draftNotes, setDraftNotes] = useState("");

  const handleStartCreate = () => {
    setDraftName("");
    setDraftColor("#3388ff");
    setDraftNotes("");
    setSelectedPlotId(null);
    setEditingPlotId(null);
    setIsCreatingNew(true);
  };

  const handleCancelCreate = () => {
    setIsCreatingNew(false);
  };

  return (
    <main className="grid h-full w-full grid-cols-[20rem_1fr] overflow-hidden">
      <PlotSidebar
        selectedPlotId={selectedPlotId}
        onSelectPlot={setSelectedPlotId}
        editingPlotId={editingPlotId}
        onEditingChange={setEditingPlotId}
        isCreatingNew={isCreatingNew}
      />
      <MapView
        selectedPlotId={selectedPlotId}
        onSelectPlot={setSelectedPlotId}
        editingPlotId={editingPlotId}
        onEditingChange={setEditingPlotId}
        isCreatingNew={isCreatingNew}
        onStartCreate={handleStartCreate}
        onCancelCreate={handleCancelCreate}
        draftName={draftName}
        draftColor={draftColor}
        draftNotes={draftNotes}
      />
    </main>
  );
}