# YUNA Residence — V0.7 • 360° Animated Character Integration

A complete replacement for the previous YUNA repository files. Do not copy only `src/yuna.js`: extract **everything** into the repository, including `assets/` and tests.

## What is implemented

- **The previous home remains intact**: atrium, panorama lounge, kitchen/dining, bedroom, study, bathing suite, observation terrace, portals, environmental settings and lighting.
- **The existing V0.5/V0.6 FPS camera controller is untouched**: mouse looking, WASD aligned with camera, Shift sprint, proximity E, escape/panels, collision and floorplan.
- **New three-dimensional Yuna**: new lofted female silhouette with separate front, left, right and back curved surface patches, using textures derived from the user-approved turnaround reference. The front, profile and back images are not flat billboards in the world. The original reference image is preserved.
- **Articulated model**: hip/knee/ankle and shoulder/elbow pivot hierarchy, procedural walking cycle, body sway, breathing, head/neck movement, optional wave animation.
- **Floating hair**: dozens of tapered 3D ribbons with moving vertices and spring-like underwater drift, configurable speed/intensity.
- **Secondary motion**: damped spring-driven anterior torso and posterior contour movement, independently animated while walking; no widening of the hip profile. Intensity slider (0–2.5).
- **Autonomous wandering**: Yuna strolls through a short, safe route inside the central atrium; pause or resume using the Y menu. She will not turn to face the player just because the player moves.
- **Free inspection**: press Y and choose VIEW CHARACTER UP CLOSE. This pauses movement and positions your camera near Yuna; you can use normal controls to orbit her from any side.
- **Scripted greeting only**: the conversation preview remains scripted, NOT real AI.

## How to run

Open a terminal or Windows command prompt in this folder and launch a local static server:

`python -m http.server 8000`

Visit `http://localhost:8000`. On Windows you can also use `run-local.bat` if Python is installed. The site can be hosted by GitHub Pages; it is entirely client-side and **loads Three.js from a CDN**. An internet connection is required for the initial Three.js library load. It does not run a private language model or store cloud conversation history.

## Controls

- `W/A/S/D`: movement relative to where you look; `mouse`: look; `Shift`: sprint.
- `E`: interact when close; `M`: floorplan; `Y`: character settings; `Esc`: cursor/overlay.
- `Y` menu: pause/resume wandering, close-up view, rotate 45 degrees, reset facing, adjust secondary physics and hair flow, wave, show reference sheet.

## Quality and limitations — important

**This is a true volumetric, textured, animated 3D model, not the exact production-quality replica the four-view concept art deserves.** Its surface detail is projected from the user's approved artwork onto a new mesh, and its joints are procedural. That is more faithful to the original colors and appearance than the previous primitive geometry, but image projection produces inevitable distortions when viewing extreme angles. Its face and hair still lack the artist-sculpted geometry, professional rigging, and texture maps required for genuinely photorealistic motion. **Do not mistake this for a scan, motion capture, AI model, Blender sculpt, or commercially finished digital human.**

Performance depends on your GPU, and a few older room props are still procedurally generated. This build has automated tests and JavaScript syntax verification; a full rendered browser test with Three.js was not available in the packaging environment.

## Development and tests

From the project folder, run `npm test` (requires Node.js but no npm packages). All tests use local, small geometry stand-ins; they are not a substitute for a real GPU render test. No other dependencies are bundled; Three.js remains CDN-based as in the previous working residence.

## Privacy

This repo includes no working external AI API, private conversation logs or credentials. Keep future adult-only character content, personal memories, credentials and local-model files outside a public GitHub repository. Prefer a private repository for your personal application.
