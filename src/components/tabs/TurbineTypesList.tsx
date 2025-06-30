import React, { useState } from 'react';
import turbinePresets from '../../assets/turbineTypes.json'
import "../styles/TurbineTypesList.css";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer
} from "recharts";
import { TurbineType } from '../../types/Turbine';

const initialTurbine: TurbineType = turbinePresets.find(tp => tp.name === 'DefaulNull')!;

type TurbineTypesListProps = {
    turbineTypes: TurbineType[];
    setTurbineTypes: (tts: TurbineType[]) => void;
};

const TurbineTypesList: React.FC<TurbineTypesListProps> = ({ turbineTypes, setTurbineTypes }) => {
    const filteredTurbines = turbineTypes.filter(t => t.name !== "DefaultNull");
    const [selectedTurbine, setSelectedTurbine] = useState(filteredTurbines[0]);
    const [formData, setFormData] = useState<TurbineType>(initialTurbine);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isChecked = (e.target as HTMLInputElement).checked;

        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? isChecked : type === 'number' ? parseFloat(value) : value
        }));
    };

    const handleCurveChange = (index: number, field: string, value: number, curve: "power" | "thrust") => {
        const curveName = curve === "power" ? "powerCurve" : "thrustCoefficientCurve";
        setFormData((prev) => {
            const currentCurve = prev[curveName] || [];
            const newCurve = [...currentCurve];
            newCurve[index] = { ...newCurve[index], [field]: value };
            return { ...prev, [curveName]: newCurve };
        });
    };

    const addCurvePoint = (curve: "power" | "thrust") => {
        const defaultPoint = curve === "power" ? { windSpeed: 0, power: 0 } : { windSpeed: 0, thrust: 0.0 };
        const curveName = curve === "power" ? "powerCurve" : "thrustCoefficientCurve";

        setFormData((prev) => ({
            ...prev,
            [curveName]: [...(prev[curveName] || []), defaultPoint]
        }));
    };

    const handleAddTurbine = () => {
        setTurbineTypes([...turbineTypes, formData]);
        setFormData(initialTurbine); // Reset after adding
    };

    return (
        <div className="turbine-list-container">
            <div className="turbine-form-container">
                <label className="turbine-form-label">
                    Name:
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="turbine-form-input"
                    />
                </label>
                <label className="turbine-form-label">
                    Rated Power:
                    <input
                        type="number"
                        name="ratedPower"
                        value={formData.ratedPower}
                        onChange={handleChange}
                        className="turbine-form-input"
                    />
                </label>
                <label className="turbine-form-label">
                    Rotor Diameter:
                    <input
                        type="number"
                        name="rotorDiameter"
                        value={formData.rotorDiameter}
                        onChange={handleChange}
                        className="turbine-form-input"
                    />
                </label>
                <label className="turbine-form-label">
                    Hub Height:
                    <input
                        type="number"
                        name="hubHeight"
                        value={formData.hubHeight}
                        onChange={handleChange}
                        className="turbine-form-input"
                    />
                </label>
                <label className="turbine-form-label">
                    Yaw Control: <span style={{color: 'grey'}}>Aktuell nur mit Yaw Control möglich</span>
                    <input
                        type="checkbox"
                        name="yawControl"
                        checked={formData.yawControl}
                        onChange={handleChange}
                        className="turbine-form-input"
                    />
                </label>
                <label className="turbine-form-label">
                    Cut-In:
                    <input
                        type="number"
                        name="cutIn"
                        value={formData.cutIn}
                        onChange={handleChange}
                        className="turbine-form-input"
                    />
                </label>
                <label className="turbine-form-label">
                    Cut-Out:
                    <input
                        type="number"
                        name="cutOut"
                        value={formData.cutOut}
                        onChange={handleChange}
                        className="turbine-form-input"
                    />
                </label>

                <div>
                    <h4>Power Curve</h4>
                    {formData.powerCurve.map((point, index) => (
                        <div key={index}>
                            <label>
                                Wind Speed:
                                <input
                                    type="number"
                                    value={point.windSpeed}
                                    onChange={(e) => handleCurveChange(index, 'windSpeed', parseFloat(e.target.value), "power")}
                                />
                            </label>
                            <label>
                                Power:
                                <input
                                    type="number"
                                    value={point.power}
                                    onChange={(e) => handleCurveChange(index, 'power', parseFloat(e.target.value), "power")}
                                />
                            </label>
                        </div>
                    ))}
                    <button onClick={() => addCurvePoint("power")}>Add Power Curve Point</button>
                </div>

                <div>
                    <h4>Thrust Coefficient Curve</h4>
                    {formData.thrustCoefficientCurve?.map((point, index) => (
                        <div key={index}>
                            <label>
                                Wind Speed:
                                <input
                                    type="number"
                                    value={point.windSpeed}
                                    onChange={(e) => handleCurveChange(index, 'windSpeed', parseFloat(e.target.value), "thrust")}
                                />
                            </label>
                            <label>
                                Thrust:
                                <input
                                    type="number"
                                    value={point.thrust}
                                    onChange={(e) => handleCurveChange(index, 'thrust', parseFloat(e.target.value), "thrust")}
                                />
                            </label>
                        </div>
                    ))}
                    <button onClick={() => addCurvePoint("thrust")}>Add Thrust Curve Point</button>
                </div>

                <button onClick={handleAddTurbine} className="turbine-form-button">Add Turbine</button>
            </div>
            <table className="turbine-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Rated Power (kW)</th>
                        <th>Rotor Diameter (m)</th>
                        <th>Hub Height (m)</th>
                        <th>Yaw Control</th>
                        <th>Cut-In (m/s)</th>
                        <th>Cut-Out (m/s)</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredTurbines.map((turbine, index) => (
                        <tr key={index}>
                            <td>{turbine.name}</td>
                            <td>{turbine.ratedPower}</td>
                            <td>{turbine.rotorDiameter}</td>
                            <td>{turbine.hubHeight}</td>
                            <td>{turbine.yawControl ? "Yes" : "No"}</td>
                            <td>{turbine.cutIn}</td>
                            <td>{turbine.cutOut}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Select für Turbine */}
            <div style={{ marginTop: "20px" }}>
                <label htmlFor="turbine-select">Power Curve</label>
                <select
                    id="turbine-select"
                    value={selectedTurbine.name}
                    onChange={(e) =>
                        setSelectedTurbine(
                            filteredTurbines.find((t) => t.name === e.target.value)!
                        )
                    }
                    style={{ marginLeft: "10px" }}
                >
                    {filteredTurbines.map((turbine) => (
                        <option key={turbine.name} value={turbine.name}>
                            {turbine.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Power Curve Graph */}
            <div style={{ marginTop: "30px", width: "100%", height: 300 }}>
                <ResponsiveContainer>
                    <LineChart data={selectedTurbine.powerCurve}>
                        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                        <XAxis
                            dataKey="windSpeed"
                            label={{ value: "Wind Speed (m/s)", position: "insideBottom", offset: -5 }}
                        />
                        <YAxis
                            label={{ value: "Power (kW)", angle: -90, position: "insideLeft" }}
                        />
                        <Tooltip />
                        <Line type="monotone" dataKey="power" stroke="#8884d8" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );


};

export default TurbineTypesList;