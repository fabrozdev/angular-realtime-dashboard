# angular-realtime-dashboard - Demo

This repository contains a simple frontend app and a mock WebSocket server to demonstrate a high-performance Angular real-time dashboard.

## Features

- WebSocket-based simulated live feed (mock server included)
- RxJS-based streaming with buffering (scan), deduping, and shareReplay
- `OnPush` change detection and `trackBy` usage
- Chart integration example component
- Table component with `trackBy` for efficient rendering
- Pause/resume stream toggle and basic controls

## How to use (quickstart)

1. Install dependencies used by the demo:
   ```bash
   npm install
   ```
2. Run the mock WebSocket server (from the scaffold directory or separately):
   ```bash
   node server.js
   ```
   By default it listens on `ws://localhost:8085` and emits sample data every 400ms.
3. Start the Angular app:
   ```bash
   npm start
   # or
   ng serve --open
   ```
   4Open the app (usually at http://localhost:4200) and you should see a simple dashboard streaming simulated market data.

## Files included in this scaffold

- `src/app/services/websocket.service.ts` - RxJS WebSocket wrapper with retry + shareReplay
- `src/app/features/dashboard/dashboard.component.ts|html|css` - main dashboard using OnPush and async pipe
- `src/app/features/dashboard/components/chart/chart.component.ts|html|css` - chart display
- `src/app/features/dashboard/components/table/table.component.ts|html|css` - lightweight table with trackBy
- `server.js` - mock WebSocket server

## Notes & next steps

- This scaffold is meant as a demonstration of architecture and patterns rather than a production-ready app.
- Add unit & E2E tests (Jest/Cypress) and CI pipeline for productionization.

---

Author: Fabrizzio Lopez
