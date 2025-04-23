import React, { useState, useEffect } from 'react';
import { Turbine, TurbineType, isTurbineType } from '../../types/Turbine';
import turbinePresets from './../../assets/turbineTypes.json';
import './../styles/TurbineForm.css';

interface TurbineFormProps {
  lat: number;
  long: number;
  name: string;
  type: TurbineType;
  available: boolean;
  onSave: (data: Omit<Turbine, 'id'>) => void;
  onCancel: () => void;
}

const TurbineForm: React.FC<TurbineFormProps> = ({ lat, long, name, type, available, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ name, lat, long, type, available });

  // Effekt, um die Formulardaten zu aktualisieren, wenn lat, long, name, type oder available sich ändern
  useEffect(() => {
    setFormData({ name, lat, long, type, available });
  }, [lat, long, name, type, available]);

  // Funktion für die Änderung der Eingabefelder
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type: inputType, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: inputType === 'checkbox' ? checked : value,
    }));
  };

  // Holen des Schlüssels für den Typ aus turbinePresets
  const getKeyForType = (type: TurbineType): string => {
    const entry = Object.entries(turbinePresets).find(([_, val]) => val.name === type.name);
    return entry ? entry[0] : 'DefaultNull';
  };

  // Handler für den Wechsel des Turbinentyps im Dropdown
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const key = e.target.value as keyof typeof turbinePresets;
    const selected = turbinePresets[key];

    if (isTurbineType(selected)) {
      setFormData((prev) => ({
        ...prev,
        type: selected,  // Aktualisiere den Typ, ohne thrustCoefficientCurve zu ändern
      }));
    }
  };

  // Speichern der Änderungen
  const handleSave = () => {
    onSave({
      name: formData.name,
      lat: formData.lat,
      long: formData.long,
      type: formData.type,
      available: formData.available, 
    });
  };

  const handleCancel = () => {
    onCancel();  // Aufrufen der onCancel-Funktion
  };
  

  return (
    <div className='turbine-form-container'>
      <label className='turbine-form-label'>
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

      <label className='turbine-form-label'>
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

      <label className='turbine-form-label'>
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

      <label className='turbine-form-label'>
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

      <label className='turbine-form-label'>
        Verfügbar:
        <input
          type="checkbox"
          name="available"
          checked={formData.available}
          onChange={handleInputChange}
          style={{
            padding: '0.6rem',
            fontSize: '1rem'
          }}
        />
      </label>

      <div className='turbine-form-btn-container'>
        <button
          onClick={handleSave}
          className="turbine-form-btn save"
        >
          💾 Speichern
        </button>
        <button
          onClick={handleCancel}
          className='turbine-form-btn cancel'
        >
          ❌ Abbrechen
        </button>
      </div>
    </div>
  );
};

export default TurbineForm;
