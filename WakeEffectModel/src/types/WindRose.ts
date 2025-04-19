export interface WindDirectionData {
    direction: string; // z. B. "N", "NO", "O", ...
    frequency: number; // Prozentualer Anteil (z. B. 12.3)
    averageSpeed?: number; // Optional: Durchschnittsgeschwindigkeit in m/s
  }
  
  export interface WindRose {
    id: number;
    name: string;
    data: WindDirectionData[];
    location?: {
      lat: number;
      long: number;
    };
  }
  