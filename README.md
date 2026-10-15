# YUNA // RESIDENCE V0.5 — FIRST-PERSON CONTROL REPAIR

This is a **complete replacement ZIP**, not an incremental patch. Extract into the root of the existing private `yuna` GitHub repository and replace matching files. It retains the V0.4 residence, room detailing, visuals, interactions, Yuna art-projection and prototype 3D character, settings and UI.

## Critical control repair

The old build used separately calculated movement-vector yaw. V0.5 replaces the entire FPS keyboard/mouse input layer with `src/fps-controls.js`. **Movement is computed from the actual camera's world-space forward direction**, so it cannot use a different rotation convention than mouse look:

- **W** forward where your view points; **S** backward.
- **A** strafe left; **D** strafe right, both relative to your view.
- **Mouse** turns the view. Move the mouse right to look right; W then moves in that direction.
- **Shift** sprint. Diagonal movement is normalized so it isn't faster.
- Looking up/down never alters walking direction in the horizontal plane or makes you fly.
- Releasing keys stops movement. Switching windows or losing pointer lock clears held keys.
- Collision checks resolve X and Z independently, allowing sliding along walls.
- Intro spawns at a clear spot in the atrium; room fast travel and Yuna's location panel retain their existing behavior.
- **E** interact; **M** map; **Y** Yuna panel; **Esc** unlock mouse or dismiss overlay.

## Validation done

- `npm test`: 10 automated movement-orientation cases (north, east, south, west, diagonal, pitch, key cancellation, speed, arrows).
- The actual browser event controller was run under headless Chromium with **real pointer lock, real keyboard events, mouse movements, yaw changes, pitch, and focus loss** using a self-contained harness (so this test did not rely on an external Three.js CDN).
- JavaScript syntax, referenced files and archive integrity checked.

**Limit:** The complete 3D residence in a browser with live Three.js was not exercised here: this runner cannot download the Three.js modules imported from jsDelivr. I cannot claim full in-game verification on your specific hardware. The underlying movement-controller integration has been checked.

## Installation

1. In GitHub Desktop, choose **Repository → Show in Explorer**.
2. Extract the ZIP and place **all** files/folders in the repository root (the folder containing `index.html`). Replace older files.
3. Double-click `run-local.bat` (requires Python) or open the project with Live Server.
4. Visit `http://localhost:8000` in Chrome/Edge, press **Enter Residence**, then move the mouse and test W/A/S/D.
5. Commit and push in GitHub Desktop.

If pointer lock drops, click on the 3D scene to resume mouse controls. An internet connection is required for Three.js loaded via CDN. No AI backend is running yet. Yuna's high-quality concept sheet is included, and her 3D representation remains a procedural prototype rather than an accurate artist-made model.

## Files

- `index.html`, `style.css` — interface, HUD, menus
- `src/main.js` — home, scenes, collisions, Yuna integration
- `src/fps-controls.js` — single source of truth for PC movement and mouse-look input
- `src/yuna.js`, `assets/` — procedural 3D prototype and reference artwork
- `tests/movement.test.mjs` — movement math tests
- `tests/browser-controls.html` — standalone Chromium input-test harness
- `run-local.bat` — Windows local server helper
- `package.json` — `npm test` (no install required)

No existing house geometry, rooms, character art, or interactions were removed for this control fix.
