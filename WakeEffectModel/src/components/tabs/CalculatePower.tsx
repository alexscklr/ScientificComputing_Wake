import React, { useState } from 'react';
import { PowerCurvePoint, Turbine } from '../../types/Turbine';
import { WindroseData } from '../../types/WindRose';

interface CalculatePowerProps {
  turbines: Turbine[];
  setTurbines: React.Dispatch<React.SetStateAction<Turbine[]>>;
  windrose?: WindroseData;
  setWindrose: (wr: WindroseData) => void;
}

const CalculatePower: React.FC<CalculatePowerProps> = ({
  turbines,
  setTurbines,
  windrose,
}) => {
  const [calculated, setCalculated] = useState(false);

  const interpolatePower = (windSpeed: number, curve: PowerCurvePoint[]): number => {
    const sortedCurve = [...curve].sort((a, b) => a.windSpeed - b.windSpeed);

    if (windSpeed <= sortedCurve[0].windSpeed) return sortedCurve[0].power;
    if (windSpeed >= sortedCurve[sortedCurve.length - 1].windSpeed) return sortedCurve[sortedCurve.length - 1].power;

    for (let i = 0; i < sortedCurve.length - 1; i++) {
      const p1 = sortedCurve[i];
      const p2 = sortedCurve[i + 1];

      if (windSpeed >= p1.windSpeed && windSpeed <= p2.windSpeed) {
        const ratio = (windSpeed - p1.windSpeed) / (p2.windSpeed - p1.windSpeed);
        return p1.power + ratio * (p2.power - p1.power);
      }
    }

    return 0;
  };

  const averageWindSpeed = (range: [number, number]): number => {
    if (range[1] === Infinity) return range[0] + 1;
    return (range[0] + range[1]) / 2;
  };

  const calculateWithoutWake = () => {
    if (!windrose || !windrose.data || !windrose.speedBins) {alert("Es ist ein Fehler mit der Windrose aufgekommen!"); return;}
    if (!turbines || turbines.length < 1) {alert("Keine Windturbinen vorhanden"); return;}
  
    const updatedTurbines = turbines.map((turbine) => {
      const { cutIn, cutOut, powerCurve } = turbine.type;
      let totalPower = 0;
  
      windrose.data.forEach((entry) => {
        entry.frequencies.forEach((freqPercent: number, i: number) => {
          const speedBin = windrose.speedBins[i];
          if (!speedBin) return;
  
          const windSpeed = (speedBin[0] + (speedBin[1] === Infinity ? speedBin[0] + 2 : speedBin[1])) / 2;
  
          if (windSpeed < cutIn || windSpeed > cutOut) return;
  
          const power = interpolatePower(windSpeed, powerCurve);
          const freq = freqPercent / 100;
          totalPower += power * freq;
        });
      });
  
      const calmFactor = windrose.calmFrequency / 100;
      totalPower *= (1 - calmFactor);
  
      return {
        ...turbine,
        powerWithoutWake: totalPower,
      };
    });
  
    setTurbines(updatedTurbines);
    setCalculated(true);
  };
  

  return (
    <div style={{
      padding: '1rem',
      maxWidth: '600px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    }}>
      <button
        onClick={calculateWithoutWake}
        style={{
          padding: '0.6rem 1.2rem',
          backgroundColor: 'green',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          fontSize: '1rem',
          cursor: 'pointer'
        }}
      >
        🔍 Berechne ohne Wake
      </button>

      {calculated && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}>
          {turbines.map((turbine) => (
            <div
              key={turbine.id}
              style={{
                padding: '0.8rem',
                backgroundColor: '#f9fbfd',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ flex: 1 }}>{turbine.name}</span>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <span style={{ color: '#2e7d32' }}>
                  🌬️ {turbine.powerWithoutWake?.toFixed(2)} kW
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalculatePower;

