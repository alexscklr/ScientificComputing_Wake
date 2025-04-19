import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Turbine } from '../types/Turbine';
import { windTurbineIcon } from './parts/WindMapMarker';



interface WindMapProps {
  turbines: Turbine[];
  activeTurbine: Turbine | null;
  onAddTurbine: (lat: number, lon: number) => void;
  onEditTurbine: (id: number) => void;
  onDragTurbine: (id: number, lat: number, lng: number) => void;
}

const MapClickHandler = ({ onAddTurbine }: { onAddTurbine: (lat: number, lon: number) => void }) => {
  useMapEvents({
    click(e) {
      onAddTurbine(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const WindMap: React.FC<WindMapProps> = ({ turbines, activeTurbine, onAddTurbine, onEditTurbine, onDragTurbine }) => {
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
      <MapClickHandler onAddTurbine={onAddTurbine} />
      {turbines.map((turbine) => (
        <Marker
          key={turbine.id}
          position={[turbine.lat, turbine.long]}
          icon={turbine.id===activeTurbine?.id ? windTurbineIcon('green') : windTurbineIcon('red')}
          draggable={true}
          eventHandlers={{
            dragend: (e) => {
              const { lat, lng } = e.target.getLatLng();
              onDragTurbine(turbine.id, lat, lng);
            },
            click: () => {
              onEditTurbine(turbine.id); // Beim Klicken auf einen Marker wird der Editier-Modus aktiviert
            },
          }}
        >
          <Popup>
            <strong>{turbine.name}</strong><br />
            <hr />
            {turbine.type.name}<br />
            {turbine.lat.toFixed(5)}, {turbine.long.toFixed(5)}<br />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default WindMap;
