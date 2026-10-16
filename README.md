# Yuna Pocket V1.2.1 — Engine and character-import validation

This is a complete replacement site. Upload all files while keeping the directories. Open via a local HTTP server or GitHub Pages (ES modules and fetch will not reliably work from file://).

Access steps: YUNA-MOUTH then LUNA-BUTT. Access screens are client-side convenience only.

## What is new
- `assets/character.json`: validated source-of-truth layer registration, pivot and rig channels.
- `engine/character.js`: actual PixiJS painted-layer renderer, optional on-demand character load, transparent load-error reporting.
- Animation action selector for idle, look and wave. Existing physics, interaction and autonomous engine modules retained.
- Engine and artwork status are intentionally separate; no procedural character placeholders.

## Limitations
The imported source artwork is low resolution and is NOT a professional Live2D / Inochi2D rig. It contains no actual facial or finger art variants. The output cannot deliver TV-quality anime movement. The PixiJS CDN requires an internet connection. The full site must be browser-tested after deployment.

## Verification
Run `npm test` for module checks. Image load is verified at runtime using the LOAD CHARACTER ARTWORK control.
