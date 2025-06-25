import L from 'leaflet';


export const windTurbineIcon = (color: string) =>
  L.divIcon({
    className: '',
    html: `
      <div style="
        position: relative;
        width: 40px;
        height: 60px;
        display: flex;
        justify-content: center;
        align-items: flex-end;
      ">
        <!-- Mast -->
        <div style="
          width: 4px;
          height: 30px;
          background-color: ${color};
        "></div>

        <!-- Rotor + Nabe, zentriert -->
        <div style="
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
        ">
          <!-- Nabe -->
          <div style="
            width: 10px;
            height: 10px;
            background-color: ${color};
            border-radius: 50%;
            position: absolute;
            top: 0;
            left: 0;
            transform: translate(-50%, +80%);
            z-index: 2;
          "></div>

          <!-- Rotorblätter -->
          <div style="
            width: 2px;
            height: 18px;
            background-color: ${color};
            position: absolute;
            top: 0;
            left: 0;
            transform: rotate(0deg) translateX(-50%) translateY(-80%);
            transform-origin: bottom center;
          "></div>

          <div style="
            width: 2px;
            height: 18px;
            background-color: ${color};
            position: absolute;
            top: 0;
            left: 0;
            transform: translateX(400%) translateY(0%) rotate(120deg); 
            transform-origin: bottom center;
          "></div>

          <div style="
            width: 2px;
            height: 18px;
            background-color: ${color};
            position: absolute;
            top: 0;
            left: 0;
            transform: translateX(-400%) translateY(0%) rotate(240deg); 
            transform-origin: bottom center;
          "></div>
        </div>
      </div>
    `,
    iconSize: [40, 60],
    iconAnchor: [20, 55],
    popupAnchor: [0, -30],
  });



export const mastIcon = (color: string) =>
  L.divIcon({
    className: "",
    html: `
      <svg width="30" height="60" viewBox="0 0 30 60" xmlns="http://www.w3.org/2000/svg">
        <!-- Senkrechter Mast -->
        <line x1="15" y1="25" x2="15" y2="55" stroke="${color}" stroke-width="3" />

        <!-- Spirale in einem Kreis -->
        <path d="${generateSpiralPath(15, 15, 12, 3)}" fill="none" stroke="${color}" stroke-width="2" />
      </svg>
    `,
    iconSize: [30, 60],
    iconAnchor: [15, 55], // unteres Ende der Linie
    popupAnchor: [0, -55],
  });

// Hilfsfunktion zum Erzeugen einer Spirale
function generateSpiralPath(cx: number, cy: number, maxRadius: number, turns: number): string {
  const points = [];
  const stepsPerTurn = 20;
  const totalSteps = turns * stepsPerTurn;
  const angleStep = (2 * Math.PI) / stepsPerTurn;
  const radiusStep = maxRadius / totalSteps;

  for (let i = 0; i <= totalSteps; i++) {
    const angle = i * angleStep;
    const radius = i * radiusStep;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    points.push(`${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }

  return points.join(" ");
}