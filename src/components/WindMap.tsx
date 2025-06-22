import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Turbine } from '../types/Turbine';
import { windTurbineIcon } from './parts/WindMapMarker';
import { Map, Point } from 'leaflet';
import CurrentCenterLogger from './parts/CurrentCenterLogger';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import { AreaFeature, AreaProperties } from '../types/GroundArea';




const MapClickHandler = ({ map, onAddTurbine, onDragMap }: { map: Map | undefined, onAddTurbine: (lat: number, lon: number) => void, onDragMap: (point: Point) => void }) => {
  useMapEvents({
    click(e) {
      onAddTurbine(e.latlng.lat, e.latlng.lng);
    },
    drag() {
      if (map) onDragMap(new Point(map.getCenter().lat, map.getCenter().lng));
      else onDragMap(new Point(0, 0));
    }
  });
  return null;
};

const DrawControl = ({
  map,
  drawnItems,
  onAddGroundArea,
  onGroundAreaClick,
}: {
  map: L.Map | undefined;
  drawnItems: L.FeatureGroup;
  onAddGroundArea: (area: AreaFeature) => void;
  onGroundAreaClick: (area: AreaFeature) => void;
}) => {
  useEffect(() => {
    if (!map) return;

    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      edit: { featureGroup: drawnItems },
      draw: {
        polygon: {},
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false,
      },
    });

    map.addControl(drawControl);

    const handleCreate = (event: any) => {
      const layer = event.layer;

      const name = "NewArea";
      const z0 = 0.035;
      const k = 0.08;
      const id = crypto.randomUUID();

      layer.feature = layer.feature || {
        type: "Feature",
        properties: {} as AreaProperties,
      };

      layer.feature.properties.name = name;
      layer.feature.properties.z0 = z0;
      layer.feature.properties.k = k;
      layer.feature.properties.id = id;

      const geojson: AreaFeature = layer.toGeoJSON();

      const props = layer.feature.properties;
      layer.bindPopup(`<pre>${JSON.stringify(props, null, 2)}</pre>`).openPopup();

      layer.on('click', () => {
        const geojson: AreaFeature = layer.toGeoJSON() as AreaFeature;
        onGroundAreaClick(geojson);
      });

      drawnItems.addLayer(layer);

      onAddGroundArea(geojson);
    };

    map.on(L.Draw.Event.CREATED, handleCreate);

    return () => {
      map.off(L.Draw.Event.CREATED, handleCreate);
      map.removeControl(drawControl);
      map.removeLayer(drawnItems);
    };
  }, [map, drawnItems]);

  return null;
};



const updateMarkerPopups = (turbines: Turbine[], activeTurbines: Turbine[], markerRefs: any) => {
  const timeout = setTimeout(() => {
    turbines.forEach(turbine => {
      const marker = markerRefs.current[turbine.id];
      if (marker && activeTurbines.find(t => t.id === turbine.id)) {
        marker.openPopup();
      } else if (marker) {
        marker.closePopup();
      }
    });
  }, 100);

  return () => clearTimeout(timeout);
};



const isActive = (turbine: Turbine, activeTurbines: Turbine[]) => {
  return activeTurbines.some((t) => turbine.id === t.id);
};




