import { RefObject } from "react";
import { ThrustCurvePoint, Turbine } from "../types/Turbine";
import { SpeedUnits, WindroseData } from "../types/WindRose";
import { convertSpeedUnits, GetPowerLaw, interpolatePower } from "./CalculateWithoutWake";

let WAKE_DECAY_CONSTANT = 0.08;

const degToRad = (deg: number): number => (deg * Math.PI) / 180;

const getThrustCoefficient = (windSpeed: number, thrustCurve?: ThrustCurvePoint[]): number => {
  if (!thrustCurve || thrustCurve.length === 0) return 0.8;

  const sorted = [...thrustCurve].sort((a, b) => a.windSpeed - b.windSpeed);
  if (windSpeed <= sorted[0].windSpeed) return sorted[0].thrust;
  if (windSpeed >= sorted[sorted.length - 1].windSpeed) return sorted[sorted.length - 1].thrust;

  for (let i = 0; i < sorted.length - 1; i++) {
    const p1 = sorted[i];
    const p2 = sorted[i + 1];
    if (windSpeed >= p1.windSpeed && windSpeed <= p2.windSpeed) {
      const ratio = (windSpeed - p1.windSpeed) / (p2.windSpeed - p1.windSpeed);
      return p1.thrust + ratio * (p2.thrust - p1.thrust);
    }
  }

  return 0.8;
};

const calculateWakeDeficit = (dist: number, rotorRadius: number, ct: number): number => {
  const r = rotorRadius;
  const k = WAKE_DECAY_CONSTANT;

  const a = 0.5 * (1 - Math.sqrt(1 - ct));
  return a / ((1 + k * dist / r) ** 2);
};


const rotateCoordinates = (x: number, y: number, angleDeg: number): [number, number] => {
  const angleRad = degToRad(angleDeg);
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  return [x * cos + y * sin, -x * sin + y * cos];
};


interface FunctionProps {
  windrose: WindroseData | undefined,
  turbines: Turbine[],
  setTurbines: (t: Turbine[]) => void,
  energyWin: RefObject<number>,
  elevation: number,
  wakeDecayConstant: number,
  maxWakeDistance: number,
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
      windSpeedMs = GetPowerLaw(windSpeedMs, turbines[0].type.hubHeight, windrose.elevation, 0.14);

      const freq = freqPercent / 100;
      if (windSpeedMs <= 0 || freq <= 0) return;

      // Nur aktive Turbinen berücksichtigen
      const activeTurbines = updatedTurbines.filter((t) => t.available !== false);

      const latRef = turbines[0].lat;

      const projected = [...activeTurbines].map((t) => {
        const metersPerDegLat = 111_320;
        const metersPerDegLon = 111_320 * Math.cos(degToRad(latRef));

        const xMeters = (t.long - turbines[0].long) * metersPerDegLon;
        const yMeters = (t.lat - turbines[0].lat) * metersPerDegLat;

        const [x, y] = rotateCoordinates(xMeters, yMeters, -windDirDeg);
        return { ...t, xRel: x, yRel: y };
      });

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
          const deficit = calculateWakeDeficit(dx, dy, ct);

          totalDeficitSquared += deficit ** 2;
        }

        const totalDeficit = Math.min(0.95, Math.sqrt(totalDeficitSquared));
        const effectiveWind = windSpeedMs * (1 - totalDeficit);

        const power =
          effectiveWind < t.type.cutIn || effectiveWind > t.type.cutOut
            ? 0
            : interpolatePower(effectiveWind, t.type.powerCurve);

        return {
          ...t,
          effectiveWind,
          addedPower: power * freq,
        };
      });

      // Energie zur richtigen Turbine zurückschreiben
      wakeAdjusted.forEach((t) => {
        const index = updatedTurbines.findIndex((orig) => orig.id === t.id);
        updatedTurbines[index].powerWithWake! += t.addedPower;
      });
    });
  });

  // Calm-Factor und Setzen von powerWithWake = 0 bei inaktiven
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

