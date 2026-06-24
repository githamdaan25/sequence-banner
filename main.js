/**
 * main.js
 * -------------------------------------------------------------
 * Application entry point: preloads frames, initializes the
 * canvas renderer and scroll controller, and hides the loader
 * once everything is ready.
 * -------------------------------------------------------------
 */

(async function init() {
  const canvasEl = document.getElementById("sequenceCanvas");
  const loaderEl = document.getElementById("loader");

  // Set up the renderer immediately so it has correct dimensions
  // before frames finish loading (avoids layout flash on reveal).
  const renderer = new CanvasRenderer(canvasEl);

  // Preload every frame, updating the on-screen progress bar.
  const frames = await Preloader.preloadAll();
  renderer.setFrames(frames);

  // Draw the very first frame immediately so there's no blank flash
  // the instant the loader fades out.
  renderer.renderFrame(0);

  // Hide loader with a short fade once frames are ready.
  if (loaderEl) {
    loaderEl.classList.add("is-hidden");
  }

  // Let wheel/touch input scrub through the frames in place — the
  // page itself never scrolls; only the sequence reacts.
  const scrubController = new ScrubController(renderer, canvasEl.parentElement);

  // Expose for debugging in dev console if needed.
  window.__sequenceApp = { renderer, scrubController };
})();
