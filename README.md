# Yuna Master Web Project — V1.2 (from supplied Pocket V1.0)

## Launch
Upload the entire folder unchanged to your static host, or run `run-local.bat` on Windows with Python installed. Open `pocket.html` for the 2.5D character viewer; `index.html` retains the legacy residence.

## New in this version
- Two-step *visual* entry gate on each app page. Demo codes in `access-gate.js` section 002: `YUNA-ONE` and `YUNA-TWO`. Change before publishing. **IMPORTANT**: This is NOT real authentication. On public GitHub Pages, both codes and all assets are publicly downloadable, even if the overlay hides the app. For actual privacy, use server-side access control.
- Black void stage (default) or original stage setting; original stage is preserved.
- Manual NEXT ACTION and optional automatic action rotation with configurable interval.
- Motion pulse, focused viewport and section-numbered control additions.
- Original 3D residence and original 2.5D Pocket image assets retained.

## Important limitations
Yuna currently uses artwork warps and image layering. These are **not** independent anatomically rigged mesh physics, real walking, or fully rotatable 3D. Existing images cannot automatically produce professional-quality traditional anime animation. Real character animation requires additional layered artwork and rigging. Browser voice is scripted, not an AI language model. No explicit sexual animations are included.

## Editing guide
`access-gate.js`: section 002 demo phrases; `pocket/pocket.js`: sections 011–012 new motion and view behaviors; `pocket/pocket.css`: section 013 presentation. Existing application files are otherwise retained.

## Tests
Run `npm test` from the extracted folder if Node.js is installed. Validate visuals by opening the project in a browser; automated code tests do not guarantee rendering quality.
