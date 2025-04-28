// Hilfsfunktionen
export const metersToLat = (meters: number): number => meters / 111320;

export const metersToLng = (meters: number, lat: number): number => {
  const latRad = (lat * Math.PI) / 180;
  const metersPerDegree = 111320 * Math.cos(latRad);
  return meters / metersPerDegree;
};

export const latDiffToMeters = (latDiff: number): number => latDiff * 111320;

export const lngDiffToMeters = (lngDiff: number, lat: number): number => {
  const latRad = (lat * Math.PI) / 180;
  const metersPerDegree = 111320 * Math.cos(latRad);
  return lngDiff * metersPerDegree;
};

// Typ für Verschiebung
type ShiftVector = {
  dx: number; // in Metern (Ost/West)
  dy: number; // in Metern (Nord/Süd)
};

export const calculateShiftVector = (
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): ShiftVector => {
  const dy = latDiffToMeters(endLat - startLat); // Nord/Süd
  const dx = lngDiffToMeters(endLng - startLng, startLat); // Ost/West (auf Start-Lat basierend)
  return { dx, dy };
};

export const applyShiftVector = (
  lat: number,
  lng: number,
  shift: ShiftVector
): { lat: number; lng: number } => {
  const newLat = lat + metersToLat(shift.dy); // Achtung: dy auf lat
  const newLng = lng + metersToLng(shift.dx, lat); // Achtung: dx auf lng
  return { lat: newLat, lng: newLng };
};




export const haversineDistance = (
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number => {
  const R = 6371000; // Erdradius in Meter
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
