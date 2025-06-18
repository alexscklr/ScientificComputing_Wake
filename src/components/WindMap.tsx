import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Turbine } from '../types/Turbine';
import { windTurbineIcon } from './parts/WindMapMarker';
import { Map, Point } from 'leaflet';
import CurrentCenterLogger from './parts/CurrentCenterLogger';

interface WindMapProps {
  turbines: Turbine[];
  activeTurbine: Turbine[];
  setMapCenter: (center: Point) => void;
  onAddTurbine: (lat: number, lon: number) => void;
  onEditTurbine: (id: string, shiftPressed: boolean) => void;
  onDragTurbine: (id: string, lat: number, lng: number) => void;
}

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

const isActive = (turbine: Turbine, activeTurbines: Turbine[]) => {
  return activeTurbines.some((t) => turbine.id === t.id);
};

const WindMap: React.FC<WindMapProps> = ({ turbines, activeTurbine, setMapCenter, onAddTurbine, onEditTurbine, onDragTurbine }) => {
  const [map, setMap] = useState<Map | undefined>(undefined);

  // Erstelle ein Ref für jedes Popup
  const popupRefs = useRef<{ [key: string]: any }>({});

  // Öffne das Popup für alle aktiven Turbinen
  useEffect(() => {
    turbines.forEach(turbine => {
      if (isActive(turbine, activeTurbine)) {
        popupRefs.current[turbine.id]?.openPopup(); // Öffne das Popup
      } else {
        popupRefs.current[turbine.id]?.closePopup(); // Schließe das Popup
      }
    });
  }, [activeTurbine, turbines]); // Abhängig von activeTurbine und turbines

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
      <MapClickHandler map={map} onAddTurbine={onAddTurbine} onDragMap={setMapCenter} />
      {turbines.map((turbine) => {
        const isTurbineActive = isActive(turbine, activeTurbine);

        return (
          <Marker
            key={turbine.id}
            position={[turbine.lat, turbine.long]}
            icon={isTurbineActive ? windTurbineIcon('green') : windTurbineIcon('red')}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const { lat, lng } = e.target.getLatLng();
                onDragTurbine(turbine.id, lat, lng);
              },
              click: (e) => {
                onEditTurbine(turbine.id, e.originalEvent.shiftKey);
              },
            }}
          >
            <Popup
              ref={(el) => { popupRefs.current[turbine.id] = el; }} // Setze das Ref für das Popup
              closeOnClick={false} // Verhindere das automatische Schließen beim Klicken auf die Karte
            >
              <p style={{ margin: '0' }}>{turbine.name}</p><br />
              <hr style={{ marginTop: '0' }} />
              {turbine?.type?.name}<br />
              {turbine.lat.toFixed(5)}, {turbine.long.toFixed(5)}<br />
              <p style={{ color: 'green', marginTop: '5%' }}>
                {turbine.powerWithoutWake ? turbine.powerWithoutWake.toFixed(2) + 'kW' : ''} <br />
                {turbine.powerWithWake ? turbine.powerWithWake.toFixed(2) + 'kW' : ''}
              </p>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default WindMap;
