import React, { useRef, useState, useEffect } from 'react';
import { Turbine } from '../../types/Turbine';
import { WindroseData } from '../../types/WindRose';
import { calculateWithoutWake } from '../../utils/CalculateWithoutWake';
import { calculateWithWake } from '../../utils/CalculateWithWake'; // 👈 wichtig
import '../styles/CalculatePower.css';
import { AreaFeature } from '../../types/GroundArea';
import PopupMessage from '../parts/PopupMessage';

interface CalculatePowerProps {
  turbines: Turbine[];
  setTurbines: React.Dispatch<React.SetStateAction<Turbine[]>>;
  windrose: WindroseData;
  setWindrose: (wr: WindroseData) => void;
  groundAreas: AreaFeature[];
}

const CalculatePower: React.FC<CalculatePowerProps> = ({
  turbines,
  setTurbines,
  windrose,
  groundAreas
}) => {
  const [messageVisible, setMessageVisible] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const energyWinRaw = useRef<number>(0);
  const energyWinWake = useRef<number>(0);

  const [maxWakeDistance, setMaxWakeDistance] = useState<number>(5);
  const [timeInHr, setTimeInHr] = useState<number>(1);

  const [turbines1, setTurbines1] = useState<Turbine[]>(turbines);
  const [turbines2, setTurbines2] = useState<Turbine[]>(turbines);

  const [shouldCombineToggle, setShouldCombineToggle] = useState<boolean>(false);

  useEffect(() => {
    setTurbines1(turbines);
    setTurbines2(turbines);
  }, [turbines]);


  // Combine nur auslösen, wenn beide Berechnungen abgeschlossen sind
  useEffect(() => {
    if (
      turbines1.length > 0 &&
      turbines2.length > 0
    ) {
      const map2 = new Map(turbines2.map(t => [t.id, t]));
      const combined = turbines1.map(t1 => {
        const t2 = map2.get(t1.id);
        return {
          ...t1,
          powerWithoutWake: t1.powerWithoutWake ?? 0,
          powerWithWake: t2?.powerWithWake ?? 0,
        };
      });
      setTurbines(combined);
    }
  }, [shouldCombineToggle]);



  const handleNoWakeCalc = () => {
    calculateWithoutWake({
      windrose,
      turbines: turbines1,
      groundAreas: groundAreas,
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
      maxWakeDistance: maxWakeDistance,
      groundAreas: groundAreas
    });
  }

  const checkForTurbines = () => {
    if (turbines.length <= 0) {
      setMessage('Keine Turbinen vorhanden');
      setMessageVisible(true);
      return false;
    }
    return true;
  }
  const checkForWindrose = () => {
    if (windrose === undefined) {
      setMessage('Keine Windrose vorhanden');
      setMessageVisible(true);
      return false;
    }
    return true;
  }
  const checkForGroundAreas = () => {
    if (turbines.filter(t => t.groundAreaID === undefined).length > 0)
    {
      setMessage('Manche Turbinen haben keine GroundArea');
      setMessageVisible(true);
      return false;
    }

    return true;
  }

  const handleCalculation = (event: any) => {
    event.preventDefault();

    if (!checkForTurbines()) return;
    if (!checkForWindrose()) return;
    if (!checkForGroundAreas()) return;

    setTurbines1(turbines);
    setTurbines2(turbines);
    handleNoWakeCalc();
    handleWakeCalc();
    setShouldCombineToggle(!shouldCombineToggle);
  }

  return (
    <div className="calc-container">

      {/* Berechnung mit Wake */}
      <div className="wake-section">
        <h3>Berechnung mit Wake-Effekten</h3>
        <form onSubmit={handleCalculation} className="parameter-form">
          <div className="form-group">
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
            <label>
              Zeitraum der Energiegewinnung
              <input
                type="number"
                min="0"
                step="0.5"
                value={timeInHr}
                onChange={(e) => setTimeInHr(e.target.valueAsNumber)}
                required
              />
            </label>
          </div>
          <button type="submit" className="calculate-btn" style={{position: 'relative'}}>
            🔍 Berechne mit Wake <PopupMessage message={message} visible={messageVisible} setVisible={setMessageVisible} />
          </button>
        </form>
      </div>

      {/* Ergebnisanzeige */}
      <div className="results-container">
        <div className="result-card total-energy">
          Gesamtenergiegewinn: <br />
          🌬️ Ohne Wake: {(Math.round(energyWinRaw.current * 100) / 100).toFixed(2)} kW<br />
          💨 Mit Wake: {(Math.round(energyWinWake.current * 100) / 100).toFixed(2)} kW<br />
          Im Zeitraum von {timeInHr} Std.: {(energyWinWake.current * timeInHr).toFixed(2)} kWh<br />
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

