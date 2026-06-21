## Agent operational notes

### Running dev/prod servers

- Before starting `npm run dev` or `npm start`, check whether the target port is already in use.
  ```bash
  lsof -i :3000   # or: fuser 3000/tcp
  ```
  If a process is listening, kill it first:
  ```bash
  pkill -f "next"
  # or specifically:
  kill <PID>
  ```
- Do not rely on long-running background jobs inside a single shell invocation for testing. They can hang the tool and waste tokens. Prefer `npm run build` to verify compilation, and only start a server when you actually need to inspect runtime output.
- After changing client-side map code or CSS layout, restart the dev server. HMR/Turbopack may not reliably reflect changes that affect component initialization or layout sizing.

### Map layout gotchas

- `MapView` must render inside a container with explicit, non-zero width and height. The current layout uses CSS Grid in `app/page.tsx`:
  ```tsx
  <main className="grid h-screen w-screen grid-cols-[20rem_1fr] overflow-hidden">
  ```
  and `MapView` fills the second column with:
  ```tsx
  <div className="relative h-full w-full bg-blue-100">
  ```
- Do **not** switch the map wrapper to `flex-1 h-full` alone; in some environments/browsers the flex item can collapse to `0 × 0`, causing Leaflet to initialize but not render any tiles.
- When debugging a blank map, first inspect the `.leaflet-container` element in DevTools. If its computed `width`/`height` are `0px`, the issue is CSS layout, not Leaflet or the tile provider.
