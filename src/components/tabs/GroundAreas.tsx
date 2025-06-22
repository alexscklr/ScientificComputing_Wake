import React, { useEffect, useState } from 'react';
import { AreaFeature } from '../../types/GroundArea';
import GroundAreaForm from '../parts/GroundAreaForm';
import './../styles/TurbineForm.css'; // Wiederverwendung des Stils

interface GroundAreasProps {
  groundAreas: AreaFeature[];
  activeGroundAreas: AreaFeature[];
  onUpdate: (updated: AreaFeature) => void;
  onDelete: (id: string) => void;
}

const GroundAreas: React.FC<GroundAreasProps> = ({ groundAreas, activeGroundAreas, onUpdate, onDelete }) => {
  const [localAreas, setLocalAreas] = useState<AreaFeature[]>([]);
  const [showList, setShowList] = useState<boolean>(false);

  // Init local state, wenn activeGroundAreas sich ändert
  useEffect(() => {
    setLocalAreas(activeGroundAreas);
  }, [activeGroundAreas]);

  const handleChange = (
    id: string,
    field: keyof AreaFeature['properties'],
    value: string
  ) => {
    setLocalAreas((prev) =>
      prev.map((area) =>
        area.properties.id === id
          ? {
              ...area,
              properties: {
                ...area.properties,
                [field]: field === 'z0' || field === 'k' ? parseFloat(value) : value,
              },
            }
          : area
      )
    );
  };

  const handleSave = (id: string) => {
    const updated = localAreas.find(area => area.properties.id === id);
    if (updated) {
      onUpdate(updated);
    }
  };


  return (
    <div className="turbine-form-container">
      <label className='turbine-form-label' style={{display: 'inline'}}>
        Zeige Liste der GroundAreas
        <input type="checkbox" onChange={(e) => setShowList(e.target.checked)} style={{marginLeft:'5%'}}/>
      </label>
      {showList && groundAreas.length > 0 && (
        groundAreas.map((area) => (
          <GroundAreaForm area={area} handleChange={handleChange} handleSave={handleSave} onDelete={onDelete}/>
        ))
      )}
      {!showList && localAreas.length > 0 && (
        <h3>Bodenflächen bearbeiten</h3>
      )}
      {!showList && localAreas.map((area) => (
        <GroundAreaForm area={area} handleChange={handleChange} handleSave={handleSave} onDelete={onDelete}/>
      ))}
    </div>
  );
};

export default GroundAreas;

