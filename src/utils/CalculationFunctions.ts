import { Mast, SpeedUnits, Windrose } from "../types/WindRose";
import { PowerCurvePoint, Turbine } from "../types/Turbine";
import { AreaFeature } from "../types/GroundArea";
import { haversineDistance } from "./geoUtils";



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

export const GetWindProfileLogarithmic = (speedOnH1: number, hubHeight: number, measureHeight: number, z0: number): number => {
  return (speedOnH1 * Math.log(hubHeight / z0) / Math.log(measureHeight / z0));
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


function interpolateFrequenciesToTargetBins(
  originalSpeeds: number[],
  originalFreqs: number[],
  targetSpeeds: number[]
): number[] {
  const result = new Array(targetSpeeds.length).fill(0);

  for (let i = 0; i < targetSpeeds.length; i++) {
    const ts = targetSpeeds[i];
    if (ts <= originalSpeeds[0]) {
      result[i] = originalFreqs[0];
    } else if (ts >= originalSpeeds[originalSpeeds.length - 1]) {
      result[i] = originalFreqs[originalFreqs.length - 1];
    } else {
      for (let j = 0; j < originalSpeeds.length - 1; j++) {
        const s1 = originalSpeeds[j];
        const s2 = originalSpeeds[j + 1];
        if (ts >= s1 && ts <= s2) {
          const ratio = (ts - s1) / (s2 - s1);
          result[i] = originalFreqs[j] + ratio * (originalFreqs[j + 1] - originalFreqs[j]);
          break;
        }
      }
    }
  }

  return result;
}

export const interpolateWindroses = (
  turbine: Turbine,
  masts: Mast[],
  groundAreas: AreaFeature[]
): { windrose: Windrose; elevation: number } => {
  const validMasts = masts.filter((m) => m.available && m.windrose);
  if (validMasts.length === 0) throw new Error("Keine gültigen Windrosen verfügbar.");

  const referenceWindrose = validMasts[0].windrose;
  const directionBins = referenceWindrose.data.map((entry) => entry.directionRange);
  const speedBinCount = referenceWindrose.speedBins.length;

  const targetSpeedBinsMs: [number, number][] = referenceWindrose.speedBins.map(([min, max]) => [
    convertSpeedUnits(min, referenceWindrose.speedUnit, SpeedUnits.ms),
    max === Infinity ? Infinity : convertSpeedUnits(max, referenceWindrose.speedUnit, SpeedUnits.ms),
  ]);
  const targetSpeedCenters = targetSpeedBinsMs.map(([min, max]) => max === Infinity ? min : (min + max) / 2);

  const frequencySums: number[][] = directionBins.map(() => new Array(speedBinCount).fill(0));
  let calmFreqSum = 0;

  const z0 = turbine.groundAreaID
    ? groundAreas.find((a) => a.properties.id === turbine.groundAreaID)?.properties.z0 ?? 0.03
    : 0.03;

  const hubHeight = turbine.type.hubHeight;

  const distances = validMasts.map((m) => ({
    mast: m,
    dist: haversineDistance(turbine.lat, turbine.long, m.lat, m.long),
  }));
  const totalWeight = distances.reduce((sum, { dist }) => sum + 1 / dist, 0);

  for (const { mast, dist } of distances) {
    const weight = (1 / dist) / totalWeight;
    const windrose = mast.windrose;

    const mastSpeedBinsMs = windrose.speedBins.map(([min, max]) => [
      convertSpeedUnits(min, windrose.speedUnit, SpeedUnits.ms),
      max === Infinity ? Infinity : convertSpeedUnits(max, windrose.speedUnit, SpeedUnits.ms),
    ]);
    const mastSpeedCenters = mastSpeedBinsMs.map(([min, max]) => max === Infinity ? min : (min + max) / 2);
    const scaledSpeedCenters = mastSpeedCenters.map((v) =>
      GetWindProfileLogarithmic(v, hubHeight, mast.measureHeight, z0)
    );

    windrose.data.forEach((entry, dirIdx) => {
      const interpolatedFreqs = interpolateFrequenciesToTargetBins(
        scaledSpeedCenters,
        entry.frequencies,
        targetSpeedCenters
      );

      for (let i = 0; i < speedBinCount; i++) {
        frequencySums[dirIdx][i] += interpolatedFreqs[i] * weight;
      }
    });

    calmFreqSum += (windrose.calmFrequency ?? 0) * weight;
  }

  const totalFreq = frequencySums.flat().reduce((sum, f) => sum + f, 0);
  const normalizeFactor = (100 - calmFreqSum) / totalFreq;

  const normalizedData = directionBins.map((dir, i) => ({
    directionRange: dir,
    frequencies: frequencySums[i].map((f) => f * normalizeFactor),
  }));

  const interpolatedWindrose: Windrose = {
    name: `Interpolated_${turbine.name}`,
    calmFrequency: calmFreqSum,
    speedUnit: SpeedUnits.ms,
    speedBins: targetSpeedBinsMs,
    data: normalizedData,
  };

  return {
    windrose: interpolatedWindrose,
    elevation: hubHeight,
  };
};