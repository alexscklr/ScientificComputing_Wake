import {Feature, Polygon} from 'geojson';

export interface AreaProperties {
  name: string;
  z0: number;
  k: number;
  id: string;
};

export type AreaFeature = Feature<Polygon, AreaProperties>;