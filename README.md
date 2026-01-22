# WindTurbine PowerModel

Eine wissenschaftliche Anwendung zur Simulation und Berechnung von Windenergieanlagen, spezialisiert auf die Analyse von Wake-Effekten (Nachlaufströmungen) und die Optimierung von Windpark-Layouts.

Die Anwendung wurde mit React, TypeScript, Leaflet und Electron entwickelt und bietet sowohl eine browserbasierte Nutzung als auch eine eigenständige Desktop-Anwendung.

## Funktionen

*   **Interaktives Windpark-Layout:**
    *   Platzierung von Windkraftanlagen und Messmasten auf einer Karte (Leaflet).
    *   Unterstützung verschiedener Kartenmodi (Satellit, Gelände, etc.).
    *   Definition von Grundflächen (Ground Areas) für potenzielle Windparks.
*   **Wake-Modellierung:**
    *   Berechnung der gegenseitigen Abschattung von Anlagen (Wake Effects).
    *   Vergleich von Berechnungen mit und ohne Wake-Effekte.
*   **Ertragsanalyse:**
    *   Integration von Winddaten (Windrosen).
    *   Verwaltung verschiedener Turbinentypen und Leistungskennlinien.
    *   Berechnung des erwarteten Energieertrags (AEP).
*   **Datenmanagement:**
    *   Import von Windmessdaten (CSV Import).
    *   Anpassbare Turbinen-Presets.

## Technologie-Stack

*   **Frontend:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **Desktop Wrapper:** [Electron](https://www.electronjs.org/)
*   **Karten & Visualisierung:**
    *   [Leaflet](https://leafletjs.com/) / [React-Leaflet](https://react-leaflet.js.org/)
    *   [Turf.js](https://turfjs.org/) (Geospatial Analysis)
    *   [Recharts](https://recharts.org/) / [ECharts](https://echarts.apache.org/) (Diagramme)

## Installation

Stellen Sie sicher, dass [Node.js](https://nodejs.org/) installiert ist.

1.  Repository klonen (falls zutreffend).
2.  Abhängigkeiten installieren:

```bash
npm install
```

## Verwendung

### Entwicklung (Web)

Startet den lokalen Entwicklungsserver mit Hot Module Replacement (HMR). Ideal für die UI-Entwicklung.

```bash
npm run dev
```

Die Anwendung ist anschließend unter `http://localhost:5173` erreichbar.

### Entwicklung (Electron)

Baut die Anwendung und startet sie im Electron-Container.

```bash
npm run electron:start
```

*Hinweis: Dieser Befehl führt vor dem Start einen Build durch.*

### Build erstellen

Erstellt eine optimierte Produktionsversion der Web-Anwendung im Ordner `dist`.

```bash
npm run build
```

### Desktop-Anwendung bauen

Erstellt die ausführbaren Dateien für das Betriebssystem (Windows/Mac/Linux) mithilfe von Electron Builder.

```bash
npm run electron:build
```

## Projektstruktur

*   `src/`: Quellcode der React-Anwendung.
    *   `components/`: Wiederverwendbare UI-Komponenten (Map, Sidebar, etc.).
    *   `context/`: Globaler State (z.B. ModeContext).
    *   `types/`: TypeScript-Definitionen (Turbine, WindRose, etc.).
    *   `utils/`: Berechnungslogik (Wake-Modelle, Geometrie).
*   `electron/`: Main-Prozess und Preload-Skripte für Electron.
*   `public/`: Statische Assets.

## Lizenz

Privates Projekt.
