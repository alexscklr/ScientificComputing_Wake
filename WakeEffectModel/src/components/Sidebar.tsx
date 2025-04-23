import React, { useEffect } from 'react';
import TurbineForm from './tabs/TurbineForm';
import Toolbar from './tabs/Toolbar';
import { Turbine, TurbineType } from '../types/Turbine';
import turbinesPresets from './../assets/turbineTypes.json';
import WindroseComponent from './tabs/WindRoseComp';
import { Modes, useMode } from '../context/ModeContext';
import './styles/Sidebar.css';
import CalculatePower from './tabs/CalculatePower';
import { WindroseData } from '../types/WindRose';
import { Point } from 'leaflet';

type SidebarProps = {
  turbines: Turbine[];
  setTurbines: React.Dispatch<React.SetStateAction<Turbine[]>>;
  mapCenter: Point;
  windroseData?: WindroseData;
  setWindroseData: (wr: WindroseData) => void;
  activeTurbine: Turbine | null;
  onSave: (data: Omit<Turbine, 'id'>) => void;
  onCancel: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ turbines, setTurbines, mapCenter, windroseData, setWindroseData, activeTurbine, onSave, onCancel }) => {
  const { mode, setMode } = useMode();

  const handleSave = (data: Omit<Turbine, 'id'>) => {
    if (onSave) {
      onSave(data);
    }
  };

  const handleCancel = () => {
    onCancel();
    setMode(Modes.Toolbar);  // Setze den Modus auf Modes.Toolbar, wenn man auf 'Abbrechen' klickt
  };

  useEffect(() => { }, [mode]);

  return (
    <div className="sidebar-container">
      <div className="sidebar-btn-container">
        <button
          className={`sidebar-button ${mode === Modes.Toolbar ? 'active' : ''}`}
          onClick={() => setMode(Modes.Toolbar)}
        >
          Turbinen - Import/Export
        </button>
        <button
          className={`sidebar-button ${(mode === Modes.New || mode === Modes.Edit) ? 'active' : ''}`}
          onClick={() => setMode(Modes.New)}
        >
          Neue Turbine
        </button>
        <button
          className={`sidebar-button ${mode === Modes.Windrose ? 'active' : ''}`}
          onClick={() => setMode(Modes.Windrose)}
        >
          Windrose
        </button>
        <button
          className={`sidebar-button ${mode === Modes.Calculate ? 'active' : ''}`}
          onClick={() => setMode(Modes.Calculate)}
        >
          Berechnen
        </button>
      </div>
      <div>
        {mode === Modes.Toolbar && (
          <Toolbar turbines={turbines} setTurbines={setTurbines} />
        )}
        {(mode === Modes.New || mode === Modes.Edit) && (
          <TurbineForm
            lat={activeTurbine ? activeTurbine.lat : mapCenter.x}
            long={activeTurbine ? activeTurbine.long : mapCenter.y}
            name={activeTurbine ? activeTurbine.name : `Wind Turbine ${turbines.length+1}`}
            type={activeTurbine ? activeTurbine.type : turbinesPresets.find(t => t.name === 'DefaultNull')!}
            available={activeTurbine ? activeTurbine.available : true}
            onSave={mode === Modes.New ? handleSave : onSave}
            onCancel={handleCancel}
          />
        )}
        {mode === Modes.Windrose && (
          <WindroseComponent 
            windroseData={windroseData}
            setWindroseData={setWindroseData}
          />
          )}
        {mode === Modes.Calculate && (
          <CalculatePower 
            turbines={turbines}
            setTurbines={setTurbines}
            windrose={windroseData}
            setWindrose={setWindroseData}
          />
        )}
      </div>
    </div>
  );
};


export default Sidebar;
