import React, { useState, useEffect } from 'react';
import { Turbine, TurbineType } from '../../types/Turbine';
import turbinePresets from './../../assets/turbineTypes.json';

interface TurbineFormProps {
  lat: number;
  long: number;
  name: string;
  type: TurbineType;
  onSave: (data: Omit<Turbine, 'id'>) => void;
  onCancel: () => void;
}

const TurbineForm: React.FC<TurbineFormProps> = ({ lat, long, name, type, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ name, lat, long, type });

  // Effekt, um die Formulardaten zu aktualisieren, wenn lat, long, name oder type sich ändern
  useEffect(() => {
    setFormData({ name, lat, long, type });
  }, [lat, long, name, type]);

  // Funktion für die Änderung der Eingabefelder
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'lat' || name === 'long' ? parseFloat(value) : value,
    }));
  };

  // Holen des Schlüssels für den Typ aus turbinePresets
  const getKeyForType = (type: TurbineType): string => {
    const entry = Object.entries(turbinePresets).find(([_, val]) => val.name === type.name);
    return entry ? entry[0] : 'DefaultNull';
  };

  // Handler für den Wechsel des Turbinentyps im Dropdown
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const key : any = e.target.value;
    const selected = turbinePresets[key];
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        type: selected,
      }));
    }
  };

  // Speichern der Änderungen
  const handleSave = () => {
    onSave({
      name: formData.name,
      lat: formData.lat,
      long: formData.long,
      type: formData.type
    });
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      padding: '1.5rem',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#f9fbfd',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
      maxWidth: '400px'
    }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', color: '#333' }}>
        Name:
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          style={{
            padding: '0.6rem',
            borderRadius: '5px',
            border: '1px solid #ccc',
            fontSize: '1rem'
          }}
        />
      </label>
    
      <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', color: '#333' }}>
        Typ:
        <select
          value={getKeyForType(formData.type)}
          onChange={handleTypeChange}
          style={{
            padding: '0.6rem',
            borderRadius: '5px',
            border: '1px solid #ccc',
            fontSize: '1rem'
          }}
        >
          {Object.entries(turbinePresets).map(([key, turbineType]) => (
            <option key={key} value={key}>
              {turbineType.name}
            </option>
          ))}
        </select>
      </label>
    
      <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', color: '#333' }}>
        Latitude:
        <input
          type="number"
          name="lat"
          value={formData.lat}
          onChange={handleInputChange}
          style={{
            padding: '0.6rem',
            borderRadius: '5px',
            border: '1px solid #ccc',
            fontSize: '1rem'
          }}
        />
      </label>
    
      <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', color: '#333' }}>
        Longitude:
        <input
          type="number"
          name="long"
          value={formData.long}
          onChange={handleInputChange}
          style={{
            padding: '0.6rem',
            borderRadius: '5px',
            border: '1px solid #ccc',
            fontSize: '1rem'
          }}
        />
      </label>
    
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button
          onClick={handleSave}
          style={{
            padding: '0.6rem 1.2rem',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          💾 Speichern
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: '0.6rem 1.2rem',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          ❌ Abbrechen
        </button>
      </div>
    </div>
    
  );
};

export default TurbineForm;
