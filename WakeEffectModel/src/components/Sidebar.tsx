import React from 'react';
import TurbineForm from './tabs/TurbineForm';
import Toolbar from './tabs/Toolbar';
import { Turbine, TurbineType } from '../types/Turbine';
import turbinesPresets from './../assets/turbineTypes.json';
import WindroseComponent from './WindRoseComp';
import { useMode } from '../hooks/useMode';
import './styles/Sidebar.css';

type SidebarProps = {
  turbines: Turbine[];
  setTurbines: React.Dispatch<React.SetStateAction<Turbine[]>>;
  activeTurbine: Turbine | null;
  onSave: (data: Omit<Turbine, 'id'>) => void;
  onCancel: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ turbines, setTurbines, activeTurbine, onSave, onCancel }) => {
  const { mode, setMode } = useMode();

  // Leere Funktion für onSave im 'new' Modus
  const handleSave = (data: Omit<Turbine, 'id'>) => {
    if (onSave) {
      onSave(data); // Aufrufen der onSave-Funktion, wenn sie existiert
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <div className='sidebar-container'>
      <div className="sidebar-btn-container">
        <button
          className={`sidebar-button ${mode === 'toolbar' ? 'active' : ''}`}
          onClick={() => setMode('toolbar')}
        >
          Turbinen - Import/Export
        </button>
        <button
          className={`sidebar-button ${mode === 'new' ? 'active' : ''}`}
          onClick={() => setMode('new')}
        >
          Neue Turbine
        </button>
        <button
          className={`sidebar-button ${mode === 'windrose' ? 'active' : ''}`}
          onClick={() => setMode('windrose')}
        >
          Windrose
        </button>
      </div>
      
      {mode === 'toolbar' && (
        <Toolbar turbines={turbines} setTurbines={setTurbines} />
      )}
      {(mode === 'new' || mode === 'edit') && (
        <TurbineForm
          lat={activeTurbine ? activeTurbine.lat : 0}
          long={activeTurbine ? activeTurbine.long : 0}
          name={activeTurbine ? activeTurbine.name : ''}
          type={activeTurbine ? activeTurbine.type : turbinesPresets.find((t: TurbineType) => t.name === "DefaultNull") || turbinesPresets[0]}
          onSave={mode === 'new' ? handleSave : onSave}  // Falls 'new' Modus, handleSave übergeben
          onCancel={handleCancel}
        />
      )}
      {mode === 'windrose' && <WindroseComponent />}
    </div>
  );
};

export default Sidebar;
