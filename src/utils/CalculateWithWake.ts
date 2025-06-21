import { RefObject } from "react";
import { ThrustCurvePoint, Turbine } from "../types/Turbine";
import { SpeedUnits, WindroseData } from "../types/WindRose";

import { convertSpeedUnits, GetWindProfilePowerLaw, interpolatePower } from "./CalculationFunctions";

let WAKE_DECAY_CONSTANT = 0.08;

const degToRad = (deg: number): number => (deg * Math.PI) / 180;



const getThrustCoefficient = (windSpeed: number, thrustCurve?: ThrustCurvePoint[]): number => {
  if (!thrustCurve || thrustCurve.length === 0) {
    return 0.8;
  }

  const sorted = [...thrustCurve].sort((a, b) => a.windSpeed - b.windSpeed);
  if (windSpeed <= sorted[0].windSpeed) return sorted[0].thrust;
  if (windSpeed >= sorted[sorted.length - 1].windSpeed) return sorted[sorted.length - 1].thrust;

  for (let i = 0; i < sorted.length - 1; i++) {
    const p1 = sorted[i];
    const p2 = sorted[i + 1];
    if (windSpeed >= p1.windSpeed && windSpeed <= p2.windSpeed) {
      const ratio = (windSpeed - p1.windSpeed) / (p2.windSpeed - p1.windSpeed);
      const interpolated = p1.thrust + ratio * (p2.thrust - p1.thrust);
      const bounded = Math.max(0, Math.min(1, interpolated));

      return bounded;
    }
  }

  return 0.8;
};


const calculateWakeDeficit = (dist: number, rotorRadius: number, ct: number): number => {
  const k = WAKE_DECAY_CONSTANT;
  ct = Math.max(0, Math.min(1, ct));
  const a = 0.5 * (1 - Math.sqrt(1 - ct));
  return a / ((1 + k * dist / rotorRadius) ** 2);
};

const rotateCoordinates = (x: number, y: number, angleDeg: number): [number, number] => {
  const angleRad = degToRad(angleDeg);
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  return [x * cos + y * sin, -x * sin + y * cos];
};

const circleOverlapArea = (r1: number, r2: number, d: number): number => {
  if (d >= r1 + r2) return 0;
  if (d <= Math.abs(r1 - r2)) {
    const smaller = Math.min(r1, r2);
    return Math.PI * smaller * smaller;
  }

  const r1Sq = r1 * r1;
  const r2Sq = r2 * r2;

  const part1 = r1Sq * Math.acos((d * d + r1Sq - r2Sq) / (2 * d * r1));
  const part2 = r2Sq * Math.acos((d * d + r2Sq - r1Sq) / (2 * d * r2));
  const part3 = 0.5 * Math.sqrt(
    (-d + r1 + r2) *
    (d + r1 - r2) *
    (d - r1 + r2) *
    (d + r1 + r2)
  );

  return part1 + part2 - part3;
};

const getOverlapRatio = (rWake: number, rRotor: number, dy: number): number => {
  const area = circleOverlapArea(rWake, rRotor, Math.abs(dy));
  return area / (Math.PI * rRotor * rRotor);
};


interface FunctionProps {
  windrose: WindroseData | undefined;
  turbines: Turbine[];
  setTurbines: (t: Turbine[]) => void;
  energyWin: RefObject<number>;
  elevation: number;
  wakeDecayConstant: number;
  maxWakeDistance: number;
}

