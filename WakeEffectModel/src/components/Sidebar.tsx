import React from 'react';
import TurbineForm from './tabs/TurbineForm';
import Toolbar from './tabs/Toolbar';
import { Turbine } from '../types/Turbine';
import { DefaultNull } from './TurbineList';

type SidebarProps = {
  mode: 'toolbar' | 'new' | 'edit';
  turbines: Turbine[];
  setTurbines: React.Dispatch<React.SetStateAction<Turbine[]>>;
  activeTurbine: Turbine | null;
  onSave: (data: Omit<Turbine, 'id'>) => void;
  onCancel: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ mode, turbines, setTurbines, activeTurbine, onSave, onCancel }) => {
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
      <div style={{ width: '300px', backgroundColor: '#f9f9f9', borderLeft: '1px solid #ccc', padding: '1rem' }}>
        {mode === 'toolbar' && (
          <Toolbar turbines={turbines} setTurbines={setTurbines} />
        )}
        {(mode === 'new' || mode === 'edit') && (
          <TurbineForm
            lat={activeTurbine ? activeTurbine.lat : 0}
            long={activeTurbine ? activeTurbine.long : 0}
            name={activeTurbine ? activeTurbine.name : ''}
            type={activeTurbine ? activeTurbine.type : DefaultNull}
            onSave={mode === 'new' ? handleSave : onSave}  // Falls 'new' Modus, handleSave übergeben
            onCancel={handleCancel}
          />
        )}
      </div>
    );
  };
  
  

export default Sidebar;
