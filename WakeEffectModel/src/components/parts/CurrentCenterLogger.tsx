import { useMap } from 'react-leaflet';
import { useEffect } from 'react';
import { Map } from 'leaflet';

const CurrentCenterLogger = ({setMap} : {setMap : (map : Map) => void}) => {
  const map = useMap();

  useEffect(() => {
    setMap(map);
  }, []);

  return null;
};

export default CurrentCenterLogger;