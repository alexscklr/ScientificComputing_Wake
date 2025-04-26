export interface Turbine {
  id: string;
  name: string;
  lat: number;
  long: number;
  type: TurbineType;
  available: boolean;
  powerWithoutWake?: number;
  powerWithWake?: number;
}

export interface TurbineType {
  name: string;
  ratedPower: number;
  rotorDiameter: number;
  hubHeight: number;
  yawControl: boolean;
  powerCurve: PowerCurvePoint[];
  thrustCoefficientCurve?: ThrustCurvePoint[];
  cutIn: number;
  cutOut: number;
}

export interface PowerCurvePoint {
  windSpeed: number;
  power: number;
}

export interface ThrustCurvePoint {
  windSpeed: number;
  thrust: number;  // optional thrust
}


export function isTurbineType(turbine: any): turbine is TurbineType {
  return turbine && turbine.name && turbine.ratedPower && turbine.rotorDiameter;
}