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
  const [sidebarHeight, setSidebarHeight] = useState<number>(300); // Default height for mobile
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);
  const isResizing = useRef(false);
  const resizeHandleRef = useRef<HTMLDivElement>(null);

  // Detect mobile viewport
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Attach non-passive touch listener for resize handle
  React.useEffect(() => {
    const handle = resizeHandleRef.current;
    if (handle) {
      const onTouchStart = (e: TouchEvent) => startResizing(e as any);
      handle.addEventListener('touchstart', onTouchStart, { passive: false });
      return () => {
        handle.removeEventListener('touchstart', onTouchStart);
      };
    }
  }, [isMobile]); // Re-run when layout changes (handle ref changes)

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

  const startResizing = (e: any) => {
    // Prevent default browser behavior to avoid text selection or scrolling initiation
    if (e.cancelable && (e.type === 'mousedown' || e.type === 'touchstart')) {
      e.preventDefault();
    }
    
    isResizing.current = true;
    
    document.addEventListener('mousemove', resizeSidebar);
    document.addEventListener('mouseup', stopResizing);
    
    // Add touch event listeners for resizing
    // passive: false is critical to allow preventDefault inside the handler if needed
    document.addEventListener('touchmove', resizeSidebarTouch, { passive: false });
    document.addEventListener('touchend', stopResizing);
  };

  const resizeSidebar = (e: MouseEvent) => {
    if (!isResizing.current) return;
    
    if (isMobile) {
      // Mobile: resize height (drag vertical)
      const newHeight = window.innerHeight - e.clientY;
      if (newHeight >= 100 && newHeight <= window.innerHeight * 0.9) {
        setSidebarHeight(newHeight);
      }
    } else {
      // Desktop: resize width (drag horizontal)
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 40 && newWidth <= window.innerWidth * 0.95) {
        setSidebarWidth(newWidth);
      }
    }
  };

  const resizeSidebarTouch = (e: TouchEvent) => {
    if (!isResizing.current) return;
    
    // Prevent scrolling while resizing
    if (e.cancelable) e.preventDefault();
    
    const touch = e.touches[0];
    
    if (isMobile) {
      // Mobile: resize height (drag vertical)
      const newHeight = window.innerHeight - touch.clientY;
      if (newHeight >= 100 && newHeight <= window.innerHeight * 0.9) {
        setSidebarHeight(newHeight);
      }
    } else {
      // Desktop: resize width (drag horizontal)
      const newWidth = window.innerWidth - touch.clientX;
      if (newWidth >= 40 && newWidth <= window.innerWidth * 0.95) {
        setSidebarWidth(newWidth);
      }
    }
  };

  const stopResizing = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', resizeSidebar);
    document.removeEventListener('mouseup', stopResizing);
    
    // Remove touch event listeners
    document.removeEventListener('touchmove', resizeSidebarTouch);
    document.removeEventListener('touchend', stopResizing);
  };

  const desktopStyle: React.CSSProperties = {
      width: sidebarWidth,
      position: 'relative',
      height: '100%',
      display: 'flex',
      flexDirection: 'column', 
      alignItems: 'center',
      transition: 'none',
      borderLeft: '1px solid #ccc',
      backgroundColor: '#363636'
  };

  const mobileStyle: React.CSSProperties = {
      width: '100vw',
      height: sidebarHeight,
      position: 'fixed',
      bottom: 0,
      left: 0,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: '#363636',
      borderTop: '1px solid #ccc',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.5)',
      transition: 'none'
  };

  return (
    <div className="sidebar-container" style={isMobile ? mobileStyle : desktopStyle}>
     {isMobile && (
        <div
          className='resize-handle-mobile'
          ref={resizeHandleRef}
          onMouseDown={startResizing}
          style={{
            width: '100%',
            height: '24px',
            minHeight: '24px',
            cursor: 'row-resize',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#2b2b2b',
            borderTopLeftRadius: '8px', 
            borderTopRightRadius: '8px'
          }}
        >
          <div style={{ width: '40px', height: '4px', backgroundColor: '#666', borderRadius: '2px' }}></div>
        </div>
      )}
      
      <div className="sidebar-btn-container" style={{ flexDirection: 'row', gap: '5%', width: '80%', marginTop: '15px' }}>
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
      <div 
        className="sidebar-btn-container" 
        onMouseEnter={handleMouseEnter} 
        onMouseLeave={handleMouseLeave}
        style={isMobile ? { 
          flexDirection: 'row', 
          overflowX: 'auto', 
          justifyContent: 'flex-start', 
          gap: '10px', 
          width: '95%',
          padding: '10px',
          minHeight: '60px',
          alignItems: 'center'
        } : {}}
      >
        {(<button
          className={`sidebar-button ${showBtns || isMobile ? 'shown' : ''} ${mode === Modes.Toolbar ? 'shown active' : ''}`}
          onClick={() => setMode(Modes.Toolbar)}
          style={isMobile ? { minWidth: '130px', width: 'auto', height: '40px', fontSize: '16px' } : {}}
        >
          Tools
        </button>)}
        {(<button
          className={`sidebar-button ${showBtns || isMobile ? 'shown' : ''} ${mode === Modes.TurbineTypes ? 'shown active' : ''}`}
          onClick={() => setMode(Modes.TurbineTypes)}
          style={isMobile ? { minWidth: '140px', width: 'auto', height: '40px', fontSize: '16px' } : {}}
        >
          Turbinen-Arten
        </button>)}
        {(<button
          className={`sidebar-button ${showBtns || isMobile ? 'shown' : ''} ${(mode === Modes.NewTurbine || mode === Modes.EditTurbine) ? 'shown active' : ''}`}
          onClick={() => setMode(Modes.NewTurbine)}
          style={isMobile ? { minWidth: '130px', width: 'auto', height: '40px', fontSize: '16px' } : {}}
        >
          Neue Turbine
        </button>)}
        {(<button
          className={`sidebar-button ${showBtns || isMobile ? 'shown' : ''} ${(mode === Modes.GroundAreas) ? 'shown active' : ''}`}
          onClick={() => setMode(Modes.GroundAreas)}
          style={isMobile ? { minWidth: '130px', width: 'auto', height: '40px', fontSize: '16px' } : {}}
        >
          Ground Areas
        </button>)}
        {(<button
          className={`sidebar-button ${showBtns || isMobile ? 'shown' : ''} ${(mode === Modes.NewMast || mode === Modes.EditMast) ? 'shown active' : ''}`}
          onClick={() => setMode(Modes.NewMast)}
          style={isMobile ? { minWidth: '130px', width: 'auto', height: '40px', fontSize: '16px' } : {}}
        >
          Neuer Mast
        </button>)}
        {(<button
          className={`sidebar-button ${showBtns || isMobile ? 'shown' : ''} ${mode === Modes.Calculate ? 'shown active' : ''}`}
          onClick={() => setMode(Modes.Calculate)}
          style={isMobile ? { minWidth: '130px', width: 'auto', height: '40px', fontSize: '16px' } : {}}
        >
          Berechnen
        </button>)}
        
        {!isMobile && !showBtns && (
          <div className="more-tabs-hint">
            ▼
          </div>
        )}
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
      {!isMobile && (
      <div
        className='resize-handle'
        ref={resizeHandleRef}
        onMouseDown={startResizing}
        style={{ cursor: 'col-resize' }}
      >
        |||
      </div>
      )}
    </div>
  );
};

export default Sidebar;
