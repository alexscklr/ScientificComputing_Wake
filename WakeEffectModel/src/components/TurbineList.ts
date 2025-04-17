export interface WindTurbine {
    id: number;
    name: string;
    type: string;
    lat: number;
    lon: number;
    hubHeight?: number;
    rotorDiameter?: number;
    ratedPower?: number;
    isRotatable?: boolean;
  }
  
  export const initialTurbines: WindTurbine[] = [
    {
      id: 1,
      name: 'Turbine 1',
      type: 'Enercon E-82',
      lat: 51.63922,
      lon: 8.23592,
      hubHeight: 78,
      rotorDiameter: 82,
      ratedPower: 2000,
      isRotatable: true,
    },
    {
      id: 2,
      name: 'Turbine 2',
      type: 'GE 1.5sle',
      lat: 51.63458,
      lon: 8.23186,
      hubHeight: 65,
      rotorDiameter: 77,
      ratedPower: 1500,
      isRotatable: false,
    },
  ];
  