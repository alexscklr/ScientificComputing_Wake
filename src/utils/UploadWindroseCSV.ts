import { RefObject } from "react";
import { WindroseData, WindroseEntry, SpeedUnits, speedBins } from "../types/WindRose";


export const parseCsvToWindrose = (csvString: string): WindroseData => {
    const lines = csvString
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith('#'));

    let calmFrequency = 0;
    const data: WindroseEntry[] = [];

    let speedBins: [number, number][] = [];

    for (const line of lines) {
        const parts = line.split(',').map((v) => v.trim());

        if (/^Direction/i.test(parts[0])) {
            // Hier extrahieren wir die Speed-Bins
            speedBins = parts.slice(2).map((range) => {
                const [startStr, endStr] = range.split(/\s+/);
                const start = parseFloat(startStr);
                const end = endStr === '+' ? Infinity : parseFloat(endStr);
                return [start, end];
            }) as [number, number][];
            continue;
        }

        if (!/^\d{3}-\d{3}/.test(parts[0])) continue;

        const directionLabel = parts[0];
        const [startStr, endStr] = directionLabel.split('-');
        const directionRange: [number, number] = [parseInt(startStr), parseInt(endStr)];

        const calm = parseFloat(parts[1]) || 0;
        const frequencies = parts.slice(2).map((v) => parseFloat(v) || 0);

        calmFrequency += calm;

        data.push({
            directionRange,
            frequencies,
        });
    }

    return {
        id: Date.now(),
        speedUnit: SpeedUnits.mph,
        calmFrequency,
        speedBins,
        data,
        elevation: 10
    };
};



export const convertToWindrose = (csv: string, dataCount: RefObject<number>, dataErrors: RefObject<number>, frequencySum: RefObject<number>): WindroseData => {
    const lines = csv.trim().split('\n');
    const dataLines = lines.slice(1); // Erste Zeile sind Header

    const directionBins = Array.from({ length: 36 }, (_, i) => i * 10);

    // Zähle die Häufigkeit für jede Richtung und jedes Speed-Bin
    const counts = directionBins.map(() => Array(speedBins.length).fill(0));
    let totalCount = 0;

    // Gehe jede Zeile durch
    for (const line of dataLines) {
        const parts = line.split(',');

        const dir = parseFloat(parts[2]);
        const spd = parseFloat(parts[3]);

        dataCount.current++;
        // Überprüfe, ob die Werte für Richtung und Geschwindigkeit gültig sind (nicht NaN und > 0)
        if (isNaN(dir) || isNaN(spd) || dir <= 0 || spd <= 0) {
            //console.warn(`Ungültige Werte: Richtung = ${dir}, Geschwindigkeit = ${spd}`);
            dataErrors.current++;
            continue; // Überspringe diese Zeile, wenn die Werte ungültig sind
        }

        // Bestimme die Richtung-Bin
        const dirIndex = Math.floor(dir / 10) % 36; // In 10°-Schritte
        // Bestimme das Speed-Bin
        const spdIndex = speedBins.findIndex(([min, max]) => spd >= min && spd < max);

        // Überprüfe, ob dirIndex und spdIndex gültige Indizes sind
        if (dirIndex >= 0 && dirIndex < directionBins.length && spdIndex >= 0 && spdIndex < speedBins.length) {
            counts[dirIndex][spdIndex]++;
            totalCount++;
        } else {
            //console.warn(`Ungültige Indizes für Richtung ${dir} und Geschwindigkeit ${spd}`);
            continue;
        }
    }

    // Fehlerbehandlung: Überprüfen, ob counts und totalCount korrekt sind
    if (totalCount === 0) {
        console.error("Fehler: Es wurden keine gültigen Daten gefunden!");
        return {
            id: Date.now(),
            name: 'Windrose von API-Daten',
            calmFrequency: 0,
            speedBins,
            speedUnit: SpeedUnits.knt,
            data: [],
            elevation: 10
        };
    }

    // Normalisiere auf 100%
    const result: WindroseEntry[] = directionBins.map((dir, i) => {
        const frequencies = counts[i].map((count) => (count / totalCount) * 100); // Häufigkeit in %
        frequencies.forEach((f) => frequencySum.current += f);
        return {
            directionRange: [dir, dir + 10], // Range von 10° (z. B. [0, 10], [10, 20], ...)
            frequencies,
        };
    });

    return {
        id: Date.now(),
        name: 'Windrose von API-Daten',
        calmFrequency: 0, // Nicht benötigt, da keine 'Calm'-Daten aus API kommen
        speedBins,
        speedUnit: SpeedUnits.knt, // Beispiel: Geschwindigkeitseinheit als 'km/h', kann angepasst werden
        data: result,
        elevation: 10
    };
};