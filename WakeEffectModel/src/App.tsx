import React, { useState } from 'react';
import './App.css';
import WindMap from './components/WindMap';
import { Turbine, TurbineType } from './types/Turbine';
import Sidebar from './components/Sidebar';
import turbinesPresets from './assets/turbineTypes.json';
import { Modes, useMode } from './context/ModeContext';
import { WindroseData } from './types/WindRose';
import { Point } from 'leaflet';

function App() {
  const [turbines, setTurbines] = useState<Turbine[]>([]);
  const [windroseData, setWindroseData] = useState<WindroseData | undefined>(undefined);
  const [mapCenter, setMapCenter] = useState<Point>(new Point(51.6369, 8.234))
  const [activeTurbine, setActiveTurbine] = useState<Turbine | null>(null); // Halte die aktive Turbine
  const { mode, setMode } = useMode(); // Aktuellen Modus der Sidebar

  const handleMapClick = (lat: number, long: number) => {
    // Setze die aktive Turbine auf null, wenn du in den Modes.New Modus gehst
    setActiveTurbine({ id: Date.now(), name: `Wind Turbine ${turbines.length+1}`, type: turbinesPresets.find((t: TurbineType) => t.name === "DefaultNull") || turbinesPresets[0], lat, long, available: true });
    setMode(Modes.New); // Wechsel in den Modes.New Modus
  };

  const saveNewTurbine = (data: Omit<Turbine, 'id'>) => {
    const newTurbine: Turbine = { ...data, id: turbines.length + 1 };
    setTurbines((prev) => [...prev, newTurbine]);
    setMode(Modes.Toolbar); // Zurück zur Toolbar
    setActiveTurbine(null); // Setze aktive Turbine zurück
  };

  const editTurbine = (id: number) => {
    const turbineToEdit = turbines.find((turbine) => turbine.id === id);
    if (turbineToEdit) {
      setActiveTurbine(turbineToEdit);
      setMode(Modes.Edit); // Wechsel in den Modes.Edit Modus
    }
  };

  const cancelEdit = () => {
    setActiveTurbine(null);
    setMode(Modes.Toolbar); // Zurück zur Toolbar
  };

  const updateTurbine = (data: Omit<Turbine, 'id'>) => {
    setTurbines((prev) =>
      prev.map((t) => (t.id === activeTurbine?.id ? { ...t, ...data } : t))
    );
    setMode(Modes.Toolbar);
    setActiveTurbine(null);
  };

  const dragTurbine = (id: number, lat: number, long: number) => {
    setTurbines((prev) =>
      prev.map((turbine) =>
        turbine.id === id ? { ...turbine, lat: lat, long: long } : turbine
      )
    );
    setMode(Modes.Toolbar);
    setActiveTurbine(null);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', maxWidth: '100%' }}>
      {/* Linke Seite: Karte */}
      <div style={{ flex: 5 }}>
        <WindMap
          turbines={turbines}
          setMapCenter={setMapCenter}
          activeTurbine={activeTurbine}
          onAddTurbine={handleMapClick}
          onEditTurbine={editTurbine} // Optional: zum Bearbeiten von Markern
          onDragTurbine={dragTurbine}
        />
      </div>

      {/* Rechte Seite: Sidebar */}
      <div style={{ flex: 2 }}>
        <Sidebar
          turbines={turbines}
          setTurbines={setTurbines}
          mapCenter={mapCenter}
          windroseData={windroseData}
          setWindroseData={setWindroseData}
          activeTurbine={activeTurbine}
          onSave={mode === Modes.New ? saveNewTurbine : updateTurbine}
          onCancel={cancelEdit}
        />
      </div>
    </div>
  );
}

export default App;
