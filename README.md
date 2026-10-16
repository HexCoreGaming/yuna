# Yuna Pocket V1.4 — Living Character Foundation

Pocket-only full replacement project. No 3D residence. Place the entire extracted contents in your GitHub Pages repository root.

## Visual entry phrases
First: `YUNA-MOUTH`  /  Second: `LUNA-BUTT`
These are **client-side navigation gates**, not real protection of public files.

## Changes from V1.3
- Separate Stretch, Giggle, Nod, and Look actions built upon the existing layered art renderer
- On-canvas dragging produces regional spring reactions (hair, torso, hip)
- Cursor-following head drift and light eye gleam when curious/playful
- Character zoom 65%–145%
- Automatic action cycle now uses 8 distinct actions and varies mood periodically
- Dedicated giggle-with-voice button; expressive secondary motion blended into actions
- Existing dark stage, four-angle turn, scene library, voice, gates, settings and controls maintained

## IMPORTANT LIMITATIONS
This still uses the original flattened directional images and overlay hair cuts. **It is not a professional Live2D rig**. Facial details and body areas are not fully separated, so stretching/warp effects will not behave like true independently articulated anatomy. Camera rotation is cross-fading between four images. There are no explicit animations or new nude assets. Future professional quality requires properly layered redraws, masks, pivots, and art-directed deformations.

## Numbered landmarks
`pocket/pocket.js` [SECTION 013] motions, [SECTION 014] face overlay, [SECTION 015] drag/zoom. `pocket/pocket.css` [SECTION 016] controls. Existing [SECTION 011] auto player and [SECTION 012] stage controls preserved.

## Local run
Open `run-local.bat` on Windows if Python is installed, or serve with `python -m http.server 8000` and visit localhost:8000. For tests install Node and use `npm test`.
