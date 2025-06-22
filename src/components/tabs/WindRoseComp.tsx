import React, { useRef, useState } from 'react';
import '../styles/WindRoseComp.css';
import { WindroseData, SpeedUnits, NullWindrose } from '../../types/WindRose';
import { parseCsvToWindrose, convertToWindrose } from '../../utils/UploadWindroseCSV';
import { convertSpeedUnits } from '../../utils/CalculationFunctions';
import ReactECharts from 'echarts-for-react';

interface WindRoseCompProps {
  windroseData?: WindroseData;
  setWindroseData: (wr: WindroseData) => void;
}

const WindRoseComp: React.FC<WindRoseCompProps> = ({ windroseData, setWindroseData }) => {
  const [fileName, setFileName] = useState<string>('');
  const [station, setStation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const dataCount = useRef<number>(0);
  const dataErrors = useRef<number>(0);
  const frequencySum = useRef<number>(0);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        const csvString = e.target?.result as string;

        if (csvString) {
          const parsedData = parseCsvToWindrose(csvString);
          setWindroseData({
            ...parsedData,
            name: file.name,
            speedUnit: parsedData.speedUnit ?? SpeedUnits.knt, // Default-Einheit setzen
          });
          setFileName(file.name);
        } else {
          console.error('Fehler beim Laden der Datei.');
        }
      };

      reader.readAsText(file);
    }
  };

  const handleApiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const start = new Date(startDate);
    const end = new Date(endDate);

    const params = new URLSearchParams({
      station,
      format: 'onlycomma',
      tz: 'UTC',
      year1: start.getFullYear().toString(),
      month1: (start.getMonth() + 1).toString(),
      day1: start.getDate().toString(),
      year2: end.getFullYear().toString(),
      month2: (end.getMonth() + 1).toString(),
      day2: end.getDate().toString(),
    });

    params.append('data', 'drct');
    params.append('data', 'sped');

    try {
      const response = await fetch(
        `https://mesonet.agron.iastate.edu/cgi-bin/request/asos.py?${params.toString()}`
      );
      const text = await response.text();
      const windrose = convertToWindrose(text, dataCount, dataErrors, frequencySum);

      windrose.name = `API_${station}_${startDate}_bis_${endDate}`;

      setWindroseData(windrose);
      setFileName(windrose.name);
    } catch (err) {
      console.error('API-Fehler:', err);
      alert('Fehler beim Abrufen der Winddaten.');
    }
  };

  const changeSpeedUnit = (newUnit: string) => {
    if (!windroseData || windroseData.speedUnit === newUnit) return;

    let newSpeedBins: [number, number][] = windroseData.speedBins.map(([v1, v2]) => [
      Math.round(convertSpeedUnits(v1, windroseData.speedUnit, newUnit as SpeedUnits) * 100) / 100,
      isNaN(v2) ? NaN : Math.round(convertSpeedUnits(v2, windroseData.speedUnit, newUnit as SpeedUnits) * 100) / 100,
    ])

    setWindroseData({
      ...windroseData,
      speedUnit: newUnit as SpeedUnits,
      speedBins: newSpeedBins,
    });
  };

  return (
    <div className="windrose-container">
      <h2>Windrose-Daten</h2>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      {fileName && <p>Hochgeladene Datei: {fileName}</p>}

      {windroseData && (
        <label>
          Einheit:
          <select value={windroseData.speedUnit} onChange={(e) => changeSpeedUnit(e.target.value)}>
            {Object.values(SpeedUnits).map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </label>
      )}

      {windroseData && (
        <label>
          Messhöhe:
          <input
            type="number"
            value={windroseData.elevation}
            onChange={(e) => setWindroseData({ ...windroseData, elevation: +e.target.value })}
          />
        </label>
      )}

      <h2>
        Windrose über API (
        <a
          href="https://mesonet.agron.iastate.edu/sites/networks.php?network=DE__ASOS&format=html"
          target="_blank"
          rel="noreferrer"
        >
          Iowa Environmental Mesonet
        </a>
        ) abrufen
      </h2>
      <form onSubmit={handleApiSubmit} className="windrose-form">
        <div className="form-group">
          <label>
            Station (z.B. EDXW):
            <input type="text" value={station} onChange={(e) => setStation(e.target.value.toUpperCase())} required />
          </label>
        </div>
        <div className="form-group">
          <label>
            Startdatum:
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          </label>
        </div>
        <div className="form-group">
          <label>
            Enddatum:
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
          </label>
        </div>

        <button type="submit">Daten abrufen</button>
      </form>

      {windroseData && windroseData !== NullWindrose ? (
        <>
          <h3 id="windrose-title">{windroseData.name}</h3>
          <div className="chart-div">
            <ReactECharts option={getWindroseChartOption(windroseData)} className="chart-container" />
          </div>
          <p>
            Data Count : {dataCount.current} | Errors :{' '}
            {Math.round((dataErrors.current / dataCount.current) * 10000) / 100}%
          </p>
        </>
      ) : (
        <p className="no-file-message">Bitte lade eine CSV-Datei hoch.</p>
      )}

    </div>
  );
};

function getWindroseChartOption(windroseData: WindroseData) {
  // Labels für Richtungsbereiche
  const directions = windroseData.data.map(entry => {
    const [start, end] = entry.directionRange;
    return `${start}°–${end}°`;
  });
  const binCount = windroseData.speedBins.length;

  const seriesData = [];

  for (let binIdx = 0; binIdx < binCount; binIdx++) {
    const bin = windroseData.speedBins[binIdx];
    const binLabel = `${bin[0]}-${bin[1] === Infinity ? '+' : bin[1]} ${windroseData.speedUnit}`;

    // Frequenzen je Richtung für das aktuelle Speed-Bin
    const values = windroseData.data.map(entry => entry.frequencies[binIdx] ?? 0);

    seriesData.push({
      name: binLabel,
      type: 'bar',
      coordinateSystem: 'polar',  // <--- Wichtig!
      stack: 'wind',
      data: values,
    });
  }

  return {
  legend: {
    bottom: 20,
    type: 'scroll',
    orient: 'horizontal',
    left: 'center',
    itemWidth: 20,
    itemHeight: 14,
  },
  polar: {
    radius: '70%',
    center: ['50%', '50%'], // Plot etwas nach oben
  },
  angleAxis: {
    type: 'category',
    data: directions,
    startAngle: 90,
  },
  radiusAxis: {
    min: 0,
  },
  series: seriesData,
};
}


export default WindRoseComp;
