import React, { useEffect, useRef, useState } from 'react';
import TurbineForm from './tabs/TurbineForm';
import Toolbar from './tabs/Toolbar';
import { Turbine } from '../types/Turbine';
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
  const [showBtns, setShowBtns] = useState<boolean>(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(516);
  const isResizing = useRef(false);

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

  const showBtnsOnHover = () => {
    setShowBtns(!showBtns);
  }

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.addEventListener('mousemove', resizeSidebar);
    document.addEventListener('mouseup', stopResizing);
  };

  const resizeSidebar = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth >= 300 && newWidth <= window.innerWidth * 0.75) {
      setSidebarWidth(newWidth);
    }
  };


  const stopResizing = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', resizeSidebar);
    document.removeEventListener('mouseup', stopResizing);
  };

  return (
    <div className="sidebar-container" style={{ width: sidebarWidth, position: 'relative' }}>
      <div className="sidebar-btn-container" onMouseEnter={showBtnsOnHover} onMouseLeave={showBtnsOnHover}>
        {(<button
          className={`sidebar-button ${showBtns ? 'shown' : ''} ${mode === Modes.Toolbar ? 'shown active' : ''}`}
          onClick={() => setMode(Modes.Toolbar)}
        >
          Turbinen - Import/Export
        </button>)}
        {(<button
          className={`sidebar-button ${showBtns ? 'shown' : ''} ${(mode === Modes.New || mode === Modes.Edit) ? 'shown active' : ''}`}
          onClick={() => setMode(Modes.New)}
        >
          Neue Turbine
        </button>)}
        {(<button
          className={`sidebar-button ${showBtns ? 'shown' : ''} ${mode === Modes.Windrose ? 'shown active' : ''}`}
          onClick={() => setMode(Modes.Windrose)}
        >
          Windrose
        </button>)}
        {(<button
          className={`sidebar-button ${showBtns ? 'shown' : ''} ${mode === Modes.Calculate ? 'shown active' : ''}`}
          onClick={() => setMode(Modes.Calculate)}
        >
          Berechnen
        </button>)}
      </div>
      <hr style={{ margin: '0 0 15px 0', width: '100%' }} />
      <div className='tab-container'>
        {mode === Modes.Toolbar && (
          <Toolbar turbines={turbines} setTurbines={setTurbines} />
        )}
        {(mode === Modes.New || mode === Modes.Edit) && (
          <TurbineForm
            lat={activeTurbine ? activeTurbine.lat : mapCenter.x}
            long={activeTurbine ? activeTurbine.long : mapCenter.y}
            name={activeTurbine ? activeTurbine.name : `Wind Turbine ${turbines.length + 1}`}
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
      <div
        className='resize-handle'
        onMouseDown={startResizing}
      >
        |||
      </div>
    </div>
  );
};


export default Sidebar;
