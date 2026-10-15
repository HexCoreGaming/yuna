# YUNA Residence — V0.8 • Character Refinement

**Complete replacement ZIP** for the existing Yuna GitHub Pages repository. Copy every file and folder over the existing project. Preserve the existing folder layout, including `src/`, `assets/`, and `tests/`.

## What changed from V0.7

The update addresses the specific problems visible in the submitted screenshots, concentrating on Yuna without redesigning the existing residence:

- **Continuous tapered arms:** reconstructed upper arms, elbows, forearms, wrists and small fingers, using smoothly varying full-volume geometry instead of prominent separate shoulder spheres, blocky arm pieces and bead-like hands.
- **Smoother outline:** narrower, more continuous waist/hip transition and rear volume projected backwards rather than widening the hip contour; adjusted head proportions.
- **Hair closer to the artwork:** reworked the oversized hair tubes into a loose bun with 50+ short, tapered, flowing sheet-strands. These animate independently with subtle underwater drift.
- **Softer holographic finish:** substantially reduced excessive metallic shine and overbright local lighting so the approved reference textures and facial detail are more legible.
- **Better standing position:** moved her small atrium roaming route away from the center sculpture so floating rings obscure her less often.
- **Feet:** removed separate bead-like toes and replaced them with smoother foot and instep volumes.
- **Full 360-degree inspection:** camera-following remains disabled. Character rotation, autonomous wandering, walking, waving, hair-flow and secondary-motion sliders remain available in the Y menu.

**Unchanged:** the working `src/fps-controls.js` file (camera-relative WASD, mouse-look, sprint), the seven residence areas, room interactions, portals, settings, and other navigation.

## Running it

Use the existing GitHub Pages URL after committing and pushing the replacement. To run locally with a static server, in the project folder run `python -m http.server 8000` and visit `http://localhost:8000`. Alternatively use `run-local.bat` on Windows when Python is installed. This app loads Three.js from a CDN, so an internet connection is needed to load that dependency.

**Controls:** W/A/S/D + mouse (first person), Shift (sprint), E (interact), M (map), Y (Yuna), Esc (unlock mouse/close panels). In Yuna's panel you can pause wandering, move close to her, manually rotate her, adjust floating hair and secondary-motion intensity, and play scripted interactions.

## Quality and testing

This is an improved **procedural 3D character prototype using textures from your approved 4-view artwork**, not a professional digital human. It does not yet have an artist-built retopologized body, an accurate facial rig, production hair simulation, or motion-captured animation. It will look better than the large disconnected shapes of V0.7, but cannot be guaranteed to reproduce the 2D artwork exactly at every angle.

15 automated code/geometry and first-person movement regression tests passed, and JavaScript syntax and ZIP integrity were checked. **A complete rendered in-browser visual test was unavailable in the packaging environment.** Use the site on your PC to inspect the actual result.

This repository is a static interactive visual prototype, not a live AI chat application. The dialogue preview is scripted and it stores no private chat logs.
