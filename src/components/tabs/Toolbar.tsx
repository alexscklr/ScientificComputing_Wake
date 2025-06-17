import React from 'react';
import { Turbine } from '../../types/Turbine';
import '../styles/Toolbar.css';

type Props = {
  turbines: Turbine[];
  setTurbines: (t: Turbine[]) => void;
};

const Toolbar: React.FC<Props> = ({ turbines, setTurbines }) => {

  const exportTurbines = () => {
    const dataStr = JSON.stringify(turbines, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'windpark.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importTurbines = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (Array.isArray(json)) {
          setTurbines(json);
        } else {
          alert('⚠️ Ungültiges Format');
        }
      } catch {
        alert('⚠️ Fehler beim Laden der Datei');
      }
    };
    reader.readAsText(file);
  };




  return (
    <div className="toolbar-section">
      <h3>🌪️ Turbinen</h3>
      <button onClick={exportTurbines}>📤 Exportieren</button>
      <label>
        📥 Importieren:
        <input type="file" accept="application/json" onChange={importTurbines} />
      </label>
    </div>


  );
};

export default Toolbar;
