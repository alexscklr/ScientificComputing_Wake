import React, { useState } from 'react';
import '../styles/WindRoseComp.css';
import { WindroseData, WindroseEntry } from '../../types/WindRose';

interface WindRoseCompProps {
  windroseData?: WindroseData;
  setWindroseData: (wr: WindroseData) => void;
}

const WindRoseComp: React.FC<WindRoseCompProps> = ({ windroseData, setWindroseData }) => {
  const [fileName, setFileName] = useState<string>('');

  const mphToMs = (mph: number) => mph * 0.44704;

  const speedBins: [number, number][] = [
    [2.0, 4.9],
    [5.0, 6.9],
    [7.0, 9.9],
    [10.0, 14.9],
    [15.0, 19.9],
    [20.0, Infinity],
  ];

  const parseCsv = (csvString: string): WindroseData => {
    const lines = csvString
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('#'));

    let calmFrequency = 0;
    const data: WindroseEntry[] = [];

    for (const line of lines) {
      const parts = line.split(',').map((v) => v.trim());

      if (/^Direction/i.test(parts[0])) continue;
      if (!/^\d{3}-\d{3}/.test(parts[0])) continue;

      const directionLabel = parts[0];
      const [startStr, endStr] = directionLabel.split('-');
      const directionRange: [number, number] = [parseInt(startStr), parseInt(endStr)];

      const calm = parseFloat(parts[1]) || 0;
      const frequencies = parts.slice(2).map((v) => parseFloat(v) || 0);

      calmFrequency += calm;

      data.push({
        directionRange,
        frequencies,
      });
    }

    return {
      calmFrequency,
      speedBins,
      data,
    };
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
            ...parsedData,
            name: file.name,
          });
          setFileName(file.name);
        } else {
          console.error('Fehler beim Laden der Datei.');
        }
      };

      reader.readAsText(file);
    }
  };

  return (
    <div className="windrose-container">
      <h2>Windrose-Daten</h2>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      {fileName && <p>Hochgeladene Datei: {fileName}</p>}

      {windroseData ? (
        <div style={{ maxHeight: '500px', width: '100%', overflowY: 'auto' }}>
          <h3>{windroseData.name}</h3>
          <table className="windrose-table">
            <thead>
              <tr>
                <th>Richtung</th>
                {windroseData.speedBins.map((bin, i) => (
                  <th key={i}>
                    {bin[1] === Infinity ? `${bin[0]}+` : `${bin[0]}–${bin[1]}`} m/s
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {windroseData.data.map((entry, index) => (
                <tr key={index}>
                  <td>
                    {entry.directionRange[0]}–{entry.directionRange[1]}
                  </td>
                  {entry.frequencies.map((freq, i) => (
                    <td key={i}>{freq.toFixed(3)}</td>
                  ))}
                </tr>
              ))}
              <tr>
                <td><strong>Calm</strong></td>
                <td colSpan={windroseData.speedBins.length}>{windroseData.calmFrequency.toFixed(3)} %</td>
              </tr>
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

