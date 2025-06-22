import { AreaFeature } from '../../types/GroundArea';


interface GroundAreaFormProps {
    area: AreaFeature;
    handleChange: (id: string, field: keyof AreaFeature['properties'], value: string) => void;
    handleSave: (id: string) => void;
    onDelete: (id: string) => void;
}

const GroundAreaForm: React.FC<GroundAreaFormProps> = ({ area, handleChange, handleSave, onDelete }) => {
    


    return (
        <div key={area.properties.id} className="turbine-form-section">
          <label className="turbine-form-label">
            Name:
            <input
              type="text"
              value={area.properties.name}
              onChange={(e) => handleChange(area.properties.id, 'name', e.target.value)}
              className="turbine-form-input"
            />
          </label>
          <label className="turbine-form-label">
            z₀ (Rauigkeit):
            <input
              type="number"
              value={area.properties.z0}
              onChange={(e) => handleChange(area.properties.id, 'z0', e.target.value)}
              className="turbine-form-input"
            />
          </label>
          <label className="turbine-form-label">
            k (Wake Decay Constant):
            <input
              type="number"
              value={area.properties.k}
              onChange={(e) => handleChange(area.properties.id, 'k', e.target.value)}
              className="turbine-form-input"
            />
          </label>

          <div className="turbine-form-btn-container">
            <button
              onClick={() => handleSave(area.properties.id)}
              className="turbine-form-btn save"
            >
              💾 Speichern
            </button>
            <button
              onClick={() => onDelete(area.properties.id)}
              className="turbine-form-btn delete"
            >
              🗑️ Löschen
            </button>
          </div>
          <hr style={{width:'80%'}} />
        </div>
    )
}

export default GroundAreaForm;