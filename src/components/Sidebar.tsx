import React, { useRef, useState } from 'react';
import TurbineForm from './tabs/TurbineForm';
import Toolbar from './tabs/Toolbar';
import { Turbine, TurbineType } from '../types/Turbine';
import { Modes, PlacementModes, useMode } from '../context/ModeContext';
import './styles/Sidebar.css';
import CalculatePower from './tabs/CalculatePower';
import { Mast, NullWindrose2 } from '../types/WindRose';
import { Point } from 'leaflet';
import TurbineTypesList from './tabs/TurbineTypesList';
import { AreaFeature } from '../types/GroundArea';
import GroundAreas from './tabs/GroundAreas';
import MastForm from './tabs/MastForm';

type SidebarProps = {
  turbines: Turbine[];
  setTurbines: React.Dispatch<React.SetStateAction<Turbine[]>>;
  turbineTypes: TurbineType[];
  setTurbineTypes: React.Dispatch<React.SetStateAction<TurbineType[]>>;
  masts: Mast[];
  setMasts: React.Dispatch<React.SetStateAction<Mast[]>>;
  groundAreas: AreaFeature[];
  setGroundAreas: React.Dispatch<React.SetStateAction<AreaFeature[]>>;
  activeGroundAreas: AreaFeature[];
  mapCenter: Point;
  activeTurbine: Turbine[];
  activeMasts: Mast[];
  onSave: (turbine: Turbine) => void;
  onSaveMast: (mast: Mast) => void;
  onCancel: (id?: string) => void;
  onDelete: (id: string) => void;
  onDeleteMast: (id: string) => void;
};

