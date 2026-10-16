# Yuna Pocket V1.1.0 — modular character-engine foundation

Open `index.html` through GitHub Pages or a local HTTP server; PixiJS v7 loads from a CDN. Opening from `file://` may block module/image loading. Front end only; no account, external AI, or secure authentication.

## What is genuinely implemented
- PixiJS WebGL renderer and eleven separate existing painted animation layers.
- Joint-pivot transformations for head, torso, pelvis, legs, and both arms.
- Two independently deformable WebGL meshes; damped spring vertices and pointer impulses.
- Fixed-step simulation scheduler, parameter animation blends, named actions.
- Autonomous action scheduling and manual intervention.
- Pointer/touch input, optional device orientation, and saved user preferences.
- Two screen passphrase flow, neo-futuristic UI, V1.1.0 first screen.

## Actual limitations
- This is **not a Live2D Cubism export** or hand-authored professional deformer rig. It uses source 321x883 painted layers, so hands do not grip objects, mouth is not independently drawn, there are no expression textures, and articulation/occlusion is still limited.
- No room, Luna, external AI, sound, or new professional character art is included.
- Display-only password checks are not access control on GitHub Pages.
- CDN library required. The renderer must be checked visually on the intended device; code checks alone are not visual QA.

## Numbered source sections
001 core, 002 physics, 003 animation, 004 autonomy, 005 asset manifest, 006 renderer, 007 interaction, 008 storage, 009–012 application.

### Next character-production requirement
Create production anime artwork with separate face features, hair locks, ears/tail, hands, upper/lower limbs and hidden overlap painting; author deformation meshes and expressions in Live2D Cubism or equivalent compatible format; integrate the actual exported runtime. These steps cannot be supplied by creating primitive SVG figures.
