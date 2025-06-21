import { SpeedUnits } from "../types/WindRose";
import { PowerCurvePoint } from "../types/Turbine";



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

export const GetWindProfilePowerLaw = (speedOnH1: number, hubHeight: number, measureHeight: number, alpha: number): number => {
  return (speedOnH1 * Math.pow(hubHeight / measureHeight, alpha));
}

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