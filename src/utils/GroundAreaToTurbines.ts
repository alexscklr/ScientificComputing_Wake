import { point, booleanPointInPolygon } from '@turf/turf';
import { AreaFeature } from '../types/GroundArea';
import { Turbine } from '../types/Turbine';

export function assignGroundAreaDataToTurbines(
  turbines: Turbine[],
  groundAreas: AreaFeature[],
): Turbine[] {
  return turbines.map((turbine) => {
    const turbinePoint = point([turbine.long, turbine.lat]);

    for (const area of groundAreas) {
      const inside = booleanPointInPolygon(turbinePoint, area);

      console.log(`Checking turbine ${turbine.name} at (${turbine.lat}, ${turbine.long})`);
      console.log(` → in area ${area.properties.name}? ${inside}`);

      if (inside) {

        return {
          ...turbine,
          groundAreaID: area.properties.id,
        };
      }
    }

    console.warn(`⚠️ No ground area matched for turbine ${turbine.name}`);
    return {
      ...turbine,
      groundAreaID: undefined,
    };
  });
}

