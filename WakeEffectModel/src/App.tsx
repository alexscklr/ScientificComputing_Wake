import React, { useState } from 'react';
import './App.css';
import WindMap from './components/WindMap';
import TurbineForm from './components/TurbineForm';
import { Turbine } from './types/Turbine';
import Toolbar from './components/Toolbar/Toolbar';

function App() {
  const [turbines, setTurbines] = useState<Turbine[]>([]);
  const [newTurbineCoords, setNewTurbineCoords] = useState<{ lat: number, lon: number } | null>(null);

  const handleMapClick = (lat: number, lon: number) => {
    setNewTurbineCoords({ lat, lon }); // Öffne Formular
  };

  const saveNewTurbine = (turbineData: Omit<Turbine, 'id'>) => {
    const id = turbines.length + 1;
    const newTurbine: Turbine = { ...turbineData, id };
    setTurbines((prev) => [...prev, newTurbine]);
    setNewTurbineCoords(null);
  };

  const cancelNewTurbine = () => {
    setNewTurbineCoords(null);
  };

  const updateTurbinePosition = (id: number, lat: number, lon: number) => {
    setTurbines((prev) =>
      prev.map((t) => (t.id === id ? { ...t, lat, lon } : t))
    );
  };

  const deleteTurbine = (id: number) => {
    setTurbines((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      {/* Linke Seite: Karte */}
      <div style={{ flex: 1 }}>
        <WindMap
          turbines={turbines}
          onAddTurbine={(lat, lon) => handleMapClick(lat, lon)}
          onUpdatePosition={updateTurbinePosition}
          onDeleteTurbine={deleteTurbine}
        />
      </div>
  
      {/* Rechte Seite: Sidebar nur sichtbar bei Koordinaten */}
      {newTurbineCoords && (
        <div style={{
          width: '300px',
          backgroundColor: '#f9f9f9',
          borderLeft: '1px solid #ccc',
          padding: '1rem',
        }}>
          <TurbineForm
            lat={newTurbineCoords.lat}
            lon={newTurbineCoords.lon}
            onSave={saveNewTurbine}
            onCancel={cancelNewTurbine}
          />
        </div>
      )}
      <Toolbar turbines={turbines} setTurbines={setTurbines} />
    </div>
  );
  
}

export default App;
