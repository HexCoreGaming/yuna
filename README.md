# Yuna Private Residence + Yuna Pocket V1.0

The full prior 3D residence is included unchanged apart from two links opening Yuna Pocket.

## Open the two modes

- `index.html` — existing interactive 3D residence (previous Yuna V0.9 prototype).
- `pocket.html` — new standalone 2.5D animated character studio, using artwork from the approved four-view reference.

The Pocket view runs entirely in the browser without JavaScript libraries, server AI, or accounts. Run the project using a local static HTTP server or GitHub Pages.

### Pocket features implemented

- Four-artwork-angle rotation (front, left, right, back) with cross-fade between angles. This is a layered **2.5D illusion**, **not** a new rigged volumetric model.
- Breathing, body sway, walking-in-place attempt, simple dance motion, soft hair deformation, blink and approximate mouth motion.
- Adjustable spring-driven motion and hair flow. These are 2D deformation effects, **not** true soft-body simulation.
- Five selectable non-explicit atmospheric scenes: First Light, Blue Hour, After Hours, Starlight, Gravity Zero.
- Tap/click reactions, expression states, scripted text replies and browser text-to-speech (if supported).
- Works with mouse or touch; mobile responsive stage and UI.

### Honest limitations

- The visual effects are code-deformed reference artwork, not hand-separated Live2D meshes or advanced bone-rig animations. Some angles and movement transitions may expose flatness or artifacts.
- Talking uses predefined response rules, **not** a real AI language model. Voice quality depends on local browser / OS voices.
- No explicit sexual scenes or acts are included. The Pocket app is a non-explicit foundational animated viewer.
- For the 3D residence, the prior version's use of remote Three.js remains unchanged.

### Files

- `pocket.html`: interactive Pocket application page
- `pocket/pocket.css`: UI and scene environment
- `pocket/pocket.js`: Canvas character rendering, effects and controls
- `pocket/pocket-engine.mjs`: testable physics/reply/scenes logic
- `pocket/assets/`: cutout character artwork, animation layers, background

## How to run locally on Windows

If Python is installed, double-click `run-local.bat`, then open `http://localhost:8000/pocket.html`. Or use Visual Studio Code Live Server on the project folder. You can deploy the complete directory to your GitHub Pages repository.
