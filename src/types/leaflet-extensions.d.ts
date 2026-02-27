// Leaflet module augmentation for touch events
import { LeafletEventHandlerFn } from 'leaflet';

declare module 'leaflet' {
  interface LeafletEventHandlerFnMap {
    touchstart?: LeafletEventHandlerFn;
    touchmove?: LeafletEventHandlerFn;
    touchend?: LeafletEventHandlerFn;
  }
}
