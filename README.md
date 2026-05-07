# AI-Powered Dynamic Urban Waste Collection System

A React + Express project prototype of a smart urban waste platform that replaces fixed garbage routes with dynamic scheduling based on bin fill levels, predicted overflow, traffic conditions, and truck availability.

## Project structure

```text
Project/
|- backend/
|  |- server.js
|  \- src/services/simulation.js
|- frontend/
|  |- index.html
|  |- vite.config.mjs
|  \- src/
|     |- App.jsx
|     |- main.jsx
|     \- styles.css
|- package.json
\- README.md
```

## Tech stack

- Frontend: React + Vite
- Backend: Express
- Data layer: simulated smart-bin and truck scheduling engine

## API endpoints

- `GET /api/dashboard`
- `GET /api/scenario`

## Run in development

Open two PowerShell terminals in:

`C:\Users\rsdha\SEM 6\OOAD\Project`

Terminal 1:

```powershell
node backend/server.js
```

Terminal 2:

```powershell
cmd /c npm run dev:client
```

Then open:

`http://localhost:5173`

## Run production-style build

```powershell
cmd /c npm run build
node backend/server.js
```

Then open:

`http://localhost:3000`

## What the system demonstrates

- Smart bin monitoring with priority categories
- AI-style overflow prediction using historical trends
- Dynamic truck dispatch based on urgency, capacity, and traffic
- Route optimization inspired by the Vehicle Routing Problem
- Live dashboard for analytics, assignments, and scenario testing
