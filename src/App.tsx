import { useEffect, useState } from 'react';
import './App.css';
import WindMap from './components/WindMap';
import { Turbine, TurbineType } from './types/Turbine';
import { AreaFeature } from './types/GroundArea';
import Sidebar from './components/Sidebar';
import turbinesPresets from './assets/turbineTypes.json';
import { Modes, PlacementModes, useMode } from './context/ModeContext';
import { Mast, NullWindrose2 } from './types/WindRose';
import { Point } from 'leaflet';
import { applyShiftVector, calculateShiftVector } from './utils/geoUtils';
import { assignGroundAreaDataToTurbines } from './utils/GroundAreaToTurbines';

function App() {
  const [turbines, setTurbines] = useState<Turbine[]>([]);
  const [masts, setMasts] = useState<Mast[]>([]);
  const [groundAreas, setGroundAreas] = useState<AreaFeature[]>([]);
  const [mapCenter, setMapCenter] = useState<Point>(new Point(51.6369, 8.234));
  const [activeTurbines, setActiveTurbines] = useState<Turbine[]>([]);
  const [activeMasts, setActiveMasts] = useState<Mast[]>([]);
  const [activeGroundAreas, setActiveGroundAreas] = useState<AreaFeature[]>([]);
  const { mode, setMode, placementMode } = useMode(); // Aktuellen Modus der Sidebar

  const handleMapClick = (lat: number, long: number) => {
    if (placementMode === PlacementModes.Turbine) {
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
      setMode(Modes.NewTurbine);
    }
    if (placementMode === PlacementModes.Mast) {
      const newMast: Mast = {
        id: crypto.randomUUID(),
        name: `Mast ${masts.length + 1}`,
        lat,
        long,
        windrose: NullWindrose2,
        measureHeight: 10,
        available: true
      }

      setActiveTurbines([]);
      setActiveMasts([newMast]);
      setActiveGroundAreas([]);
      setMode(Modes.NewMast);
    }
    if (placementMode === PlacementModes.None) {
      setActiveTurbines([]);
      setActiveMasts([]);
      setActiveGroundAreas([]);
      setMode(Modes.Toolbar);
    }
  };


  const saveNewTurbine = (turbine: Turbine) => {
    const newTurbine: Turbine = { ...turbine };
    setTurbines((prev) => [...prev, newTurbine]);
    setMode(Modes.EditTurbine); // Zurück zur Toolbar
    setActiveTurbines([newTurbine]);
    setActiveMasts([]);
    setActiveGroundAreas([]);
  };
  const saveNewMast = (mast: Mast) => {
    const newMast: Mast = { ...mast };
    setMasts(prev => [...prev, newMast]);
    setMode(Modes.EditMast);
    setActiveTurbines([]);
    setActiveMasts([newMast]);
    setActiveGroundAreas([]);
  }


  const editTurbine = (id: string, ctrlPressed: boolean) => {
    const turbineToEdit = turbines.find((turbine) => turbine.id === id);
    if (!turbineToEdit) return;

    if (ctrlPressed) {
      // Wenn Shift gedrückt wurde → zur Liste hinzufügen
      setActiveTurbines(prev => prev.filter(t => t.id !== id));
      setActiveTurbines(prev => [...prev, turbineToEdit]);
      setActiveMasts([]);
      setActiveGroundAreas([]);
    } else {
      // Sonst normale Einzel-Auswahl
      setActiveTurbines([turbineToEdit]);
      setActiveMasts([]);
      setActiveGroundAreas([]);
    }
    setMode(Modes.EditTurbine);
  };
  const editMast = (id: string, ctrlPressed: boolean) => {
    const mastToEdit = masts.find(m => m.id === id);
    if (!mastToEdit) return;

    if (ctrlPressed) {
      setActiveMasts(prev => prev.filter(m => m.id != id));
      setActiveMasts(prev => [...prev, mastToEdit]);
      setActiveTurbines([]);
      setActiveGroundAreas([]);
    } else {
      setActiveMasts([mastToEdit]);
      setActiveTurbines([]);
      setActiveGroundAreas([]);
    }
    setMode(Modes.EditMast)
  }

  // Cancel Edit of turbine, mast
  const cancelEdit = (id?: string) => {
    // Wenn eine ID übergeben wurde, filtere die Turbine heraus
    if (id) {
      setActiveTurbines(prev => prev.filter(t => t.id !== id));
      setActiveMasts(prev => prev.filter(m => m.id !== id));
    } else {
      // Wenn keine ID übergeben wurde, setze activeTurbine auf ein leeres Array zurück
      setActiveTurbines([]);
      setActiveMasts([]);
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

  const updateMast = (mast: Mast) => {
    setMasts(prev => prev.map(m => m.id === mast.id ? { ...m, ...mast } : m));
    setActiveMasts(prev => prev.filter(m => m.id != mast.id));
  }

  const deleteTurbine = (id: string) => {
    setTurbines(prevTurbines => prevTurbines.filter(t => t.id !== id));

    setActiveTurbines(prevActives => prevActives.filter(t => t.id !== id));
  };
  const deleteMast = (id: string) => {
    setMasts(prev => prev.filter(m => m.id != id));
    setActiveMasts(prev => prev.filter(m => m.id != id));
  }

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
  const dragMast = (id: string, newLat: number, newLng: number, shiftPressed: boolean) => {
    const mast = masts.find(m => m.id === id);
    if (!mast) return;

    const shift = calculateShiftVector(mast.lat, mast.long, newLat, newLng);

    setMasts(prev => {
      let activeIds: string[];

      if (shiftPressed) {
        // Shift gedrückt → aktuelle Auswahl + neue Turbine
        const ids = [...activeMasts.map(t => t.id)];
        if (!ids.includes(id)) {
          ids.push(id);
        }
        activeIds = ids;
      } else {
        // Kein Shift → nur die gezogene Turbine ist aktiv
        activeIds = [id];
      }

      const updatedMasts = prev.map(m => {
        if (activeIds.includes(m.id)) {
          const moved = applyShiftVector(m.lat, m.long, shift);
          return {
            ...m,
            lat: moved.lat,
            long: moved.lng,
          };
        }
        return m;
      });

      const updatedActiveMasts = updatedMasts.filter(m => activeIds.includes(m.id));
      setActiveMasts(updatedActiveMasts);

      return updatedMasts;
    });
  };

  const saveNewGroundArea = (area: AreaFeature) => {
    setGroundAreas((prev) => [...prev, area]);
    setActiveGroundAreas([area]);
    setMode(Modes.GroundAreas);
  }

  const updateGroundArea = (updatedArea: AreaFeature) => {
    setGroundAreas((prev) => {
      const updated = prev.map((area) =>
        area.properties.id === updatedArea.properties.id ? updatedArea : area
      );
      return updated;
    });
  };

  const clickGroundArea = (area: AreaFeature) => {
    setActiveTurbines([]);
    setActiveMasts([]);
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
        masts={masts}
        groundAreas={groundAreas}
        activeTurbines={activeTurbines}
        activeMasts={activeMasts}
        setMapCenter={setMapCenter}
        onMapClick={handleMapClick}
        onEditTurbine={editTurbine}
        onEditMast={editMast}
        onDragTurbine={dragTurbine}
        onDragMast={dragMast}
        onAddGroundArea={saveNewGroundArea}
        onEditGroundArea={updateGroundArea}
        onGroundAreaClick={clickGroundArea}
      />

      {/* Rechte Seite: Sidebar */}
      <Sidebar
        turbines={turbines}
        setTurbines={setTurbines}
        masts={masts}
        setMasts={setMasts}
        groundAreas={groundAreas}
        setGroundAreas={setGroundAreas}
        activeGroundAreas={activeGroundAreas}
        mapCenter={mapCenter}
        activeTurbine={activeTurbines}
        activeMasts={activeMasts}
        onSave={mode === Modes.NewTurbine ? saveNewTurbine : updateTurbine}
        onSaveMast={mode === Modes.NewMast ? saveNewMast : updateMast}
        onCancel={cancelEdit}
        onDelete={deleteTurbine}
        onDeleteMast={deleteMast}
      />
    </div>
  );
}

export default App;

