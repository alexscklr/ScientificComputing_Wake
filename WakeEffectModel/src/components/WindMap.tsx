import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Turbine } from '../types/Turbine';

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const dynamicColorIcon = (color: string) =>
  L.divIcon({
    className: '',
    html: `<div style="
      width: 20px;
      height: 20px;
      background-color: ${color};
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 5px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });



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
          icon={turbine.id===activeTurbine?.id ? dynamicColorIcon('green') : dynamicColorIcon('red')}
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
            {turbine.lat.toFixed(5)}, {turbine.long.toFixed(5)}<br />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default WindMap;
