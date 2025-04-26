import React, { useState } from 'react';
import '../styles/WindRoseComp.css';
import { WindroseData, WindroseEntry, SpeedUnits } from '../../types/WindRose';

interface WindRoseCompProps {
  windroseData?: WindroseData;
  setWindroseData: (wr: WindroseData) => void;
}

const WindRoseComp: React.FC<WindRoseCompProps> = ({ windroseData, setWindroseData }) => {
  const [fileName, setFileName] = useState<string>('');

  const mphToMs = (mph: number) => mph * 0.44704;
  const mphToKph = (mph: number) => mph * 1.690934;
  const msToMph = (ms: number) => ms / 0.44704;
  const kphToMph = (kmh: number) => kmh / 1.690934;
  const msToKph = (ms: number) => ms * 3.6;
  const kphToMs = (kmh: number) => kmh / 3.6;

  const speedBins: [number, number][] = [
    [2.0, 4.9],
    [5.0, 6.9],
    [7.0, 9.9],
    [10.0, 14.9],
    [15.0, 19.9],
    [20.0, Infinity],
  ];

  const speedBinsMS: [number, number][] = speedBins.map(([v1, v2]) => {
    return [Math.round(mphToMs(v1) * 100) / 100, Math.round(mphToMs(v2) * 100) / 100];
  })

  const parseCsv = (csvString: string): WindroseData => {
    const lines = csvString
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('#'));

    let calmFrequency = 0;
    const data: WindroseEntry[] = [];

    let speedBins: [number, number][] = [];

    for (const line of lines) {
      const parts = line.split(',').map((v) => v.trim());

      if (/^Direction/i.test(parts[0])) {
        // Hier extrahieren wir die Speed-Bins
        speedBins = parts.slice(2).map((range) => {
          const [startStr, endStr] = range.split(/\s+/);
          const start = parseFloat(startStr);
          const end = endStr === '+' ? Infinity : parseFloat(endStr);
          return [start, end];
        }) as [number, number][];
        continue;
      }

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
      id: Date.now(),
      speedUnit: SpeedUnits.mph,
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

  const changeSpeedUnit = (newUnit : string) => {
    if (windroseData?.speedUnit === newUnit) return;
    if (windroseData?.speedUnit === SpeedUnits.mph && newUnit === SpeedUnits.ms) {
      setWindroseData({
        ...windroseData,
        speedUnit: newUnit,
        speedBins: windroseData.speedBins.map(([v1,v2]) => {return [Math.round(mphToMs(v1)*100)/100, Math.round(mphToMs(v2)*100)/100]})
      });
      return;
    }
    if (windroseData?.speedUnit === SpeedUnits.mph && newUnit === SpeedUnits.kph) {
      setWindroseData({
        ...windroseData,
        speedUnit: newUnit,
        speedBins: windroseData.speedBins.map(([v1,v2]) => {return [Math.round(mphToKph(v1)*100)/100, Math.round(mphToKph(v2)*100)/100]})
      });
      return;
    }
    if (windroseData?.speedUnit === SpeedUnits.ms && newUnit === SpeedUnits.mph) {
      setWindroseData({
        ...windroseData,
        speedUnit: newUnit,
        speedBins: windroseData.speedBins.map(([v1,v2]) => {return [Math.round(msToMph(v1)*100)/100, Math.round(msToMph(v2)*100)/100]})
      });
      return;
    }
    if (windroseData?.speedUnit === SpeedUnits.kph && newUnit === SpeedUnits.mph) {
      setWindroseData({
        ...windroseData,
        speedUnit: newUnit,
        speedBins: windroseData.speedBins.map(([v1,v2]) => {return [Math.round(kphToMph(v1)*100)/100, Math.round(kphToMph(v2)*100)/100]})
      });
      return;
    }
    if (windroseData?.speedUnit === SpeedUnits.ms && newUnit === SpeedUnits.kph) {
      setWindroseData({
        ...windroseData,
        speedUnit: newUnit,
        speedBins: windroseData.speedBins.map(([v1,v2]) => {return [Math.round(msToKph(v1)*100)/100, Math.round(msToKph(v2)*100)/100]})
      });
      return;
    }
    if (windroseData?.speedUnit === SpeedUnits.kph && newUnit === SpeedUnits.ms) {
      setWindroseData({
        ...windroseData,
        speedUnit: newUnit,
        speedBins: windroseData.speedBins.map(([v1,v2]) => {return [Math.round(kphToMs(v1)*100)/100, Math.round(kphToMs(v2)*100)/100]})
      });
      return;
    }
  };

  return (
    <div className="windrose-container">
      <h2>Windrose-Daten</h2>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      {fileName && <p>Hochgeladene Datei: {fileName}</p>}
      {(windroseData) && (<label style={{margin: '10px'}}>
        Einheit:
        <select
          value={windroseData.speedUnit}
          onChange={(e) =>
            { changeSpeedUnit(e.target.value) }
          }
          style={{marginLeft: '10px'}}
        >
          {Object.values(SpeedUnits).map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
      </label>)}

      {windroseData ? (
        <div style={{ maxHeight: '500px', width: '100%', overflowY: 'auto' }}>
          <h3>{windroseData.name}</h3>
          <table className="windrose-table">
            <thead>
              <tr>
                <th>Richtung</th>
                {windroseData.speedBins.map((bin, i) => (
                  <th key={i} style={{whiteSpace:'nowrap', border: '1px solid #ccc'}}>
                    {isNaN(bin[1]) ? `${bin[0]}+` : `${bin[0]}–${bin[1]}`} {windroseData.speedUnit}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {windroseData.data.map((entry, index) => (
                <tr key={index}>
                  <td style={{border: '1px solid #ccc'}}>
                    {entry.directionRange[0].toFixed(0)}–{entry.directionRange[1].toFixed(0)}
                  </td>
                  {entry.frequencies.map((freq, i) => (
                    <td key={i} style={{border: '1px solid #ccc'}}>{freq.toFixed(3)}</td>
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

