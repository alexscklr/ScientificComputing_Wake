import { RefObject } from "react";
import { PowerCurvePoint, Turbine } from "../types/Turbine";
import { SpeedUnits, WindroseData } from "../types/WindRose";



export const interpolatePower = (windSpeed: number, curve: PowerCurvePoint[]): number => {
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

export const GetPowerLaw = (speedOnH1: number, hubHeight: number, measureHeight: number, alpha: number): number => {
  return (speedOnH1 * Math.pow(hubHeight / measureHeight, alpha));
}

export const convertSpeedUnits = (fromSpeed: number, fromUnit: SpeedUnits, toUnit: SpeedUnits): number => {
  if (fromUnit === toUnit) return fromSpeed;

  if (fromUnit === SpeedUnits.knt && toUnit === SpeedUnits.ms) return fromSpeed * 0.514444;
  if (fromUnit === SpeedUnits.knt && toUnit === SpeedUnits.kph) return fromSpeed * 1.852;
  if (fromUnit === SpeedUnits.knt && toUnit === SpeedUnits.mph) return fromSpeed * 1.15078;

  if (fromUnit === SpeedUnits.ms && toUnit === SpeedUnits.knt) return fromSpeed / 0.514444;
  if (fromUnit === SpeedUnits.kph && toUnit === SpeedUnits.knt) return fromSpeed / 1.852;
  if (fromUnit === SpeedUnits.mph && toUnit === SpeedUnits.knt) return fromSpeed / 1.15078;

  if (fromUnit === SpeedUnits.mph && toUnit === SpeedUnits.ms) return fromSpeed * 0.44704;
  if (fromUnit === SpeedUnits.kph && toUnit === SpeedUnits.ms) return fromSpeed / 3.6;
  if (fromUnit === SpeedUnits.mph && toUnit === SpeedUnits.kph) return fromSpeed * 1.60934;
  if (fromUnit === SpeedUnits.ms && toUnit === SpeedUnits.kph) return fromSpeed * 3.6;
  if (fromUnit === SpeedUnits.kph && toUnit === SpeedUnits.mph) return fromSpeed / 1.60934;
  if (fromUnit === SpeedUnits.ms && toUnit === SpeedUnits.mph) return fromSpeed / 0.44704;

  return fromSpeed; // fallback
};



interface FunctionProps {
  windrose: WindroseData | undefined,
  turbines: Turbine[],
  setTurbines: (t: Turbine[]) => void,
  energyWin: RefObject<number>,
  elevation: number
}
export const calculateWithoutWake = (functionProps: FunctionProps) => {
  const { windrose, turbines, setTurbines, energyWin } = functionProps;

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
        windSpeedMs = GetPowerLaw(windSpeedMs, turbine.type.hubHeight, windrose.elevation, 0.14);

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

