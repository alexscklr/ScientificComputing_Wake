import React, { useRef, useState, useEffect, useMemo } from 'react';
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
  const energyWinRaw = useRef<number>(0);
  const energyWinWake = useRef<number>(0);

  const [wakeDecayConst, setWakeDecayConst] = useState<number>(0.08);
  const [maxWakeDistance, setMaxWakeDistance] = useState<number>(5);

  const [turbines1, setTurbines1] = useState<Turbine[]>(turbines);
  const [turbines2, setTurbines2] = useState<Turbine[]>(turbines);

  useEffect(() => {
    setTurbines1(turbines);
    setTurbines2(turbines);
  }, [turbines]);


  useEffect(() => {
    if (turbines1.length === 0 && turbines2.length === 0) {
      setTurbines([]); // Falls beide leer sind, setze Parent auch leer
      return;
    }

    // Falls einer der Arrays leer ist, gib den anderen zurück
    if (turbines1.length === 0) {
      setTurbines(turbines2);
      return;
    }
    if (turbines2.length === 0) {
      setTurbines(turbines1);
      return;
    }

    // Map von turbines2 nach id für schnelles Nachschlagen
    const map2 = new Map(turbines2.map(t => [t.id, t]));

    // Kombiniere turbines1 und turbines2 anhand id
    const combined = turbines1.map(t1 => {
      const t2 = map2.get(t1.id);
      return {
        ...t1,
        powerWithWake: t2?.powerWithWake ?? 0,
        // Falls du weitere Felder brauchst, ergänze hier
      };
    });

    setTurbines(combined);
  }, [turbines1, turbines2]);


  const handleNoWakeCalc = () => {
    calculateWithoutWake({
      windrose,
      turbines: turbines1,
      setTurbines: setTurbines1,
      energyWin: energyWinRaw,
      elevation: windrose.elevation,
    });
  }
  const handleWakeCalc = () => {
    calculateWithWake({
      windrose,
      turbines: turbines2,
      setTurbines: setTurbines2,
      energyWin: energyWinWake,
      elevation: windrose.elevation,
      wakeDecayConstant: wakeDecayConst,
      maxWakeDistance: maxWakeDistance,
    });
  }

  const handleCalculation = (event: any) => {
    event.preventDefault();
    setTurbines1(turbines);
    setTurbines2(turbines);
    handleNoWakeCalc();
    handleWakeCalc();
  }

  return (
    <div className="calc-container">

      {/* Berechnung mit Wake */}
      <div className="wake-section">
        <h3>Berechnung mit Wake-Effekten</h3>
        <form onSubmit={handleCalculation} className="parameter-form">
          <div className="form-group">
            <label>
              Wake-Decay-Constant k
              <input
                type="number"
                min="0"
                max="1"
                step="0.005"
                value={wakeDecayConst}
                onChange={(e) => setWakeDecayConst(e.target.valueAsNumber)}
                required
              />
            </label>
            <label>
              MaxWakeDistance als Vielfaches des Rotorradius
              <input
                type="number"
                min="0"
                step="0.5"
                value={maxWakeDistance}
                onChange={(e) => setMaxWakeDistance(e.target.valueAsNumber)}
                required
              />
            </label>
          </div>
          <button type="submit" className="calculate-btn">
            🔍 Berechne mit Wake
          </button>
        </form>
      </div>

      {/* Ergebnisanzeige */}
      <div className="results-container">
        <div className="result-card total-energy">
          Gesamtenergiegewinn: <br />
          🌬️ Ohne Wake: {(Math.round(energyWinRaw.current * 100) / 100).toFixed(2)} kW<br />
          💨 Mit Wake: {(Math.round(energyWinWake.current * 100) / 100).toFixed(2)} kW<br />
          <span style={{ color: 'red' }}>Verlust von {(Math.round((1 - energyWinWake.current / energyWinRaw.current) * 100)).toFixed(2)} %</span>
        </div>

        <div className="result-wrapper">
          {turbines.map((turbine) => (
            <div className="result-card" key={turbine.id}>
              <span className={turbine.available ? "result-name" : "result-name unavailable"}>{turbine.name}</span>
              {'powerWithoutWake' in turbine && turbine.powerWithoutWake !== undefined && (
                <span className={turbine.available ? "result-power" : "result-power unavailable"}>
                  🌬️ {turbine.powerWithoutWake.toFixed(2)} kW (ohne Wake)
                </span>
              )}
              {'powerWithWake' in turbine && turbine.powerWithWake !== undefined && (
                <span className={turbine.available ? "result-power" : "result-power unavailable"} style={{ marginLeft: '1rem' }}>
                  💨 {turbine.powerWithWake.toFixed(2)} kW (mit Wake)
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>

  );
};

export default CalculatePower;

