import React from 'react';
import { Turbine } from '../../types/Turbine';
import { AreaFeature } from '../../types/GroundArea'
import '../styles/Toolbar.css';
import { Mast } from '../../types/WindRose';

type Props = {
  turbines: Turbine[];
  setTurbines: (t: Turbine[]) => void;
  masts: Mast[];
  setMasts: (m: Mast[]) => void;
  groundAreas: AreaFeature[];
  setGroundAreas: (areas: AreaFeature[]) => void;
};

const Toolbar: React.FC<Props> = ({
  turbines,
  setTurbines,
  masts,
  setMasts,
  groundAreas,
  setGroundAreas,
}) => {

  const exportData = () => {
    const exportObject = {
      turbines,
      masts,
      groundAreas,
    };

    const dataStr = JSON.stringify(exportObject, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'windpark.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);

        if (!json || typeof json !== 'object') {
          alert('⚠️ Ungültiges Format: Kein Objekt gefunden');
          return;
        }

        const turbinesData = Array.isArray(json.turbines) ? json.turbines : [];
        const mastsData = Array.isArray(json.masts) ? json.masts : [];
        const areasData = Array.isArray(json.groundAreas) ? json.groundAreas : [];

        setTurbines(turbinesData);
        setMasts(mastsData);
        setGroundAreas(areasData);

      } catch (err) {
        alert('⚠️ Fehler beim Laden der Datei');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="toolbar-section">
      <h3>🌪️ Turbinen & Flächen</h3>
      <button onClick={exportData}>📤 Exportieren</button>
      <label>
        📥 Importieren:
        <input type="file" accept="application/json" onChange={importData} />
      </label>
    </div>
  );
};

export default Toolbar;
