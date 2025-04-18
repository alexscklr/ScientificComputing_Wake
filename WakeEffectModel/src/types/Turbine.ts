/*
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
*/

export interface Turbine {
  id: number;
  name: string;
  lat: number;
  long: number;
  type: TurbineType;
}


export interface TurbineType {
  name: string;
  ratedPower: number;
  rotorDiameter: number;
  hubHeight: number;
  yawControl: boolean;
}