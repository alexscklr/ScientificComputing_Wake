import React, { useState, useEffect } from 'react';
import { Turbine, TurbineType } from '../../types/Turbine';

interface TurbineFormProps {
  lat: number;
  long: number;
  name: string;
  type: TurbineType;
  onSave?: (data: Omit<Turbine, 'id'>) => void;  // Optional gemacht
  onCancel?: () => void; 
}

const TurbineForm: React.FC<TurbineFormProps> = ({
  lat,
  long,
  name,
  type,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    lat,
    long,
    name,
    type,
  });

  useEffect(() => {
    setFormData({ lat, long, name, type });
  }, [lat, long, name, type]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
  };

  return (
    <div>
      <div>
        <label>Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label>Type</label>
        <input
          type="text"
          name="type"
          value={formData.type.name}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label>Latitude</label>
        <input
          type="number"
          name="lat"
          value={formData.lat}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label>Longitude</label>
        <input
          type="number"
          name="lon"
          value={formData.long}
          onChange={handleInputChange}
        />
      </div>
      <button onClick={handleSave}>Speichern</button>
      {onCancel && <button onClick={onCancel}>Abbrechen</button>} {/* Nur anzeigen, wenn onCancel existiert */}
    </div>
  );
};

export default TurbineForm;
