import React, { useState } from 'react';
import { Turbine } from '../types/Turbine';

interface TurbineFormProps {
  lat: number;
  lon: number;
  onSave: (turbine: Omit<Turbine, 'id'>) => void;
  onCancel: () => void;
}

const TurbineForm: React.FC<TurbineFormProps> = ({ lat, lon, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('Standard 2MW');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      type,
      lat,
      lon,
    } as Omit<Turbine, 'id'>);
  };

return (
    <div>
      <h3 style={{color: 'black'}}>Neue Turbine hinzufügen</h3>
      <form style={{color: 'black'}} onSubmit={handleSubmit}>
        <label>Name:<br />
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <br />
        <label>Typ:<br />
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="Standard 2MW">Standard 2MW</option>
            <option value="GE 1.5sle">GE 1.5sle</option>
            <option value="Enercon E-82">Enercon E-82</option>
          </select>
        </label>
        <br />
        <div style={{ marginTop: '1rem' }}>
          <button type="submit">💾 Speichern</button>
          <button type="button" onClick={onCancel} style={{ marginLeft: '1rem' }}>❌ Abbrechen</button>
        </div>
      </form>
    </div>
  );
  
};

export default TurbineForm;
