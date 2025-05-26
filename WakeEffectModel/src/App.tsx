import React, { useState } from 'react';
import './App.css';
import WindMap from './components/WindMap';
import { Turbine, TurbineType } from './types/Turbine';
import Sidebar from './components/Sidebar';
import turbinesPresets from './assets/turbineTypes.json';
import { Modes, useMode } from './context/ModeContext';
import { WindroseData, NullWindrose } from './types/WindRose';
import { Point } from 'leaflet';
import { applyShiftVector, calculateShiftVector } from './utils/geoUtils';

function App() {
  const [turbines, setTurbines] = useState<Turbine[]>([]);
  const [windroseData, setWindroseData] = useState<WindroseData>(NullWindrose);
  const [mapCenter, setMapCenter] = useState<Point>(new Point(51.6369, 8.234));
  const [activeTurbine, setActiveTurbine] = useState<Turbine[]>([]); // Halte die aktive Turbine
  const { mode, setMode } = useMode(); // Aktuellen Modus der Sidebar

  const handleMapClick = (lat: number, long: number) => {
    const newTurbine: Turbine = {
      id: crypto.randomUUID(), // Generiere eine eindeutige ID
      name: `Wind Turbine ${turbines.length + 1}`,
      type: turbinesPresets.find((t: TurbineType) => t.name === "DefaultNull") || turbinesPresets[0],
      lat,
      long,
      available: true,
    };
  
    // Setze activeTurbine mit der neuen Turbine
    setActiveTurbine([newTurbine]);
    setMode(Modes.New); // Setze den Modus auf "New"
  };


  const saveNewTurbine = (turbine: Turbine) => {
    const newTurbine: Turbine = { ...turbine };
    setTurbines((prev) => [...prev, newTurbine]);
    setMode(Modes.Edit); // Zurück zur Toolbar
    setActiveTurbine([newTurbine]); // Setze die neue Turbine als aktive Turbine
  };
  

  const editTurbine = (id: string, shiftPressed: boolean) => {
    const turbineToEdit = turbines.find((turbine) => turbine.id === id);
    if (!turbineToEdit) return;

    if (shiftPressed) {
      // Wenn Shift gedrückt wurde → zur Liste hinzufügen
      setActiveTurbine(prev => prev.filter(t => t.id !== id));
      setActiveTurbine(prev => [...prev, turbineToEdit]);
    } else {
      // Sonst normale Einzel-Auswahl
      setActiveTurbine([turbineToEdit]);
      setMode(Modes.Edit); // Wechseln in Edit-Modus
    }
  };

  const cancelEdit = (id?: string) => {
    // Wenn eine ID übergeben wurde, filtere die Turbine heraus
    if (id) {
      setActiveTurbine(prev => prev.filter(t => t.id !== id));
    } else {
      // Wenn keine ID übergeben wurde, setze activeTurbine auf ein leeres Array zurück
      setActiveTurbine([]);
      setMode(Modes.Toolbar);
    }
  };
  

  const updateTurbine = (turbine: Turbine) => {
    setTurbines((prevTurbines) =>
      prevTurbines.map((t) =>
        // Hier vergleichen wir die ID der Turbine und stellen sicher, dass nur die richtige Turbine aktualisiert wird
        t.id === turbine.id ? { ...t, ...turbine } : t
      )
    );
    setActiveTurbine(prev => prev.filter(t => t.id !== turbine.id));
  };
  
  

  const dragTurbine = (id: string, newLat: number, newLng: number) => {
    const turbine = turbines.find(t => t.id === id);
    if (!turbine) return;

    // Erzeuge den Shift-Vektor
    const shift = calculateShiftVector(turbine.lat, turbine.long, newLat, newLng);

    setTurbines(prevTurbines => {
      // Liste der IDs der aktiven Turbinen + neu gezogene Turbine
      const activeIds = [...activeTurbine.map(t => t.id)];
      if (!activeIds.includes(id)) {
        activeIds.push(id);
      }

      // Turbinen aktualisieren
      const updatedTurbines = prevTurbines.map(t => {
        if (activeIds.includes(t.id)) {
          const moved = applyShiftVector(t.lat, t.long, shift);
          return {
            ...t,
            lat: moved.lat,
            long: moved.lng,
          };
        }
        return t;
      });

      // Aktualisierte aktive Turbinen extrahieren und setzen
      const updatedActiveTurbines = updatedTurbines.filter(t => activeIds.includes(t.id));
      setActiveTurbine(updatedActiveTurbines);

      return updatedTurbines;
    });

    setMode(Modes.Edit); // Im Edit-Modus bleiben
  };

  return (
    <div style={{ display: 'flex', height: '100vh', maxWidth: '100%' }}>
      {/* Linke Seite: Karte */}
      <WindMap
        turbines={turbines}
        setMapCenter={setMapCenter}
        activeTurbine={activeTurbine}
        onAddTurbine={handleMapClick}
        onEditTurbine={editTurbine}
        onDragTurbine={dragTurbine}
      />

      {/* Rechte Seite: Sidebar */}
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
  );
}

export default App;

