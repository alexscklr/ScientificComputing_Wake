import React from 'react';
import { Turbine, TurbineType } from '../../types/Turbine';
import { AreaFeature } from '../../types/GroundArea'
import turbinePresets from '../../assets/turbineTypes.json'
import '../styles/Toolbar.css';
import { Mast } from '../../types/WindRose';

type Props = {
  turbines: Turbine[];
  setTurbines: (t: Turbine[]) => void;
  masts: Mast[];
  setMasts: (m: Mast[]) => void;
  groundAreas: AreaFeature[];
  setGroundAreas: (areas: AreaFeature[]) => void;
  turbineTypes: TurbineType[];
  setTurbineTypes: (t: TurbineType[]) => void;
};

const Toolbar: React.FC<Props> = ({
  turbines,
  setTurbines,
  masts,
  setMasts,
  groundAreas,
  setGroundAreas,
  turbineTypes,
  setTurbineTypes
}) => {

  const exportData = () => {
    const exportObject = {
      turbines,
      masts,
      groundAreas,
      turbineTypes,
      setTurbineTypes
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
        const turbineTypesData = Array.isArray(json.turbineTypes) ? json.turbineTypes : [];

        if (!turbineTypesData.find((tt: TurbineType) => tt.name === 'DefaultNull')) {
          turbineTypesData.push(turbinePresets[0]);
        }
        turbinesData.array.forEach((t: Turbine) => {
          if (!turbineTypesData.find((tt: TurbineType) => tt.name === t.type.name)) {
            turbineTypesData.push(t.type);
          }
        });

        setTurbines(turbinesData);
        setMasts(mastsData);
        setGroundAreas(areasData);
        setTurbineTypes(turbineTypesData);

      } catch (err: any) {
        alert(`⚠️ Fehler beim Laden der Datei:  ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="toolbar-section">
      <h3>🌪️ Daten</h3>
      <button onClick={exportData}>📤 Exportieren</button>
      <label>
        📥 Importieren:
        <input type="file" accept="application/json" onChange={importData} />
      </label>
    </div>
  );
};

export default Toolbar;
