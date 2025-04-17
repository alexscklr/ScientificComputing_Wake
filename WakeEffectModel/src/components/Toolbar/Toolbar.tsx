import React from 'react';
import { WindTurbine } from '../TurbineList';

type Props = {
  turbines: WindTurbine[];
  setTurbines: (t: WindTurbine[]) => void;
};

const Toolbar: React.FC<Props> = ({ turbines, setTurbines }) => {
  const exportToJson = () => {
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

  const importFromJson = (event: React.ChangeEvent<HTMLInputElement>) => {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '1rem' }}>
      <button onClick={exportToJson}>📤 Exportieren</button>
      <label>
        📥 Importieren:
        <input type="file" accept="application/json" onChange={importFromJson} />
      </label>
    </div>
  );
};

export default Toolbar;
