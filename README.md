# RFID-GeoMap Frontend

A dashboard for the RFID-GeoMap: Buried-Tag Utility Locator project. It shows
detected utility tags on a map, logs each read, and gives basic stats —
running on simulated data until the Raspberry Pi + RFID reader is connected.

## Quick start

```bash
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`).

## Tech stack, and why

| Piece | Choice | Why |
|---|---|---|
| Framework | React + Vite | Fast dev server, minimal config, easy to hand off to teammates who haven't touched the build setup |
| Map | Leaflet (`leaflet`) | Lightweight, no API key needed (uses OpenStreetMap tiles), plots your GPS-tagged detections directly as lat/lng markers |
| Charts | Recharts | One dependency for the utility-type breakdown chart |
| HTTP | Axios | Talks to the Pi's REST API once it's live |
| State | Plain React state + one custom hook (`useDetections`) | No Redux/Zustand needed for a dashboard this size |

There's no CSS framework — a small hand-written stylesheet (`src/index.css`)
keeps the bundle light and the dark, instrument-panel look intentional
(utility colors follow the real APWA marking code: blue=water, green=sewer,
yellow=gas, red=electric, orange=comms/fiber).

## Project structure

```
src/
  api/
    client.js      <- the ONLY file you edit to go from mock to real data
    mockData.js     simulated RFID+GPS reads
  components/
    Navbar.jsx
    StatsPanel.jsx  counts + pie chart
    MapView.jsx      Leaflet map, colored by utility type
    DetectionTable.jsx  sortable/filterable log
    ScanSimulator.jsx   manual "trigger a scan" panel for demos
  hooks/
    useDetections.js  loads history + subscribes to new reads
  App.jsx
  index.css
```

## How the data flows (current, mocked)

```
[Simulate Scan button] -> client.addDetection() -> mockStore (in memory)
                                                 -> pushes to any subscribers
                                                 -> React state updates
                                                 -> Map + Table + Stats re-render
```

This mirrors the shape the real pipeline will have — a scan event arrives,
gets stored, and the UI reacts — so swapping the source doesn't require
touching any component.

## How the real system will flow (per your synopsis)

```
Buried RFID Tag  →  125 kHz Reader + Antenna  →  Raspberry Pi (Python)
                                                       │
                                        reads tag ID + gets GPS fix (NEO-6M/M8N)
                                                       │
                                                       ▼
                                          SQLite / PostGIS  (+ optional QGIS export)
                                                       │
                                                       ▼
                                       REST API on the Pi (FastAPI/Flask)
                                                       │
                                     ┌─────────────────┴─────────────────┐
                                     ▼                                   ▼
                          This React dashboard                    QGIS desktop
                       (live map, table, stats)               (offline GIS analysis)
```

## Plan for integrating the real RFID card + reader

You don't need to change the frontend's component code at all — only
`src/api/client.js`. Suggested order of work:

1. **Get the reader talking to the Pi first, standalone.** Write a small
   Python script that polls the 125 kHz reader over serial/GPIO and prints
   `tag_id` to the console when a card is presented. Confirm read range and
   reliability before touching the network layer.

2. **Attach GPS.** Add the NEO-6M/NEO-M8N over UART (`pynmea2` or `gpsd`
   work well), so each successful tag read is paired with the Pi's current
   `lat`/`lng` at that moment.

3. **Wrap it in a tiny API.** On the Pi, run a FastAPI (or Flask) app with:
   - `GET /api/detections` — return everything in SQLite so far
   - `POST /api/detections` — the reader script calls this each time it gets
     a tag + GPS fix (or write directly to SQLite in the same process)
   - `WS /api/detections/stream` — broadcast new detections to connected
     clients in real time (a `websockets` or `python-socketio` server both
     work)

   The dashboard already expects exactly this contract — it's documented at
   the top of `src/api/client.js`.

4. **Point the frontend at it.**
   - Set `VITE_API_BASE=http://<pi-ip-or-hostname>:5000/api` in a `.env` file
     (or edit the fallback URL directly).
   - Flip `export const USE_MOCK = true` to `false` in `client.js`.
   - Everything else — map, table, stats — keeps working unchanged, because
     they only ever call `getDetections()` / `subscribeToDetections()`.

5. **Handle the field realities the synopsis calls out.** Log
   `soil_condition` (wet/dry) and `signal_strength` per read from the start —
   the schema already includes both — so you have the data you need later to
   analyze how moisture affects read depth, without a schema migration.

6. **Optional: rover mode.** If you mount the reader on a rover, the Pi can
   just keep POSTing detections as it moves; the dashboard doesn't
   distinguish "handheld" vs "rover" reads, so no frontend change is needed
   there either.

## Notes

- `Simulate Random Scan` / per-type buttons in the dashboard are for demos
  and dev — they're automatically disabled once `USE_MOCK` is `false`.
- The map is centered on placeholder demo coordinates
  (`src/components/MapView.jsx` and `src/api/mockData.js`) — update `CENTER`
  / the initial `setView` call to your actual test site.
