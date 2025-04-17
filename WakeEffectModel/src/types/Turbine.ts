export interface Turbine {
    id: number;
    name: string;
    type: string;
    lat: number;
    lon: number;
    ratedPower?: number;
    rotorDiameter?: number;
    hubHeight?: number;
    yawControl?: boolean;
  }