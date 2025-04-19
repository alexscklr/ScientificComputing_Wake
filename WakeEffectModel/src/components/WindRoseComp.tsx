import React, { useState } from 'react';
import './styles/WindRoseComp.css'; // Stelle sicher, dass die CSS-Datei importiert wird

// Typen definieren
interface WindDirectionData {
  direction: string;
  frequency: number;
  averageSpeed?: number;
}

interface WindroseType {
  id: number;
  name: string;
  data: WindDirectionData[];
  location?: {
    lat: number;
    long: number;
  };
}

const WindRoseComp: React.FC = () => {
  const [windroseData, setWindroseData] = useState<WindroseType | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const parseCsv = (csvString: string) => {
    const lines = csvString.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const result: WindDirectionData[] = [];

    lines.forEach((line, index) => {
      const values = line.split(',').map(value => value.trim());

      if (values.length >= 7) {
        const row = {
          direction: values[0] || '',
          frequency: parseFloat(values[1]) || 0,
          averageSpeed: values[2] ? parseFloat(values[2]) : undefined,
        };

        if (row.direction && !isNaN(row.frequency)) {
          result.push(row);
        } else {
          console.warn(`Ungültige Daten in Zeile ${index + 1}:`, line);
        }
      } else {
        console.warn(`Unzureichende Spalten in Zeile ${index + 1}:`, line);
      }
    });

    return result;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        const csvString = e.target?.result as string;

        if (csvString) {
          const parsedData = parseCsv(csvString);
          setWindroseData({
            id: 1,
            name: file.name,
            data: parsedData,
          });
          setFileName(file.name);
        } else {
          console.error('Fehler beim Laden der Datei.');
        }
      };

      reader.onerror = () => {
        console.error('Fehler beim Lesen der Datei.');
      };

      reader.readAsText(file);
    }
  };

  return (
    <div className="windrose-container">
      <h2>Windrose-Daten</h2>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
      />
      {fileName && <p>Hochgeladene Datei: {fileName}</p>}

      {windroseData ? (
        <div style={{maxHeight: '500px', width: '100%', overflow: 'scroll'}}>
          <h3>{windroseData.name}</h3>
          <table className="windrose-table">
            <thead>
              <tr>
                <th>Richtung</th>
                <th>Häufigkeit (%)</th>
                <th>Durchschnittsgeschw. (m/s)</th>
              </tr>
            </thead>
            <tbody>
              {windroseData.data.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.direction}</td>
                  <td>{entry.frequency.toFixed(2)}</td>
                  <td>{entry.averageSpeed ? entry.averageSpeed.toFixed(2) : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="no-file-message">Bitte lade eine CSV-Datei hoch.</p>
      )}
    </div>
  );
};

export default WindRoseComp;