interface WindMapProps {
  turbines: Turbine[];
  activeTurbines: Turbine[];
  groundAreas: AreaFeature[];
  setMapCenter: (center: Point) => void;
  onAddTurbine: (lat: number, lon: number) => void;
  onEditTurbine: (id: string, shiftPressed: boolean) => void;
  onDragTurbine: (id: string, lat: number, lng: number, shiftPressed: boolean) => void;
  onAddGroundArea: (area: AreaFeature) => void;
  onGroundAreaClick: (area: AreaFeature) => void;
}
const WindMap: React.FC<WindMapProps> = ({
  turbines,
  activeTurbines,
  groundAreas,
  setMapCenter,
  onAddTurbine,
  onEditTurbine,
  onDragTurbine,
  onAddGroundArea,
  onGroundAreaClick
}) => {
  const [map, setMap] = useState<Map | undefined>(undefined);
  const markerRefs = useRef<{ [key: string]: L.Marker }>({});
  const drawnItems = useRef(new L.FeatureGroup());
  const shiftDragRef = useRef(false);

  // Importierte Flächen in drawnItems einfügen
  useEffect(() => {
    if (!map) return;

    drawnItems.current.clearLayers(); // Bestehende löschen
    groundAreas.forEach((area) => {
      const layer = L.geoJSON(area).getLayers()[0] as L.Polygon;
      const props = area.properties;
      layer.bindPopup(`<strong>${props?.name || 'Fläche'}</strong><br />z0 = ${props?.z0 ?? 'unbekannt'}<br />k = ${props?.k ?? 'unbekannt'}`);
      drawnItems.current.addLayer(layer);
      layer.on("click", () => {
        const geojson = layer.toGeoJSON() as AreaFeature;
        onGroundAreaClick(geojson);
      });

    });
  }, [groundAreas, map]);

  useEffect(() => {
    updateMarkerPopups(turbines, activeTurbines, markerRefs);
  }, [activeTurbines, turbines]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'f' || e.key === 'F') && map && turbines.length > 0) {
        const target = turbines[0];
        map.setView([target.lat, target.long], map.getZoom(), { animate: true });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [map, turbines]);

  return (
    <MapContainer
      center={[51.6369, 8.234]}
      zoom={15}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CurrentCenterLogger setMap={setMap} />
      <DrawControl map={map} drawnItems={drawnItems.current} onAddGroundArea={onAddGroundArea} onGroundAreaClick={onGroundAreaClick} />
      <MapClickHandler map={map} onAddTurbine={onAddTurbine} onDragMap={setMapCenter} />

      {turbines.map((turbine) => {
        const isTurbineActive = isActive(turbine, activeTurbines);
        return (
          <Marker
            ref={(el) => { if (el) markerRefs.current[turbine.id] = el; }}
            key={turbine.id}
            position={[turbine.lat, turbine.long]}
            icon={turbine.available ? (isTurbineActive ? windTurbineIcon('green') : windTurbineIcon('red')) : windTurbineIcon('grey')}
            draggable={true}
            eventHandlers={{
              mousedown: (e) => {
                shiftDragRef.current = (e.originalEvent as MouseEvent).ctrlKey;
              },
              dragend: (e) => {
                const { lat, lng } = e.target.getLatLng();
                onDragTurbine(turbine.id, lat, lng, shiftDragRef.current);
              },
              click: (e) => {
                onEditTurbine(turbine.id, (e.originalEvent as MouseEvent).ctrlKey);
              },
            }}
          >
            <Popup closeOnClick={false} autoClose={false}>
              <p style={{ margin: '0' }}>{turbine.name}</p><br />
              <hr style={{ marginTop: '0' }} />
              {turbine?.type?.name}<br />
              {turbine.lat.toFixed(5)}, {turbine.long.toFixed(5)}<br />
              {groundAreas?.find(area => area.properties.id === turbine.groundAreaID)?.properties.name}<br />
              <span style={{ color: 'green' }}>
                {turbine.powerWithoutWake ? turbine.powerWithoutWake.toFixed(2) + 'kW' : ''}<br />
              </span>
              <span style={{ color: 'red' }}>
                {turbine.powerWithWake ? turbine.powerWithWake.toFixed(2) + 'kW ' : ''}
              </span>
              <span style={{ color: 'orange' }}>
                {turbine.powerWithWake && turbine.powerWithoutWake ? '( - ' + ((1 - turbine.powerWithWake / turbine.powerWithoutWake) * 100).toFixed(2) + '% )' : ''}
              </span>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};


export default WindMap;
