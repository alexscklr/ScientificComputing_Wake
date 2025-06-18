import React, { useRef, useState } from 'react';
import { Turbine } from '../../types/Turbine';
import { WindroseData } from '../../types/WindRose';
import { calculateWithoutWake } from '../../utils/CalculateWithoutWake';
import { calculateWithWake } from '../../utils/CalculateWithWake'; // 👈 wichtig
import '../styles/CalculatePower.css';

interface CalculatePowerProps {
  turbines: Turbine[];
  setTurbines: React.Dispatch<React.SetStateAction<Turbine[]>>;
  windrose: WindroseData;
  setWindrose: (wr: WindroseData) => void;
}

const CalculatePower: React.FC<CalculatePowerProps> = ({
  turbines,
  setTurbines,
  windrose,
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [tab, setTab] = useState<'noWake' | 'wake'>('noWake');
  const energyWin = useRef<number>(0);

  const handleCalculation = () => {
    setProgress(0); // Reset Progress
    if (tab === 'noWake') {
      calculateWithoutWake({
        windrose,
        turbines,
        progress,
        setTurbines,
        setProgress,
        energyWin,
        elevation: windrose.elevation,
      });
    } else if (tab === 'wake') {
      calculateWithWake({
        windrose,
        turbines,
        progress,
        setTurbines,
        setProgress,
        energyWin,
        elevation: windrose.elevation,
      });
    }
  };

  return (
    <div className="calc-container">
      <div className="tab-wrapper">
        <button
          className={`tab-btn ${tab === 'noWake' ? 'active' : ''}`}
          onClick={() => setTab('noWake')}
        >
          Ohne Wake
        </button>
        <button
          className={`tab-btn ${tab === 'wake' ? 'active' : ''}`}
          onClick={() => setTab('wake')}
        >
          Mit Wake
        </button>
      </div>

      <button className="calculate-btn" onClick={handleCalculation}>
        🔍 Berechne {tab === 'noWake' ? 'ohne Wake' : 'mit Wake'}
      </button>

      {progress > 0 && progress < turbines.length && (
        <div className="progress-bar-wrapper">
          <div
            className="progress-bar"
            style={{ width: `${(progress / turbines.length) * 100}%` }}
          />
        </div>
      )}

      <div className="result-card">
        Gesamtenergiegewinn: {Math.round(energyWin.current * 100) / 100} kW
      </div>

      <hr style={{ width: '61.8%' }} />

      <div className="result-wrapper">
        {turbines.map((turbine) => (
          <div className="result-card" key={turbine.id}>
            <span className="result-name">{turbine.name}</span>
            {tab === 'noWake' && turbine.powerWithoutWake !== undefined && (
              <span className="result-power">
                🌬️ {turbine.powerWithoutWake.toFixed(2)} kW (ohne Wake)
              </span>
            )}
            {tab === 'wake' && turbine.powerWithWake !== undefined && (
              <span className="result-power">
                💨 {turbine.powerWithWake.toFixed(2)} kW (mit Wake)
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalculatePower;

