
import React, { useState, useEffect } from 'react';
import './../styles/MastForm.css';
import PopupMessage from '../parts/PopupMessage';
import { Modes, useMode } from '../../context/ModeContext';
import { Mast, Windrose } from '../../types/WindRose';
import WindRoseInput from '../parts/WindroseInput';

interface MastFormProps {
  id: string;
  name: string;
  lat: number;
  long: number;
  windrose: Windrose;
  measureHeight: number;
  available: boolean;
  onSave: (mast: Mast) => void;
  onCancel: (id?: string) => void;
  onDelete: (id: string) => void;
}

const MastForm: React.FC<MastFormProps> = ({ id, name, lat, long, windrose, measureHeight, available, onSave, onCancel, onDelete }) => {
  const [formData, setFormData] = useState({ id, name, lat, long, windrose, measureHeight, available });
  const [messageVisible, setMessageVisible] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const { mode } = useMode();

  useEffect(() => {
    setFormData({ id, name, lat, long, windrose, measureHeight, available });
  }, [lat, long, name, windrose, measureHeight, available]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type: inputType, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: inputType === 'checkbox' ? checked : value,
    }));
  };

  const setWindrose = (windrose: Windrose) => {
    setFormData((prev) => ({
      ...prev,
      windrose,
    }));
  };


  const handleSave = (e: any) => {
    e.preventDefault();
    // Prüfen, ob ein gültiger Typ ausgewählt wurde
    if (formData.windrose.name === 'NullWindrose2') {
      setMessage('Bitte einen gültigen Typ auswählen!');
      setMessageVisible(true);
      return;
    }
    onSave({ ...formData });
  };

  const handleCancel = () => {
    onCancel(formData.id);
  };

  const handleDelete = () => {
    onDelete(formData.id);
  }




  return (
    <div className="mast-form-container">
      <label className="mast-form-label">
        Name:
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="mast-form-input"
        />
      </label>

      <label className="mast-form-label">
        Latitude:
        <input
          type="number"
          name="lat"
          value={formData.lat}
          onChange={handleInputChange}
          className="mast-form-input"
        />
      </label>

      <label className="mast-form-label">
        Longitude:
        <input
          type="number"
          name="long"
          value={formData.long}
          onChange={handleInputChange}
          className="mast-form-input"
        />
      </label>
      <label className="mast-form-label">
        Measure Height:
        <input
          type="number"
          name="measureHeight"
          value={formData.measureHeight}
          onChange={handleInputChange}
          className="mast-form-input"
        />
      </label>

      <label className="mast-form-label flexRow">
        Verfügbar:
        <input
          type="checkbox"
          name="available"
          checked={formData.available}
          onChange={handleInputChange}
          className="mast-form-input"
        />
      </label>

      <WindRoseInput windrose={formData.windrose} setWindrose={setWindrose} />

      <div className="mast-form-btn-container">
        <button
          onClick={handleSave}
          className="mast-form-btn save"
        >
          💾 Speichern <PopupMessage message={message} visible={messageVisible} setVisible={setMessageVisible} />
        </button>
        <button
          onClick={handleCancel}
          className="mast-form-btn cancel"
        >
          ❌ Abbrechen
        </button>
        {mode === Modes.EditMast && (<button
          onClick={handleDelete}
          className="mast-form-btn delete"
        >
          🗑️ Delete
        </button>)}
      </div>
    </div>
  );
};

export default MastForm;
