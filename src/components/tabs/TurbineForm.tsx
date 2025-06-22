import React, { useState, useEffect } from 'react';
import { Turbine, TurbineType, isTurbineType } from '../../types/Turbine';
import turbinePresets from './../../assets/turbineTypes.json';
import './../styles/TurbineForm.css';
import PopupMessage from '../parts/PopupMessage';
import { Modes, useMode } from '../../context/ModeContext';

interface TurbineFormProps {
  id: string;
  lat: number;
  long: number;
  name: string;
  type: TurbineType;
  groundAreaID: string;
  available: boolean;
  onSave: (turbine: Turbine) => void;
  onCancel: (id?: string) => void;
  onDelete: (id: string) => void;
}

const TurbineForm: React.FC<TurbineFormProps> = ({ id, lat, long, name, type, groundAreaID, available, onSave, onCancel, onDelete }) => {
  const [formData, setFormData] = useState({ id, name, lat, long, type, groundAreaID, available });
  const [messageVisible, setMessageVisible] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const { mode } = useMode();

  const [layoutMode, setLayoutMode] = useState(false);
  const [layoutData, setLayoutData] = useState({
    rows: 1,
    columns: 1,
    spacing: 500,
    rotation: 0,
  });

  useEffect(() => {
    setFormData({ id, name, lat, long, type, groundAreaID, available });
  }, [lat, long, name, type, groundAreaID, available]);

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

  const generateLayout = (): Turbine[] => {
    const turbines: Turbine[] = [];

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
          id: crypto.randomUUID(),
          name: `${formData.name}_${r}_${c}`,
          lat,
          long,
          type: formData.type,
          groundAreaID: formData.groundAreaID,
          available: true,
        });
      }
    }
    return turbines;
  };

  const handleSave = (e: any) => {
    e.preventDefault();
    // Prüfen, ob ein gültiger Typ ausgewählt wurde
    if (formData.type.name === 'DefaultNull') {
      setMessage('Bitte einen gültigen Typ auswählen!');
      setMessageVisible(true);
      return;
    }

    if (!layoutMode) {
      onSave({ ...formData });
    } else {
      const turbines = generateLayout();
      turbines.forEach((t) => onSave(t));
    }
  };

  const handleCancel = () => {
    onCancel(formData.id);
  };

  const handleDelete = () => {
    onDelete(formData.id);
  }




  return (
    <div className="turbine-form-container">
      <label className="turbine-form-label">
        Name:
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="turbine-form-input"
        />
      </label>

      <label className="turbine-form-label">
        TurbineType:
        <select
          value={getKeyForType(formData.type)}
          onChange={handleTypeChange}
          className="turbine-form-input"
        >
          {Object.entries(turbinePresets).map(([key, turbineType]) => (
            <option key={key} value={key}>
              {turbineType.name}
            </option>
          ))}
        </select>
      </label>

      <label className="turbine-form-label">
        Latitude:
        <input
          type="number"
          name="lat"
          value={formData.lat}
          onChange={handleInputChange}
          className="turbine-form-input"
        />
      </label>

      <label className="turbine-form-label">
        Longitude:
        <input
          type="number"
          name="long"
          value={formData.long}
          onChange={handleInputChange}
          className="turbine-form-input"
        />
      </label>

      <label className="turbine-form-label flexRow">
        Verfügbar:
        <input
          type="checkbox"
          name="available"
          checked={formData.available}
          onChange={handleInputChange}
          className="turbine-form-input"
        />
      </label>

      {/* Layout-Modus Umschalter */}
      {mode === Modes.New && (
        <>
          <div className="layout-toggle">
            <label className="turbine-form-label flexRow">
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
              <label className="turbine-form-label">
                Zeilen:
                <input
                  type="number"
                  name="rows"
                  value={layoutData.rows}
                  onChange={handleLayoutChange}
                  className="turbine-form-input"
                  min={1}
                />
              </label>
              <label className="turbine-form-label">
                Spalten:
                <input
                  type="number"
                  name="columns"
                  value={layoutData.columns}
                  onChange={handleLayoutChange}
                  className="turbine-form-input"
                  min={1}
                />
              </label>
              <label className="turbine-form-label">
                Abstand (m):
                <input
                  type="number"
                  name="spacing"
                  value={layoutData.spacing}
                  onChange={handleLayoutChange}
                  className="turbine-form-input"
                  min={0}
                />
              </label>
              <label className="turbine-form-label">
                Rotation (°):
                <input
                  type="number"
                  name="rotation"
                  value={layoutData.rotation}
                  onChange={handleLayoutChange}
                  className="turbine-form-input"
                />
              </label>
            </div>
          )}
        </>
      )}

      <div className="turbine-form-btn-container">
        <button
          onClick={handleSave}
          className="turbine-form-btn save"
        >
          💾 Speichern <PopupMessage message={message} visible={messageVisible} setVisible={setMessageVisible} />
        </button>
        <button
          onClick={handleCancel}
          className="turbine-form-btn cancel"
        >
          ❌ Abbrechen
        </button>
        {mode === 'edit' && (<button
          onClick={handleDelete}
          className="turbine-form-btn delete"
        >
          🗑️ Delete
        </button>)}
      </div>
    </div>
  );
};

export default TurbineForm;
