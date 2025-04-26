import { PowerCurvePoint, Turbine } from "../types/Turbine";
import { SpeedUnits, WindroseData } from "../types/WindRose";

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


interface FunctionProps {
    windrose: WindroseData | undefined,
    turbines: Turbine[],
    progress: number,
    setTurbines: (t: Turbine[]) => void,
    setProgress: (value: number) => void
}
export const calculateWithoutWake = (functionProps: FunctionProps) => {
    const { windrose, turbines, progress, setTurbines, setProgress } = functionProps;
  
    if (!windrose || !windrose.data || !windrose.speedBins) {
      alert("Es ist ein Fehler mit der Windrose aufgekommen!");
      return;
    }
    if (!turbines || turbines.length < 1) {
      alert("Keine Windturbinen vorhanden");
      return;
    }
  
    // Hilfsfunktion zur Umrechnung in m/s
    const convertToMs = (value: number, unit: string): number => {
      switch (unit) {
        case SpeedUnits.kph:
          return value / 3.6;
        case SpeedUnits.mph:
          return value * 0.44704;
        case SpeedUnits.ms:
        default:
          return value;
      }
    };
  
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
  
          const avgWindSpeed = (speedBin[0] + (speedBin[1] === Infinity ? speedBin[0] + 2 : speedBin[1])) / 2;
          const windSpeedMs = convertToMs(avgWindSpeed, windrose.speedUnit);
  
          if (windSpeedMs < cutIn || windSpeedMs > cutOut) return;
  
          const power = interpolatePower(windSpeedMs, powerCurve);
          const freq = freqPercent / 100;
          totalPower += power * freq;
        });
      });
  
      const calmFactor = windrose.calmFrequency / 100;
      totalPower *= (1 - calmFactor);
  
      setProgress(progress + 1);
      return {
        ...turbine,
        powerWithoutWake: totalPower,
      };
    });
  
    setTurbines(updatedTurbines);
  };
  