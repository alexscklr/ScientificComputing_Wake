import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Turbine } from '../types/Turbine';
import { windTurbineIcon } from './parts/WindMapMarker';
import { Map, Point } from 'leaflet';
import CurrentCenterLogger from './parts/CurrentCenterLogger';
import L from 'leaflet';



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
  setMapCenter: (center: Point) => void;
  onAddTurbine: (lat: number, lon: number) => void;
  onEditTurbine: (id: string, shiftPressed: boolean) => void;
  onDragTurbine: (id: string, lat: number, lng: number, shiftPressed: boolean) => void;
}
const WindMap: React.FC<WindMapProps> = ({ turbines, activeTurbines, setMapCenter, onAddTurbine, onEditTurbine, onDragTurbine }) => {
  const [map, setMap] = useState<Map | undefined>(undefined);

  // Erstelle ein Ref für jedes Popup
  const markerRefs = useRef<{ [key: string]: L.Marker }>({});

  const shiftDragRef = useRef(false);

  // Öffne das Popup für alle aktiven Turbinen


  useEffect(() => {
    updateMarkerPopups(turbines, activeTurbines, markerRefs);
  }, [activeTurbines, turbines]);




  // Fokussiere auf erste Turbine per F
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
            <Popup
              closeOnClick={false} // Verhindere das automatische Schließen beim Klicken auf die Karte
              autoClose={false}
            >
              <p style={{ margin: '0' }}>{turbine.name}</p><br />
              <hr style={{ marginTop: '0' }} />
              {turbine?.type?.name}<br />
              {turbine.lat.toFixed(5)}, {turbine.long.toFixed(5)}<br />
              <span style={{ color: 'green', marginTop: '5%' }}>
                {turbine.powerWithoutWake ? turbine.powerWithoutWake.toFixed(2) + 'kW' : ''}<br />
              </span>
              <span style={{ color: 'red', marginTop: '5%' }}>
                {turbine.powerWithWake ? turbine.powerWithWake.toFixed(2) + 'kW ' : ''}
              </span>
              <span style={{ color: 'orange', marginTop: '5%' }}>
                {turbine.powerWithWake && turbine.powerWithoutWake ? '( - ' + ((1-turbine.powerWithWake/turbine.powerWithoutWake)*100).toFixed(2) + '% )' : ''}
              </span>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default WindMap;
