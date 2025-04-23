import React, { useState } from 'react';
import { Turbine } from '../../types/Turbine';
import { WindroseData } from '../../types/WindRose';
import { calculateWithoutWake } from '../../utils/CalculateWithoutWake';
import '../styles/CalculatePower.css';

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


  return (
    <div className='calculate-container'>
      <button
        onClick={() => calculateWithoutWake({windrose, turbines, setTurbines, setCalculated})}
        className='calculateWithout-btn'
      >
        🔍 Berechne ohne Wake
      </button>

      {calculated && (
        <div className='result-wrapper'>
          {turbines.map((turbine) => (
            <div
              key={turbine.id}
              className='result-displayer'
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

