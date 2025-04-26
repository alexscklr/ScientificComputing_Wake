export enum SpeedUnits {
  mph = 'mph',
  ms = 'm/s',
  kph = 'km/h'
}

export interface WindroseEntry {
  directionRange: [number, number];
  frequencies: number[];
}

export interface WindroseData {
  id: number;
  name?: string;
  speedUnit: string;
  calmFrequency: number;
  speedBins: [number, number][];
  data: WindroseEntry[];
}