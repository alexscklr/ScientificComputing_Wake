import React, { useState, useEffect } from 'react';
import { Turbine, TurbineType, isTurbineType } from '../../types/Turbine';
import turbinePresets from './../../assets/turbineTypes.json';
import './../styles/TurbineForm.css';
import PopupMessage from '../parts/PopupMessage';

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
  const [messageVisible, setMessageVisible] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const [layoutMode, setLayoutMode] = useState(false);
  const [layoutData, setLayoutData] = useState({
    rows: 1,
    columns: 1,
    spacing: 500,
    rotation: 0,
  });

  useEffect(() => {
    setFormData({ name, lat, long, type, available });
  }, [lat, long, name, type, available]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type: inputType, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: inputType === 'checkbox' ? checked : value,
    }));
  };

  const getKeyForType = (type: TurbineType): string => {
    if (!type) return 'DefaultNull';
    const entry = Object.entries(turbinePresets).find(([_, val]) => val.name === type.name);
    return entry ? entry[0] : 'DefaultNull';
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const key = e.target.value as keyof typeof turbinePresets;
    const selected = turbinePresets[key];

    if (isTurbineType(selected)) {
      setFormData((prev) => ({
        ...prev,
        type: selected,
      }));
    }
  };

  const handleLayoutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLayoutData((prev) => ({
      ...prev,
      [name]: parseFloat(value),
    }));
  };

  const generateLayout = (): Omit<Turbine, 'id'>[] => {
    const turbines: Omit<Turbine, 'id'>[] = [];

    const degToRad = (deg: number) => deg * (Math.PI / 180);
    const rad = degToRad(layoutData.rotation);

    const metersToLat = (meters: number) => meters / 111320;
    const metersToLong = (meters: number, latitude: number) => meters / (40075000 * Math.cos(degToRad(latitude)) / 360);

    for (let r = 0; r < layoutData.rows; r++) {
      for (let c = 0; c < layoutData.columns; c++) {
        let x = (c - (layoutData.columns - 1) / 2) * layoutData.spacing;
        let y = (r - (layoutData.rows - 1) / 2) * layoutData.spacing;

        const rotatedX = x * Math.cos(rad) - y * Math.sin(rad);
        const rotatedY = x * Math.sin(rad) + y * Math.cos(rad);

        const lat = formData.lat + metersToLat(rotatedY);
        const long = formData.long + metersToLong(rotatedX, formData.lat);

        turbines.push({
          name: `${formData.name}_${r}_${c}`,
          lat,
          long,
          type: formData.type,
          available: true,
        });
      }
    }
    return turbines;
  };

  const handleSave = () => {
    if (formData.type.name === 'DefaultNull') {
      setMessage("Select a type!");
      setMessageVisible(true);
      return;
    }

    if (!layoutMode) {
      onSave({
        name: formData.name,
        lat: formData.lat,
        long: formData.long,
        type: formData.type,
        available: formData.available,
      });
    } else {
      const turbines = generateLayout();
      turbines.forEach(turbine => onSave(turbine));
    }
  };

  const handleCancel = () => {
    onCancel();
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
          className='turbine-form-input'
        />
      </label>

      <label className='turbine-form-label'>
        Typ:
        <select
          value={getKeyForType(formData.type)}
          onChange={handleTypeChange}
          className='turbine-form-input'
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
          className='turbine-form-input'
        />
      </label>

      <label className='turbine-form-label'>
        Longitude:
        <input
          type="number"
          name="long"
          value={formData.long}
          onChange={handleInputChange}
          className='turbine-form-input'
        />
      </label>

      <label className='turbine-form-label flexRow'>
        Verfügbar:
        <input
          type="checkbox"
          name="available"
          checked={formData.available}
          onChange={handleInputChange}
          className='turbine-form-input'
        />
      </label>

      {/* Layout-Modus Umschalter */}
      <div className='layout-toggle'>
        <label className='turbine-form-label flexRow'>
          <input
            type="checkbox"
            checked={layoutMode}
            onChange={() => setLayoutMode(!layoutMode)}
          />
          Layout erstellen
        </label>
      </div>

      {/* Layout Einstellungen */}
      {layoutMode && (
        <div className="layout-settings">
          <label className='turbine-form-label'>
            Zeilen:
            <input
              type="number"
              name="rows"
              value={layoutData.rows}
              onChange={handleLayoutChange}
              className='turbine-form-input'
              min={1}
            />
          </label>
          <label className='turbine-form-label'>
            Spalten:
            <input
              type="number"
              name="columns"
              value={layoutData.columns}
              onChange={handleLayoutChange}
              className='turbine-form-input'
              min={1}
            />
          </label>
          <label className='turbine-form-label'>
            Abstand (m):
            <input
              type="number"
              name="spacing"
              value={layoutData.spacing}
              onChange={handleLayoutChange}
              className='turbine-form-input'
              min={0}
            />
          </label>
          <label className='turbine-form-label'>
            Rotation (°):
            <input
              type="number"
              name="rotation"
              value={layoutData.rotation}
              onChange={handleLayoutChange}
              className='turbine-form-input'
            />
          </label>
        </div>
      )}

      <div className='turbine-form-btn-container'>
        <button
          onClick={handleSave}
          className="turbine-form-btn save"
        >
          💾 Speichern <PopupMessage message={message} visible={messageVisible} setVisible={setMessageVisible} />
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
