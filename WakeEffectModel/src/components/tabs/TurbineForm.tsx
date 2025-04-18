import React, { useState, useEffect } from 'react';
import { Turbine, TurbineType } from '../../types/Turbine';
import { TurbineTypesMap } from '../TurbineList';

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

  useEffect(() => {
    setFormData({ name, lat, long, type });
  }, [lat, long, name, type]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'lat' || name === 'long' ? parseFloat(value) : value,
    }));
  };

  const getKeyForType = (type: TurbineType): string => {
    const entry = Object.entries(TurbineTypesMap).find(([_, val]) => val.name === type.name);
    return entry ? entry[0] : 'DefaultNull';
  };
  
  const [selectedTypeKey, setSelectedTypeKey] = useState(getKeyForType(type));
  

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const key = e.target.value;
    const selected = TurbineTypesMap[key];
    if (selected) {
      setSelectedTypeKey(key);
      setFormData((prev) => ({
        ...prev,
        type: selected,
      }));
    }
  };
  

  const handleSave = () => {
    onSave({
      name: formData.name,
      lat: formData.lat,
      long: formData.long,
      type: formData.type
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <label>
        Name:
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
        />
      </label>

      <label>
        Typ:
        <select value={selectedTypeKey} onChange={handleTypeChange}>
          {Object.entries(TurbineTypesMap).map(([key, turbineType]) => (
            <option key={key} value={key}>
              {turbineType.name}
            </option>
          ))}
        </select>

      </label>

      <label>
        Latitude:
        <input
          type="number"
          name="lat"
          value={formData.lat}
          onChange={handleInputChange}
        />
      </label>

      <label>
        Longitude:
        <input
          type="number"
          name="long"
          value={formData.long}
          onChange={handleInputChange}
        />
      </label>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button onClick={handleSave}>💾 Speichern</button>
        <button onClick={onCancel}>❌ Abbrechen</button>
      </div>
    </div>
  );
};

export default TurbineForm;