export const calculateWithWake = (functionProps: FunctionProps) => {
  const {
    windrose,
    turbines,
    setTurbines,
    energyWin,
    wakeDecayConstant,
    maxWakeDistance,
  } = functionProps;

  WAKE_DECAY_CONSTANT = wakeDecayConstant;
  energyWin.current = 0;

  if (!windrose || !windrose.data || !windrose.speedBins) {
    alert("Fehler mit der Windrose");
    return;
  }

  if (!turbines || turbines.length < 1) {
    alert("Keine Windturbinen vorhanden");
    return;
  }

  const updatedTurbines = turbines.map((t) => ({
    ...t,
    powerWithWake: 0,
  }));

  windrose.data.forEach((entry) => {
    const [dirFrom, dirTo] = entry.directionRange;
    const windDirDeg = (dirFrom + dirTo) / 2;

    entry.frequencies.forEach((freqPercent, speedBinIndex) => {
      const speedBin = windrose.speedBins[speedBinIndex];
      if (!speedBin) return;

      const avgWindSpeed =
        (speedBin[0] + (speedBin[1] === Infinity ? speedBin[0] + 2 : speedBin[1])) / 2;

      let windSpeedMs = convertSpeedUnits(avgWindSpeed, windrose.speedUnit, SpeedUnits.ms);
      windSpeedMs = GetWindProfilePowerLaw(windSpeedMs, turbines[0].type.hubHeight, windrose.elevation, 0.14);

      const freq = freqPercent / 100;
      if (windSpeedMs <= 0 || freq <= 0) return;

      const activeTurbines = updatedTurbines.filter((t) => t.available !== false);

      // Koordinatenprojektion: Upwind-orientiert
      const avgLat = turbines.reduce((sum, t) => sum + t.lat, 0) / turbines.length;
      const avgLong = turbines.reduce((sum, t) => sum + t.long, 0) / turbines.length;
      const metersPerDegLat = 111_320;
      const metersPerDegLon = 111_320 * Math.cos(degToRad(avgLat));

      const projected = [...activeTurbines].map((t) => {
        const xMeters = (t.long - avgLong) * metersPerDegLon;
        const yMeters = (t.lat - avgLat) * metersPerDegLat;
        const [x, y] = rotateCoordinates(xMeters, yMeters, -windDirDeg);
        return { ...t, xRel: x, yRel: y };
      });

      // Sortieren entlang der Windrichtung (Upwind → Downwind)
      projected.sort((a, b) => a.xRel - b.xRel);

      const wakeAdjusted = projected.map((t, idx, all) => {
        let totalDeficitSquared = 0;

        for (let j = 0; j < idx; j++) {
          const upwind = all[j];
          const dx = t.xRel - upwind.xRel;
          const dy = t.yRel - upwind.yRel;

          if (dx <= 0) continue;

          const rotorRadius = upwind.type.rotorDiameter / 2;  
          const MAX_WAKE_DISTANCE = maxWakeDistance * rotorRadius;
          if (dx > MAX_WAKE_DISTANCE) continue;

          const ct = getThrustCoefficient(windSpeedMs, upwind.type.thrustCoefficientCurve);
          const deficit = calculateWakeDeficit(dx, rotorRadius, ct);

          const wakeRadius = rotorRadius + WAKE_DECAY_CONSTANT * dx;
          const downwindRotorRadius = t.type.rotorDiameter / 2;
          const overlapRatio = getOverlapRatio(wakeRadius, downwindRotorRadius, dy);

          if (overlapRatio <= 0) continue;

          const adjustedDeficit = deficit * overlapRatio;
          totalDeficitSquared += adjustedDeficit ** 2;
        }

        const totalDeficit = Math.min(0.95, Math.max(0, Math.sqrt(totalDeficitSquared)));
        const effectiveWind = windSpeedMs * (1 - totalDeficit);

        const power =
          effectiveWind < t.type.cutIn || effectiveWind > t.type.cutOut
            ? 0
            : interpolatePower(effectiveWind, t.type.powerCurve);

        return {
          ...t,
          addedPower: power * freq,
        };
      });


      // Energie auf originale Turbinen-ID zurückschreiben
      wakeAdjusted.forEach((t) => {
        const index = updatedTurbines.findIndex((orig) => orig.id === t.id);
        if (index >= 0) {
          updatedTurbines[index].powerWithWake! += t.addedPower;
        }
      });
    });
  });

  // Calm-Faktor anwenden und Energie summieren
  updatedTurbines.forEach((t) => {
    if (t.available === false) {
      t.powerWithWake = 0;
    } else {
      t.powerWithWake! *= 1 - windrose.calmFrequency / 100;
      energyWin.current! += t.powerWithWake!;
    }
  });

  setTurbines(updatedTurbines);
};
