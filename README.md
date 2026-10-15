# YUNA // RESIDENCE V0.6 — FREE 360° VIEW / 3D CHARACTER

This is a COMPLETE replacement of V0.5. Extract all files to your existing private `yuna` repository. Your working first-person control module `src/fps-controls.js` is unchanged from V0.5.

## Changes

- Yuna now appears as an actual **Three.js 3D geometry character** by default, never a camera-facing 2D sprite or art projection.
- Removed the in-world artwork projection; her approved design remains available as a **four-view reference image** under **Y** → **Expand Reference**.
- **No automatic camera tracking:** Yuna does not rotate when you walk around her. Stand in front, move beside her, or circle behind her using standard WASD and mouse-look.
- **Optional turning controls:** Press **Y**, then **Turn 45° left / right** or **Reset Facing**. She turns only when you tell her to.
- Sculpted the rounded rear silhouette into the actual torso mesh instead of detached spheres, without widening the hips.
- Existing idle body movement, floating hair, wave gesture, interaction, home, lighting, furniture, and controller are retained.

**Honest limitation:** The in-world character is a procedural 3D prototype, not an image-identical, custom modeled and artist-rigged Yuna. For precise facial and anatomical likeness, she will ultimately need a proper sculpted / textured / rigged GLB character asset. No NSFW animation or AI chat system is included.

## Controls

W forward / S backward / A strafe left / D strafe right relative to mouse-look. Shift sprint. E interact. Y opens Yuna panel. M floorplan. Esc releases pointer lock. **Yuna does not follow your camera.**

## Verification

Test the repository in a real browser with a local server (the included `run-local.bat` requires Python). The code references Three.js from jsDelivr and requires an internet connection on first load.

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
