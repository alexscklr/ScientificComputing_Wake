import { PowerCurvePoint, Turbine } from "../types/Turbine";
import { WindroseData } from "../types/WindRose";

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
    turbines: Turbine[], setTurbines: (t: Turbine[]) => void,
    setCalculated: (value: boolean) => void
}
export const calculateWithoutWake = (functionProps: FunctionProps) => {
    const windrose = functionProps.windrose;
    const turbines = functionProps.turbines;
    const setTurbines = functionProps.setTurbines;
    const setCalculated = functionProps.setCalculated;

    if (!windrose || !windrose.data || !windrose.speedBins) { alert("Es ist ein Fehler mit der Windrose aufgekommen!"); return; }
    if (!turbines || turbines.length < 1) { alert("Keine Windturbinen vorhanden"); return; }

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

                const windSpeed = (speedBin[0] + (speedBin[1] === Infinity ? speedBin[0] + 2 : speedBin[1])) / 2;

                if (windSpeed < cutIn || windSpeed > cutOut) return;

                const power = interpolatePower(windSpeed, powerCurve);
                const freq = freqPercent / 100;
                totalPower += power * freq;
            });
        });

        const calmFactor = windrose.calmFrequency / 100;
        totalPower *= (1 - calmFactor);

        return {
            ...turbine,
            powerWithoutWake: totalPower,
        };
    });

    setTurbines(updatedTurbines);
    setCalculated(true);
};