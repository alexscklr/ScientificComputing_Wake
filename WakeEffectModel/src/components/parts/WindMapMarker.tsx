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