import React, { createContext, useContext, useState } from 'react';

export type Mode = 'toolbar' | 'turbineTypes' | 'windrose' | 'newTurbine' | 'editTurbine' | 'newMast' | 'editMast' | 'groundAreas' | 'calculate';

export enum Modes {
  Toolbar = 'toolbar',
  TurbineTypes = 'turbineTypes',
  Windrose = 'windrose',
  NewTurbine = 'newTurbine',
  EditTurbine = 'editTurbine',
  NewMast = 'newMast',
  EditMast = 'editMast',
  GroundAreas = 'groundAreas',
  Calculate = 'calculate'
}

export type PlacementMode = 'turbine' | 'mast' | 'none';

export enum PlacementModes {
  Turbine = 'turbine',
  Mast = 'mast',
  None = 'none',
}



interface ModeContextProps {
  mode: Mode;
  setMode: (mode: Mode) => void;
  placementMode: PlacementMode;
  setPlacementMode: (pm: PlacementMode) => void;
}

const ModeContext = createContext<ModeContextProps | undefined>(undefined);

export const ModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<Mode>(Modes.Toolbar);
  const [placementMode, setPlacementMode] = useState<PlacementMode>(PlacementModes.Turbine);

  return (
    <ModeContext.Provider value={{ mode, setMode, placementMode, setPlacementMode }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = () => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
};
