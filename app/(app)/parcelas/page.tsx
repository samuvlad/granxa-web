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
    setDraftName("");
    setDraftColor("#3388ff");
    setDraftNotes("");
  };

  const handleCompleteCreate = () => {
    setIsCreatingNew(false);
    setDraftName("");
    setDraftColor("#3388ff");
    setDraftNotes("");
  };

  const handleDraftChange = (updates: {
    name?: string;
    color?: string;
    notes?: string;
  }) => {
    if (updates.name !== undefined) setDraftName(updates.name);
    if (updates.color !== undefined) setDraftColor(updates.color);
    if (updates.notes !== undefined) setDraftNotes(updates.notes);
  };

  return (
    <main className="grid h-full w-full grid-cols-[20rem_1fr] grid-rows-[100vh] overflow-hidden">
      <PlotSidebar
        selectedPlotId={selectedPlotId}
        onSelectPlot={setSelectedPlotId}
        editingPlotId={editingPlotId}
        onEditingChange={setEditingPlotId}
        isCreatingNew={isCreatingNew}
        draftName={draftName}
        draftColor={draftColor}
        draftNotes={draftNotes}
        onDraftChange={handleDraftChange}
        onCancelCreate={handleCancelCreate}
      />
      <MapView
        selectedPlotId={selectedPlotId}
        onSelectPlot={setSelectedPlotId}
        editingPlotId={editingPlotId}
        onEditingChange={setEditingPlotId}
        isCreatingNew={isCreatingNew}
        onStartCreate={handleStartCreate}
        onCancelCreate={handleCancelCreate}
        onCompleteCreate={handleCompleteCreate}
        draftName={draftName}
        draftColor={draftColor}
        draftNotes={draftNotes}
      />
    </main>
  );
}