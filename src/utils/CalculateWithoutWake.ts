import { RefObject } from "react";
import { Turbine } from "../types/Turbine";
import { SpeedUnits, WindroseData } from "../types/WindRose";

import { convertSpeedUnits, GetWindProfileLogarithmic, GetWindProfilePowerLaw, interpolatePower } from "./CalculationFunctions";
import { AreaFeature } from "../types/GroundArea";



interface FunctionProps {
  windrose: WindroseData | undefined,
  turbines: Turbine[],
  groundAreas : AreaFeature[];
  setTurbines: (t: Turbine[]) => void,
  energyWin: RefObject<number>,
  elevation: number
}
export const calculateWithoutWake = (functionProps: FunctionProps) => {
  const { windrose, turbines, groundAreas, setTurbines, energyWin } = functionProps;

  energyWin.current = 0;

  if (!windrose || !windrose.data || !windrose.speedBins) {
    alert("Es ist ein Fehler mit der Windrose aufgekommen!");
    return;
  }

  if (!turbines || turbines.length < 1) {
    alert("Keine Windturbinen vorhanden");
    return;
  }

  const updatedTurbines = turbines.map((turbine) => {
    if (!turbine.available || turbine.type.name === 'DefaultNull') {
      return {
        ...turbine,
        powerWithoutWake: 0,
      };
    }

    const { cutIn, cutOut, powerCurve } = turbine.type;
    let totalPower = 0;

    windrose.data.forEach((entry) => {
      entry.frequencies.forEach((freqPercent: number, i: number) => {
        const speedBin = windrose.speedBins[i];
        if (!speedBin) return;

        const avgWindSpeed =
          (speedBin[0] + (speedBin[1] === Infinity ? speedBin[0] + 2 : speedBin[1])) / 2;

        let windSpeedMs = convertSpeedUnits(avgWindSpeed, windrose.speedUnit, SpeedUnits.ms);

        const z0 = turbine.groundAreaID ? groundAreas.find((a) => a.properties.id === turbine.groundAreaID)?.properties.z0 ?? 0.03 : 0.03;
        windSpeedMs = GetWindProfileLogarithmic(windSpeedMs, turbine.type.hubHeight, windrose.elevation, z0);

        if (windSpeedMs < cutIn || windSpeedMs > cutOut) return;

        const power = interpolatePower(windSpeedMs, powerCurve);
        const freq = freqPercent / 100;
        totalPower += power * freq;
      });
    });

    const calmFactor = windrose.calmFrequency / 100;
    totalPower *= (1 - calmFactor);

    // Nur aufsummieren, wenn die Turbine aktiv ist
    energyWin.current += totalPower;

    return {
      ...turbine,
      powerWithoutWake: totalPower,
    };
  });

  setTurbines(updatedTurbines);
};

