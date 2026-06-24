# Scrub-Driven Image Sequence Banner (Portrait)

A single-viewport banner where mouse wheel / trackpad / touch input scrubs
through an image sequence — the page itself never scrolls.

## Source asset analysis

| Property            | Value                          |
|----------------------|--------------------------------|
| Frame count          | 300                             |
| Native resolution    | 720 × 1280 px (portrait)        |
| Source               | Video → APNG conversion, ~30fps |

Frames were extracted and re-encoded as quality-80 JPEGs (~16MB total for
all 300 frames). Loading strategy: eager batched preload (12 concurrent)
with a progress bar, same as the previous build — fine for this size, no
mid-scrub pop-in.

## Folder structure

```
project2/
├── index.html
├── css/style.css
├── js/
│   ├── config.js          # frame count, resolution, scrub sensitivity
│   ├── preloader.js        # batched frame preload + progress
│   ├── canvasRenderer.js    # canvas sizing, cover-fit drawing, retina
│   ├── scrubController.js  # wheel/touch -> lerp -> render, no page scroll
│   └── main.js
└── assets/frames/           # 300 JPEG frames
```

## Running locally

```bash
cd project2
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploying to Vercel

```bash
cd project2
npx vercel --prod
```
Static site, no build step needed.

## Customizing

- **Overlay text:** fill in `#overlayTitle` / `#overlaySubtitle` in `index.html` (currently empty).
- **Scrub feel:** tune `scrubSmoothing` / `scrubDistancePx` in `js/config.js`.
- **Different frames:** replace `assets/frames/`, update `totalFrames`/resolution in `js/config.js`.
