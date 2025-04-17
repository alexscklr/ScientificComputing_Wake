import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Turbine } from '../types/Turbine';

interface WindMapProps {
  turbines: Turbine[];
  onAddTurbine: (lat: number, lon: number) => void;
  onUpdatePosition: (id: number, lat: number, lon: number) => void;
  onDeleteTurbine: (id: number) => void;
}

// Marker-Fix für React + Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MapClickHandler = ({ onAddTurbine }: { onAddTurbine: (lat: number, lon: number) => void }) => {
  useMapEvents({
    click(e) {
      onAddTurbine(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const WindMap: React.FC<WindMapProps> = ({ turbines, onAddTurbine, onUpdatePosition, onDeleteTurbine }) => {
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
          position={[turbine.lat, turbine.lon]}
          draggable={true}
          eventHandlers={{
            dragend: (e) => {
              const { lat, lng } = e.target.getLatLng();
              onUpdatePosition(turbine.id, lat, lng);
            },
          }}
        >
          <Popup>
            <strong>{turbine.name}</strong><br />
            {turbine.lat.toFixed(5)}, {turbine.lon.toFixed(5)}<br />
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDeleteTurbine(turbine.id);
              }}
            >
              🗑️ Entfernen
            </button>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default WindMap;
