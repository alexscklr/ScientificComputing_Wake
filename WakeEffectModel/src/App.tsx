import React, { useState } from 'react';
import './App.css';
import WindMap from './components/WindMap';
import { Turbine } from './types/Turbine';
import Sidebar from './components/Sidebar';
import { DefaultNull, TurbineTypesMap } from './components/TurbineList';

function App() {
  const [turbines, setTurbines] = useState<Turbine[]>([]);
  const [activeTurbine, setActiveTurbine] = useState<Turbine | null>(null); // Halte die aktive Turbine
  const [mode, setMode] = useState<'toolbar' | 'new' | 'edit'>('toolbar'); // Aktuellen Modus der Sidebar

  const handleMapClick = (lat: number, long: number) => {
    // Setze die aktive Turbine auf null, wenn du in den 'new' Modus gehst
    setActiveTurbine({ id: Date.now(), name: '', type: DefaultNull, lat, long });
    setMode('new'); // Wechsel in den 'new' Modus
  };

  const saveNewTurbine = (data: Omit<Turbine, 'id'>) => {
    const newTurbine: Turbine = { ...data, id: turbines.length + 1 };
    setTurbines((prev) => [...prev, newTurbine]);
    setMode('toolbar'); // Zurück zur Toolbar
    setActiveTurbine(null); // Setze aktive Turbine zurück
  };

  const editTurbine = (id: number) => {
    const turbineToEdit = turbines.find((turbine) => turbine.id === id);
    if (turbineToEdit) {
      setActiveTurbine(turbineToEdit);
      setMode('edit'); // Wechsel in den 'edit' Modus
    }
  };

  const cancelEdit = () => {
    setActiveTurbine(null);
    setMode('toolbar'); // Zurück zur Toolbar
  };

  const updateTurbine = (data: Omit<Turbine, 'id'>) => {
    setTurbines((prev) =>
      prev.map((t) => (t.id === activeTurbine?.id ? { ...t, ...data } : t))
    );
    setMode('toolbar');
    setActiveTurbine(null);
  };

  const dragTurbine = (id: number, lat: number, long: number) => {
    setTurbines((prev) =>
      prev.map((turbine) =>
        turbine.id === id ? { ...turbine, lat: lat, long: long } : turbine
      )
    );
    setMode('toolbar');
    setActiveTurbine(null);
  };
  

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      {/* Linke Seite: Karte */}
      <div style={{ flex: 1 }}>
        <WindMap
          turbines={turbines}
          activeTurbine={activeTurbine}
          onAddTurbine={handleMapClick}
          onEditTurbine={editTurbine} // Optional: zum Bearbeiten von Markern
          onDragTurbine={dragTurbine}
        />
      </div>

      {/* Rechte Seite: Sidebar */}
      <Sidebar
        mode={mode}
        turbines={turbines}
        setTurbines={setTurbines}
        activeTurbine={activeTurbine}
        onSave={mode === 'new' ? saveNewTurbine : updateTurbine}
        onCancel={cancelEdit}
      />
    </div>
  );
}

export default App;
