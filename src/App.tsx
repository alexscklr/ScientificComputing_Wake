import { useEffect, useState } from 'react';
import './App.css';
import WindMap from './components/WindMap';
import { Turbine, TurbineType } from './types/Turbine';
import { AreaFeature } from './types/GroundArea';
import Sidebar from './components/Sidebar';
import turbinesPresets from './assets/turbineTypes.json';
import { Modes, useMode } from './context/ModeContext';
import { WindroseData, NullWindrose } from './types/WindRose';
import { Point } from 'leaflet';
import { applyShiftVector, calculateShiftVector } from './utils/geoUtils';
import { assignGroundAreaDataToTurbines } from './utils/GroundAreaToTurbines';

function App() {
  const [turbines, setTurbines] = useState<Turbine[]>([]);
  const [groundAreas, setGroundAreas] = useState<AreaFeature[]>([]);
  const [windroseData, setWindroseData] = useState<WindroseData>(NullWindrose);
  const [mapCenter, setMapCenter] = useState<Point>(new Point(51.6369, 8.234));
  const [activeTurbines, setActiveTurbines] = useState<Turbine[]>([]);
  const [activeGroundAreas, setActiveGroundAreas] = useState<AreaFeature[]>([]);
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
    setActiveTurbines([newTurbine]);
    setActiveGroundAreas([]);
    setMode(Modes.New);
  };


  const saveNewTurbine = (turbine: Turbine) => {
    const newTurbine: Turbine = { ...turbine };
    setTurbines((prev) => [...prev, newTurbine]);
    setMode(Modes.Edit); // Zurück zur Toolbar
    setActiveTurbines([newTurbine]); // Setze die neue Turbine als aktive Turbine
  };


  const editTurbine = (id: string, shiftPressed: boolean) => {
    const turbineToEdit = turbines.find((turbine) => turbine.id === id);
    if (!turbineToEdit) return;

    if (shiftPressed) {
      // Wenn Shift gedrückt wurde → zur Liste hinzufügen
      setActiveTurbines(prev => prev.filter(t => t.id !== id));
      setActiveTurbines(prev => [...prev, turbineToEdit]);
    } else {
      // Sonst normale Einzel-Auswahl
      setActiveTurbines([turbineToEdit]);
      setMode(Modes.Edit); // Wechseln in Edit-Modus
    }
  };

  const cancelEdit = (id?: string) => {
    // Wenn eine ID übergeben wurde, filtere die Turbine heraus
    if (id) {
      setActiveTurbines(prev => prev.filter(t => t.id !== id));
    } else {
      // Wenn keine ID übergeben wurde, setze activeTurbine auf ein leeres Array zurück
      setActiveTurbines([]);
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
    setActiveTurbines(prev => prev.filter(t => t.id !== turbine.id));
  };

  const deleteTurbine = (id: string) => {
    setTurbines(prevTurbines => prevTurbines.filter(t => t.id !== id));

    setActiveTurbines(prevActives => prevActives.filter(t => t.id !== id));
  };

  const dragTurbine = (id: string, newLat: number, newLng: number, shiftPressed: boolean) => {
    const turbine = turbines.find(t => t.id === id);
    if (!turbine) return;

    const shift = calculateShiftVector(turbine.lat, turbine.long, newLat, newLng);

    setTurbines(prevTurbines => {
      let activeIds: string[];

      if (shiftPressed) {
        // Shift gedrückt → aktuelle Auswahl + neue Turbine
        const ids = [...activeTurbines.map(t => t.id)];
        if (!ids.includes(id)) {
          ids.push(id);
        }
        activeIds = ids;
      } else {
        // Kein Shift → nur die gezogene Turbine ist aktiv
        activeIds = [id];
      }

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

      const updatedActiveTurbines = updatedTurbines.filter(t => activeIds.includes(t.id));
      setActiveTurbines(updatedActiveTurbines);

      return updatedTurbines;
    });
  };

  const saveNewGroundArea = (area: AreaFeature) => {
    setGroundAreas((prev) => [...prev, area]);
    setActiveGroundAreas([area]);
    setMode(Modes.GroundAreas);
  }

  const clickGroundArea = (area: AreaFeature) => {
    setActiveGroundAreas([area]);
    setMode(Modes.GroundAreas);
  }

  useEffect(() => {
    const updated = assignGroundAreaDataToTurbines(turbines, groundAreas);

    const hasChanges = turbines.some((t, i) =>
      t.groundAreaID !== updated[i].groundAreaID
    );

    if (hasChanges) {
      setTurbines(updated);
    }
  }, [turbines, groundAreas]);


  return (
    <div style={{ display: 'flex', height: '100vh', maxWidth: '100%' }}>
      {/* Linke Seite: Karte */}
      <WindMap
        turbines={turbines}
        groundAreas={groundAreas}
        activeTurbines={activeTurbines}
        setMapCenter={setMapCenter}
        onAddTurbine={handleMapClick}
        onEditTurbine={editTurbine}
        onDragTurbine={dragTurbine}
        onAddGroundArea={saveNewGroundArea}
        onGroundAreaClick={clickGroundArea}
      />

      {/* Rechte Seite: Sidebar */}
      <Sidebar
        turbines={turbines}
        setTurbines={setTurbines}
        groundAreas={groundAreas}
        setGroundAreas={setGroundAreas}
        activeGroundAreas={activeGroundAreas}
        mapCenter={mapCenter}
        windroseData={windroseData}
        setWindroseData={setWindroseData}
        activeTurbine={activeTurbines}
        onSave={mode === Modes.New ? saveNewTurbine : updateTurbine}
        onCancel={cancelEdit}
        onDelete={deleteTurbine}
      />
    </div>
  );
}

export default App;