const Sidebar: React.FC<SidebarProps> = ({ turbines, setTurbines, turbineTypes, setTurbineTypes, masts, setMasts, groundAreas, setGroundAreas, activeGroundAreas, mapCenter, activeTurbine, activeMasts, onSave, onSaveMast, onCancel, onDelete, onDeleteMast }) => {
  const { mode, setMode, placementMode, setPlacementMode } = useMode();
  const [showBtns, setShowBtns] = useState<boolean>(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(516);
  const isResizing = useRef(false);


  const handleCancel = () => {
    // Wenn activeTurbine eine Turbine enthält, übergebe deren ID an cancelEdit
    if (activeTurbine.length > 0) {
      onCancel(activeTurbine[0].id); // Nutze die ID der ersten Turbine in activeTurbine
    } else {
      onCancel(); // Wenn activeTurbine leer ist, setze es einfach auf ein leeres Array zurück
    }
  };


  const handleMouseEnter = () => setShowBtns(true);
  const handleMouseLeave = () => setShowBtns(false);

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
      <div className="sidebar-btn-container" style={{ flexDirection: 'row', gap: '5%', width: '80%' }}>
        {(<button
          className={`sidebar-button shown ${placementMode === PlacementModes.Turbine ? 'active' : ''}`}
          onClick={() => setPlacementMode(PlacementModes.Turbine)}
        >
          Setze Turbine
        </button>)}
        {(<button
          className={`sidebar-button shown ${placementMode === PlacementModes.Mast ? 'active' : ''}`}
          onClick={() => setPlacementMode(PlacementModes.Mast)}
        >
          Setze Mast
        </button>)}
        {(<button
          className={`sidebar-button shown ${placementMode === PlacementModes.None ? 'active' : ''}`}
          onClick={() => setPlacementMode(PlacementModes.None)}
        >
          Setze nichts
        </button>)}
      </div>
      <hr style={{ width: '100%' }} />
      <div className="sidebar-btn-container" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {(<button
          className={`sidebar-button ${showBtns ? 'shown' : ''} ${mode === Modes.Toolbar ? 'shown active' : ''}`}
          onClick={() => setMode(Modes.Toolbar)}
        >
          Turbinen - Import/Export
        </button>)}
        {(<button
          className={`sidebar-button ${showBtns ? 'shown' : ''} ${mode === Modes.TurbineTypes ? 'shown active' : ''}`}
          onClick={() => setMode(Modes.TurbineTypes)}
        >
          Liste Turbinentypen
        </button>)}
        {(<button
          className={`sidebar-button ${showBtns ? 'shown' : ''} ${(mode === Modes.NewTurbine || mode === Modes.EditTurbine) ? 'shown active' : ''}`}
          onClick={() => setMode(Modes.NewTurbine)}
        >
          Neue Turbine
        </button>)}
        {(<button
          className={`sidebar-button ${showBtns ? 'shown' : ''} ${(mode === Modes.GroundAreas) ? 'shown active' : ''}`}
          onClick={() => setMode(Modes.GroundAreas)}
        >
          Ground Areas
        </button>)}
        {(<button
          className={`sidebar-button ${showBtns ? 'shown' : ''} ${(mode === Modes.NewMast || mode === Modes.EditMast) ? 'shown active' : ''}`}
          onClick={() => setMode(Modes.NewMast)}
        >
          Neuer Mast
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
          <Toolbar turbines={turbines} setTurbines={setTurbines} masts={masts} setMasts={setMasts} groundAreas={groundAreas} setGroundAreas={setGroundAreas} turbineTypes={turbineTypes} setTurbineTypes={setTurbineTypes}/>
        )}
        {mode === Modes.TurbineTypes && (
          <TurbineTypesList 
            turbineTypes={turbineTypes}
            setTurbineTypes={setTurbineTypes}
          />
        )}
        {(mode === Modes.NewTurbine) && (
          <TurbineForm
            id={activeTurbine[0]?.id}
            lat={activeTurbine[0]?.lat || mapCenter.x}
            long={activeTurbine[0]?.long || mapCenter.y}
            name={`Wind Turbine ${turbines.length + 1}`}
            type={turbineTypes.find(t => t.name === 'DefaultNull')!}
            groundAreaID={""}
            available={true}
            onSave={(turbine: Turbine) => onSave(turbine)} // Sichere Übergabe der spezifischen Turbine
            onCancel={handleCancel}
            onDelete={onDelete}
            turbineTypes={turbineTypes}
          />
        )}
        {(mode === Modes.EditTurbine) && (
          activeTurbine.map((at: Turbine) => (
            <TurbineForm
              key={at.id}
              id={at.id}
              lat={at.lat}
              long={at.long}
              name={at.name}
              type={at.type}
              groundAreaID={at.groundAreaID!}
              available={at.available}
              onSave={(turbine: Turbine) => onSave(turbine)}
              onCancel={handleCancel}
              onDelete={onDelete}
              turbineTypes={turbineTypes}
            />
          ))
        )}
        {(mode === Modes.GroundAreas) && (
          <GroundAreas
            groundAreas={groundAreas}
            activeGroundAreas={activeGroundAreas}
            onUpdate={(updated) => {
              const updatedList = groundAreas.map((g) =>
                g.properties.id === updated.properties.id ? updated : g
              );
              setGroundAreas(updatedList);
            }}
            onDelete={(id) => {
              setGroundAreas(groundAreas.filter((g) => g.properties.id !== id));
            }}
          />
        )}
        {(mode === Modes.NewMast) && (
          <MastForm
            id={activeMasts[0]?.id}
            lat={activeMasts[0]?.lat || mapCenter.x}
            long={activeMasts[0]?.long || mapCenter.y}
            name={`Mast ${masts.length + 1}`}
            windrose={activeMasts[0]?.windrose || NullWindrose2}
            measureHeight={activeMasts[0]?.measureHeight || 10}
            available={true}
            onSave={(mast: Mast) => onSaveMast(mast)}
            onCancel={handleCancel}
            onDelete={onDeleteMast}
          />
        )}
        {(mode === Modes.EditMast) && (
          activeMasts.map((am: Mast) => (
            <MastForm 
              key={am.id}
              id={am.id}
              name={am.name}
              lat={am.lat}
              long={am.long}
              windrose={am.windrose}
              measureHeight={am.measureHeight}
              available={am.available}
              onSave={(mast: Mast) => onSaveMast(mast)}
              onCancel={handleCancel}
              onDelete={onDeleteMast}
            />
          ))
        )}
        {mode === Modes.Calculate && (
          <CalculatePower
            turbines={turbines}
            setTurbines={setTurbines}
            masts={masts}
            groundAreas={groundAreas}
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
