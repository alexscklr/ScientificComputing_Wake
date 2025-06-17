import React, { useState } from 'react';
import "../styles/TurbineTypesList.css";
import turbinePresets from './../../assets/turbineTypes.json';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer
} from "recharts";

type TurbineTypesListProps = {

};

const TurbineTypesList: React.FC<TurbineTypesListProps> = () => {
    const filteredTurbines = turbinePresets.filter(t => t.name !== "DefaultNull");
    const [selectedTurbine, setSelectedTurbine] = useState(filteredTurbines[0]);

    return (
        <div className="turbine-list-container">
            {/* Tabelle */}
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