# Deployment

Dieses Projekt kann sowohl als Desktop-Anwendung (Electron) als auch als Web-Anwendung (Static Site) gebaut werden.

## Web Deployment (Vercel, GitHub Pages, Netlify)

Da die Anwendung keine nativen Node.js-APIs im Frontend verwendet, kann sie als statische Webseite deployed werden.

### Vercel (Empfohlen)

1.  Push den Code auf GitHub.
2.  Erstelle ein neues Projekt in Vercel und importiere das Repository.
3.  Vercel erkennt Vite automatisch.
4.  Überprüfe die Einstellungen:
    -   **Build Command:** `npm run build`
    -   **Output Directory:** `dist`
5.  Deploy.

### GitHub Pages

1.  In `vite.config.ts` sicherstellen, dass `base` korrekt gesetzt ist (meist der Repository-Name, z.B. `/RepoName/`).
    Das Skript passt dies automatisch an, wenn `ELECTRON_BUILD` nicht gesetzt ist, standardmäßig auf `/`.
    Falls du in einem Unterverzeichnis deployen willst, ändere `vite.config.ts`:
    ```typescript
    base: process.env.ELECTRON_BUILD === 'true' ? './' : '/RepoName/', 
    ```

## Electron Build

Um die Desktop-Version zu bauen, werden spezielle Skripte verwendet, die sicherstellen, dass Pfade relativ (`./`) bleiben.

-   **Starten (Dev):** `npm run electron:start`
-   **Bauen (Prod):** `npm run electron:build`

Der Web-Build (`npm run build`) erzeugt Pfade für den Webserver-Root (`/`).
Der Electron-Build (`npm run build:electron`) erzeugt relative Pfade (`./`).
