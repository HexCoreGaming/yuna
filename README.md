# YUNA POCKET — MASTER PROJECT V1.3

This ZIP includes only the 2D/2.5D Pocket character studio. The 3D residence, 3D JavaScript engine, 3D assets, and residence UI are removed.

## Start
- GitHub Pages: upload these files at the site root and open your Pages address. **index.html opens Pocket directly.**
- On a Windows PC with Python installed, double-click `run-local.bat`.
- Do not open index.html via `file://` if the browser blocks JavaScript modules; use a local server.

## Entry sequence
- First phrase: `YUNA-MOUTH`
- Second phrase: `LUNA-BUTT`
- To edit: `access-gate.js`, **[SECTION 002]**.
- The two screens are a client-side **visual gate, not secure authentication**. If publicly hosted, source files and the phrases can be retrieved without passing the gate.

## Included controls
- Dark void or existing illustrated sci-fi stage
- Four artwork viewing directions
- Scene library, moods, breathing/walk/dance/sway image animation presets
- Hair and stylized anime-motion strength sliders
- Manual action selection, NEXT ACTION, AUTO, speed interval, motion pulse, focus view
- Voice output using browser speech synthesis and scripted reactions

## Current limits
The visual character remains the pre-existing image-based artwork prototype: no professional 2D mesh rig, independently modeled anatomy, genuine 3D rotation, or full live conversational AI is included in this update. No explicit adult animations are included.

## Code landmarks
- `access-gate.js`: [SECTION 001] entry, [SECTION 002] phrases
- `pocket/pocket.js`: [SECTION 011] auto actions, [SECTION 012] stage and touch behavior
- `pocket/pocket.css`: character-only void stage styling

## Verification
Run `npm test` with Node.js installed. Browser appearance needs visual validation on your device.
