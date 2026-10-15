# YUNA // RESIDENCE — V0.2

A playable, neo-futuristic 3D home and first-person exploration prototype, built specifically for the private `yuna` GitHub repository. This is a complete static website, not just a screenshot or a placeholder README.

## What's built

- Interactive 3D home: central atrium, panorama lounge, full kitchen and dining area, bedroom, bathing suite, study/AI lab, and exterior observation deck with reflecting pool.
- Procedurally built dark-metal architecture, panoramic glass, furniture, artworks, plants, glowing light strips, holographic installation, night-sky stars, distant city skyline, ringed planet, and terraces. V0.2 adds bespoke atrium lighting, lounge ceiling sails, detailed kitchen cabinets and stools, bedroom headboard and wardrobe, study cabinetry, spa display shelving and interactive steam-room lighting, and furnished terrace.
- Corrected camera-relative first-person WASD movement (A = left, D = right), mouse look, sprint, collision with structural walls, E-key interactive objects, input reset when focus is lost, and better menu behavior.
- Floor-plan fast travel menu, day/night lighting presets, color accents, bloom switch, basic render quality settings, locally saved display preferences.
- Responsive UI and no user account, data collection, or external analytics.

## Installation in GitHub Desktop

1. Clone your private `yuna` repository (or open its local folder in GitHub Desktop).
2. Copy **all** contents of this ZIP into the root of the cloned repository, next to / replacing the existing README.
3. Commit in GitHub Desktop, then click **Push origin**.
4. To test locally, from that folder run `python -m http.server 8000` (Python installed) or another static web server, then visit `http://localhost:8000`.
5. Or, if you choose to publish the frontend, GitHub Pages can host it from the repository's root / `main` branch. **Do not enable public Pages if you want the home private.** Use a local server instead.

You can also use VS Code's **Live Server** extension to preview this site locally.

## Requirements / honest limitations

- **Internet connection on first use and later page loads:** Three.js and its postprocessing modules are fetched from the jsDelivr CDN. There is no build step or package installation. The Google Fonts CSS also fetches fonts online; system fonts fall back if unavailable.
- **Desktop browser recommended:** Works best in Chrome/Edge/Firefox with a mouse and WebGL2-capable GPU. Mobile first-person touch controls are not part of this version.
- This uses **procedural 3D architecture and furnishings**, not AAA photogrammetry or professional downloadable 3D furniture models. It's a substantial visual prototype but not a photorealistic Unreal Engine environment.
- No animated AI woman/model is included yet. No intelligence, speech, NSFW features or privacy-sensitive user content is in this prototype. The study contains an explicitly labeled future AI interaction.
- A GPU-heavy combination of dynamic shadows and bloom may need a reduced render-quality setting on older systems.
- Not a native Windows desktop app yet. Static webpage works locally; it could later be wrapped in Tauri.
- This ZIP contains the **complete current project**, no missing generated source directories.

## Controls

| Key | Action |
|---|---|
| W A S D | Walk |
| Mouse | Look |
| Shift | Sprint |
| E | Interact with nearby object |
| M | Room directory and fast travel |
| Escape | Release mouse cursor |
| Side buttons | Map, settings, help |

## Current file layout

- `index.html` — app shell, heads-up display, panels, import map
- `style.css` — application visual design
- `src/main.js` — three-dimensional world, materials, geometry, navigation, controls, interactions and rendering
- `.nojekyll` — tells GitHub Pages to serve static files as-is
- `README.md` — setup and project state

### Future work

Production-ready rigged Yuna model, skeletal and soft-body animation, scene editor, automatic pathfinding/behaviors, fully local AI, speech, and savegame persistence are **not yet implemented**. The source is intentionally readable and modular enough to extend, but additional asset production will be required to achieve exact visual fidelity with the character art.
