# YUNA // RESIDENCE — CAMERA-RELATIVE CONTROLS V0.4

**Complete replacement project for your private `yuna` GitHub repository.** Contains the entire existing explorable residence, the complete V0.3 character integration and room-detail updates, and the new Yuna character system. Copy **all** contents of this ZIP into your repo's root.

## V0.4 fix — standard first-person mouse + WASD

The V0.3 movement formula used incorrect signs for the camera yaw. This release replaces it with tested camera-relative vectors using the same yaw as mouse look:

- **W** moves horizontally toward the direction the camera faces; **S** moves backward.
- **A/D** strafe left and right relative to the camera, including after turning 90°, 180° or diagonally.
- Pitch does not affect walking height. Moving diagonally is normalized to the same speed as a single direction, and **Shift** runs faster.
- Pressing opposite direction keys cancels that axis. Releasing mouse lock, opening menus, switching tabs, or losing focus clears held-key state to avoid stuck motion.
- Starting position and the atrium floor-plan teleport have moved to an open aisle (`x=0, z=16`) so testing strafing doesn't immediately collide with an adjacent wall.
- All V0.3 home and Yuna systems remain included. Nothing else was redesigned.

To verify the controller logic yourself: **`npm test`** (Node.js installed) runs eight movement tests without installing dependencies. The test module is `src/movement.js`, used by the game itself.

**Browser check limitation:** automated Node controller tests and JavaScript syntax checks ran; full browser render was not verified in this environment because the browser harness blocked localhost access. Run the site on your PC to verify performance and graphics. The Three.js dependency is still loaded via the existing CDN, so rendering requires connectivity.

## What's new in V0.3

The approved four-view concept sheet (`assets/yuna-approved-reference.webp`) is included in the project. Press **Y** or use the ✧ side button to open the character controls.

There are **two deliberately different representations** of Yuna:

- **ARTWORK PROJECTION (2D; initial display mode):** the exact approved character artwork is used to create cutout holograms for front, both profiles and back. It switches based on the viewer's position. This looks the most like your approved image, but it is **not a genuine 3D body**. No physics or skeletal movement is possible with this projected image.
- **PROTOTYPE MODEL (3D):** original, procedural 3D body and face, illuminated holographic materials, integrated synthetic chest coverage, modeled feet/hands, articulated arm pivots, floating hair strands, idle movement, eyes that blink, slight head movement, ambient light particles, and a physical wave gesture. **The procedural model is an approximation**—it is **not a photo-accurate reconstruction of the approved image, a production-grade character mesh, or a fully rigged artist-made model**.

You can choose either mode at any time. Press **E** near Yuna in the atrium to open the controls, or choose **GO TO YUNA** inside that panel. The **WAVE HELLO** button switches to the 3D view so you can actually see the animated gesture. Hair-flow adjustment and face-following are available in the panel.

The **ANOTHER LINE** control displays prewritten text. **This is scripted preview dialogue, not an AI, text-generation system, or voice integration**.

## Everything preserved from V0.2

- The existing central atrium, lounge, kitchen/dining room, bedroom, study, bathing suite, and observation terrace, including furniture, decorative geometry, cosmic sky and planet.
- The corrected and tested V0.4 camera-relative W/A/S/D movement (W forward, S backward, A left, D right), mouse look, sprint, structural-wall collision, interaction key, and pause/focus behavior.
- The architectural room details, lighting controls, ambient presets, bloom, color accents, render-quality menu, fast travel, furniture interactions and room directory.
- No account required, no tracking code or analytics, browser-local display preferences.

## Start locally (Windows)

1. Open GitHub Desktop and open your local `yuna` repository folder (**Repository → Show in Explorer**).
2. Extract the ZIP and copy **all extracted files/folders** into the repository root, replacing existing files when prompted. You should see `index.html`, `style.css`, `src/`, `assets/`, `README.md` and `run-local.bat` in the same top-level folder.
3. Double-click **`run-local.bat`** to start the local server. It requires Python (Windows `py` or `python` command). If you do not have Python installed, use VS Code + Live Server extension, or any other local HTTP server.
4. Open **http://localhost:8000** in Edge or Chrome. Press **ENTER RESIDENCE**, then press **Y** or walk over to Yuna.
5. In GitHub Desktop, **Commit to main → Push origin** to save the code to your private repository.

If Windows shows a firewall prompt for the Python server, use the local-only loopback URL, not a publicly exposed web service.

## Runtime requirements and honest limitations

- Three.js and postprocessing scripts are currently **loaded from jsDelivr** in the HTML import map, just like the existing V0.2 residence; this means **internet access is needed** to render the home and character, even though the personal data and character art stay local. Google Fonts also loads remotely, with local fallbacks.
- Use a desktop browser with WebGL2, mouse and GPU. Larger scenes with shadows and bloom need more GPU resources. Render quality can be reduced in settings.
- This is **not** a complete offline desktop app and not a persistent server-side AI. No local language model, speech system, visual AI autonomy, pathfinding or NSFW interaction system is included here.
- Genuine artist-grade image fidelity, facial motion capture and natural soft-body physics need a **custom high-quality modeled and rigged GLB/FBX asset** and additional rig/animation work. A generated 2D turnaround cannot automatically be turned into that by code alone.
- Opening `index.html` via `file:///` might fail to load modules/textures due to browser origin security. Use an HTTP localhost server.
- Static site JavaScript syntax and files can be validated without internet. Browser rendering still needs to be tested on your machine because this execution environment cannot fetch jsDelivr's libraries.

## Keys

| Key | Action |
| --- | --- |
| W / A / S / D | Forward / left / backward / right |
| Mouse | First-person camera look |
| Shift | Sprint |
| E | Interact (including Yuna) |
| Y | Open Yuna character controls |
| M | Room directory / fast travel |
| Escape | Release mouse / dismiss overlays |
| Sidebar ✧ | Character panel |

## Project layout

```text
index.html                       Main HTML, HUD, panels, Three import map
style.css                        2026-style dark interface / UI
src/main.js                      Original home, movement, interaction + Yuna wiring
src/yuna.js                      3D Yuna prototype, hair animation and artwork projection
src/movement.js                  First-person camera-relative movement math
tests/movement.test.mjs         Automated WASD movement tests
package.json                    npm test command (no dependencies)
assets/yuna-approved-reference.webp   Original approved reference in compressed format
assets/yuna-view-0.webp          Front artwork projection with transparent background
assets/yuna-view-1.webp          Left-side artwork projection with transparent background
assets/yuna-view-2.webp          Right-side artwork projection with transparent background
assets/yuna-view-3.webp          Rear artwork projection with transparent background
run-local.bat                    Convenience local launcher (requires Python)
.nojekyll                        GitHub Pages static-file setting
README.md                        Documentation
```

No actual AI system or professional 3D reconstruction is claimed. This release is the **character integration milestone**, not the completed Yuna character.
