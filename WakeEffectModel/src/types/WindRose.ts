/*
export interface WindDirectionData {
  direction: string; // z. B. "N", "NO", "O", ...
  frequency: number; // Prozentualer Anteil (z. B. 12.3)
  averageSpeed?: number; // Optional: Durchschnittsgeschwindigkeit in m/s
}

export interface WindRose {
  id: number;
  name: string;
  data: WindDirectionData[];
  location?: {
    lat: number;
    long: number;
  };
}

export interface WindroseType {
  id: number;
  name: string;
  data: WindDirectionData[];
}
*/

export interface WindroseEntry {
  directionRange: [number, number];
  frequencies: number[];
}

export interface WindroseData {
  name?: string;
  calmFrequency: number;
  speedBins: [number, number][];
  data: WindroseEntry[];
}