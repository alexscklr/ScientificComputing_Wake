import React, { createContext, useContext, useState } from 'react';

export type Mode = 'toolbar' | 'windrose' | 'new' | 'edit' | 'calculate';

export enum Modes {
  Toolbar = 'toolbar',
  Windrose = 'windrose',
  New = 'new',
  Edit = 'edit',
  Calculate = 'calculate'
}

interface ModeContextProps {
  mode: Mode;
  setMode: (mode: Mode) => void;
}

const ModeContext = createContext<ModeContextProps | undefined>(undefined);

export const ModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<Mode>(Modes.Toolbar);

  return (
    <ModeContext.Provider value={{ mode, setMode }}>
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
