import { RefObject } from "react";
import { Turbine } from "../types/Turbine";
import { SpeedUnits, WindroseEntry } from "../types/WindRose";
import { AreaFeature } from "../types/GroundArea";
import { Mast } from "../types/WindRose";
import {
  convertSpeedUnits,
  GetWindProfileLogarithmic,
  interpolatePower,
  interpolateWindroses
} from "./CalculationFunctions";

interface FunctionProps {
  turbines: Turbine[];
  groundAreas: AreaFeature[];
  masts: Mast[];
  setTurbines: (t: Turbine[]) => void;
  energyWin: RefObject<number>;
}

export const calculateWithoutWake = ({
  turbines,
  groundAreas,
  masts,
  setTurbines,
  energyWin
}: FunctionProps) => {
  energyWin.current = 0;

  if (!turbines || turbines.length < 1) {
    alert("Keine Windturbinen vorhanden");
    return;
  }

  const updatedTurbines = turbines.map((turbine) => {
    if (!turbine.available || turbine.type.name === "DefaultNull") {
      return {
        ...turbine,
        powerWithoutWake: 0
      };
    }

    const interpolatedWindrose = interpolateWindroses(turbine, masts, groundAreas);
    const { cutIn, cutOut, powerCurve } = turbine.type;
    let totalPower = 0;

    interpolatedWindrose.windrose.data.forEach((entry: WindroseEntry) => {
      entry.frequencies.forEach((freqPercent: number, i: number) => {
        const speedBin = interpolatedWindrose.windrose.speedBins[i];
        if (!speedBin) return;

        const avgWindSpeed =
          (speedBin[0] + (speedBin[1] === Infinity ? speedBin[0] + 2 : speedBin[1])) / 2;

        let windSpeedMs = convertSpeedUnits(avgWindSpeed, interpolatedWindrose.windrose.speedUnit, SpeedUnits.ms);

        // z0 aus GroundArea (falls vorhanden)
        const z0 = turbine.groundAreaID
          ? groundAreas.find((a) => a.properties.id === turbine.groundAreaID)?.properties.z0 ?? 0.03
          : 0.03;
          
        windSpeedMs = GetWindProfileLogarithmic(
          windSpeedMs,
          turbine.type.hubHeight,
          interpolatedWindrose.elevation,
          z0
        );

        if (windSpeedMs < cutIn || windSpeedMs > cutOut) return;

        const power = interpolatePower(windSpeedMs, powerCurve);
        const freq = freqPercent / 100;
        totalPower += power * freq;
      });
    });

    const calmFactor = interpolatedWindrose.windrose.calmFrequency / 100;
    totalPower *= 1 - calmFactor;

    energyWin.current += totalPower;

    return {
      ...turbine,
      powerWithoutWake: totalPower
    };
  });

  setTurbines(updatedTurbines);
};
