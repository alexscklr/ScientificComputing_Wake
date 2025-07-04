import { RefObject } from "react";
import { ThrustCurvePoint, Turbine } from "../types/Turbine";
import { Mast, SpeedUnits } from "../types/WindRose";

import { convertSpeedUnits, GetWindProfileLogarithmic, interpolatePower, interpolateWindroses } from "./CalculationFunctions";
import { AreaFeature } from "../types/GroundArea";

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


const calculateWakeDeficit = (dist: number, rotorRadius: number, ct: number, k: number): number => {
  ct = Math.max(0, Math.min(1, ct));
  const a = 0.5 * (1 - Math.sqrt(1 - ct));
  const v = a / ((1 + k * dist / rotorRadius) ** 2)
  return v;
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
  masts: Mast[];
  turbines: Turbine[];
  setTurbines: (t: Turbine[]) => void;
  energyWin: RefObject<number>;
  maxWakeDistance: number;
  groundAreas: AreaFeature[];
}
export const calculateWithWake = (functionProps: FunctionProps) => {
  const {
    masts,
    turbines,
    setTurbines,
    energyWin,
    maxWakeDistance,
    groundAreas,
  } = functionProps;

  energyWin.current = 0;
  let v1 = 0;
  let v2 = 0;

  if (!turbines || turbines.length < 1) {
    alert("Keine Windturbinen vorhanden");
    return;
  }

  const avgLat = turbines.reduce((sum, t) => sum + t.lat, 0) / turbines.length;
  const avgLong = turbines.reduce((sum, t) => sum + t.long, 0) / turbines.length;
  const metersPerDegLat = 111_320;
  const metersPerDegLon = 111_320 * Math.cos(degToRad(avgLat));

  const updatedTurbines = turbines.map((t) => ({
    ...t,
    powerWithWake: 0,
  }));

  for (const turbine of updatedTurbines) {
    if (turbine.available === false) continue;
    const interpolatedWindrose = interpolateWindroses(turbine, masts, groundAreas);
    //const interpolatedWindrose = {windrose: masts[0].windrose, elevation: masts[0].measureHeight};

    for (let dirIdx = 0; dirIdx < interpolatedWindrose.windrose.data.length; dirIdx++) {
      const entry = interpolatedWindrose.windrose.data[dirIdx];
      const [dirFrom, dirTo] = entry.directionRange;
      const windDirDeg = (dirFrom + dirTo) / 2;

      for (let speedBinIndex = 0; speedBinIndex < entry.frequencies.length; speedBinIndex++) {
        const freqPercent = entry.frequencies[speedBinIndex];
        const freq = freqPercent / 100;
        const speedBin = interpolatedWindrose.windrose.speedBins[speedBinIndex];
        if (!speedBin || freq <= 0) continue;

        const avgWindSpeed =
          (speedBin[0] + (speedBin[1] === Infinity ? speedBin[0] + 2 : speedBin[1])) / 2;

        let baseWindSpeedMs = convertSpeedUnits(avgWindSpeed, interpolatedWindrose.windrose.speedUnit, SpeedUnits.ms);
        if (baseWindSpeedMs <= 0) continue;

        const availableTurbines = updatedTurbines.filter((t) => t.available !== false);

        // Koordinatenprojektion für alle Turbinen (muss innerhalb der Schleife wegen Rotation sein)
        const projected = availableTurbines.map((t) => {
          const xMeters = (t.long - avgLong) * metersPerDegLon;
          const yMeters = (t.lat - avgLat) * metersPerDegLat;
          const [x, y] = rotateCoordinates(xMeters, yMeters, -windDirDeg);
          return { ...t, xRel: x, yRel: y };
        });

        // Nach Upstream sortieren
        projected.sort((a, b) => a.xRel - b.xRel);

        // Ziel-Turbine im sortierten Array finden
        const currentProjIndex = projected.findIndex((t) => t.id === turbine.id);
        if (currentProjIndex === -1) continue;

        const currentProj = projected[currentProjIndex];

        let totalDeficitSquared = 0;

        for (let j = 0; j < currentProjIndex; j++) {
          const upwind = projected[j];
          const dx = currentProj.xRel - upwind.xRel;
          const dy = currentProj.yRel - upwind.yRel;

          if (dx <= 0) continue;

          const rotorRadius = upwind.type.rotorDiameter / 2;
          const MAX_WAKE_DISTANCE = maxWakeDistance * rotorRadius;
          if (dx > MAX_WAKE_DISTANCE) continue;

          const ct = getThrustCoefficient(baseWindSpeedMs, upwind.type.thrustCoefficientCurve);
          const k = groundAreas.find(area => area.id === turbine.groundAreaID)?.properties.k || 0.08;
          const deficit = calculateWakeDeficit(dx, rotorRadius, ct, k);

          const wakeRadius = rotorRadius + k * dx;
          const downwindRotorRadius = turbine.type.rotorDiameter / 2;
          const overlapRatio = getOverlapRatio(wakeRadius, downwindRotorRadius, dy);

          if (overlapRatio <= 0) continue;

          const adjustedDeficit = deficit * overlapRatio;
          totalDeficitSquared += adjustedDeficit ** 2;

        }

        const totalDeficit = Math.min(1, Math.max(0, Math.sqrt(totalDeficitSquared)));
        if (v1 >= 0.05) {v1 += totalDeficit;
        v2 += 1;}

        const z0 = turbine.groundAreaID
          ? groundAreas.find((a) => a.properties.id === turbine.groundAreaID)?.properties.z0 ?? 0.03
          : 0.03;

        const windAtHubHeight = GetWindProfileLogarithmic(
          baseWindSpeedMs,
          turbine.type.hubHeight,
          interpolatedWindrose.elevation,
          z0
        );

        const effectiveWind = windAtHubHeight * (1 - totalDeficit);
        
        const power =
          effectiveWind < turbine.type.cutIn || effectiveWind > turbine.type.cutOut
            ? 0
            : interpolatePower(effectiveWind, turbine.type.powerCurve);

        turbine.powerWithWake! += power * freq * (1-interpolatedWindrose.windrose.calmFrequency/100);
        
      }
    }
  }
console.log(v1/v2);
  updatedTurbines.forEach((t) => {
    if (t.available === false) {
      t.powerWithWake = 0;
    } else {
      energyWin.current! += t.powerWithWake!;
    }
  });

  setTurbines(updatedTurbines);
};
