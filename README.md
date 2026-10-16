# Yuna Pocket — Engine Core V1.2.0

This is an ENGINE-ONLY milestone. It contains no reused character images, no placeholder anatomical drawings, and no room. It is intentionally not the completed animated character. The panel reports missing character artwork and rig openly.

## Included systems

1. Fixed timestep/event bus (`engine/core.js`)
2. Stable spring/triangle mesh physics (`engine/physics.js`)
3. Character rig parameter interface (`engine/rig.js`)
4. Keyframe playback and crossfade (`engine/animation.js`)
5. Strict asset manifest/loader (`engine/assets.js`)
6. Autonomous behavior state machine (`engine/behavior.js`)
7. Multi-character/prop scene registry (`engine/scenes.js`)
8. Local preferences (`engine/storage.js`)
9. Pointer and optional phone tilt (`engine/interaction.js`)
10. PixiJS renderer adapter (`engine/render.js`)
11. Diagnostics (`engine/diagnostics.js`)
12. Integration/controller (`main.js`)

## Running

Upload all files to GitHub Pages preserving folders, or run via a local web server (for example `python -m http.server 8000`). First access phrase: `YUNA-MOUTH`. Second: `LUNA-BUTT`. These are display gates, not real security. PixiJS uses a public CDN and requires network access. Select RUN ENGINE TESTS to see system readiness. Press Test Physics Impulse or drag on the stage. Run `npm test` for engine logic tests.

## Not included or complete

Actual Live2D/Cubism runtime integration, production layered art and parameter authoring, performance-tested browser visuals, professional animation sequences, facial morph artwork, or animated character model. The built-in PixiJS renderer adapter is ready for mesh textures but the character is deliberately not faked with placeholder artwork.
