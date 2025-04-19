import { useState } from 'react';

type Mode = 'toolbar' | 'windrose' | 'new' | 'edit';

export const useMode = () => {
  const [mode, setMode] = useState<Mode>('toolbar');

  return {
    mode,
    setMode,
  };
};
