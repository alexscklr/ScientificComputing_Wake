import { TurbineType } from "../types/Turbine";

export const EnerconE82 : TurbineType = {
  name: 'Enercon-E82',
  hubHeight: 78,
  rotorDiameter: 82,
  ratedPower: 2000,
  yawControl: true
};

export const GE1p5sle : TurbineType = {
  name: 'GE 1.5sle',
  hubHeight: 65,
  rotorDiameter: 77,
  ratedPower: 1500,
  yawControl: false
};

export const DefaultNull : TurbineType = {
  name: 'DefaultNull',
  hubHeight: 0,
  rotorDiameter: 0,
  ratedPower: 0,
  yawControl: false
}




export const TurbineTypesMap: Record<string, TurbineType> = {
  'DefaultNull' : DefaultNull,
  'EnerconE82': EnerconE82,
  'GE1.5sle': GE1p5sle
};
