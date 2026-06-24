/**
 * preloader.js
 * -------------------------------------------------------------
 * Handles loading every frame image, reporting progress to the
 * loader UI, and exposing a resolved array of <img> elements
 * (in exact sequence order) once loading completes.
 * -------------------------------------------------------------
 */

const Preloader = (() => {
  /**
   * Builds the zero-padded filename for a given frame index.
   */
  function buildFramePath(index) {
    const padded = String(index).padStart(SEQUENCE_CONFIG.padLength, "0");
    return SEQUENCE_CONFIG.framePathTemplate.replace("{n}", padded);
  }

  /**
   * Loads a single frame as an Image, resolving on load (or error,
   * so one missing frame can't hang the whole sequence).
   */
  function loadFrame(index) {
    return new Promise((resolve) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => resolve(img);
      img.onerror = () => {
        console.warn(`Frame ${index} failed to load: ${buildFramePath(index)}`);
        resolve(img); // resolve anyway so Promise.all doesn't hang
      };
      img.src = buildFramePath(index);
    });
  }

  /**
   * Preloads all frames, updating the loader UI as each one resolves.
   * Returns a Promise<HTMLImageElement[]> ordered by frame index.
   */
  async function preloadAll({ onProgress } = {}) {
    const total = SEQUENCE_CONFIG.totalFrames;
    const frames = new Array(total);
    let loadedCount = 0;

    const barFill = document.getElementById("loaderBarFill");
    const percentLabel = document.getElementById("loaderPercent");

    const updateProgress = () => {
      loadedCount += 1;
      const pct = Math.round((loadedCount / total) * 100);
      if (barFill) barFill.style.width = `${pct}%`;
      if (percentLabel) percentLabel.textContent = `${pct}%`;
      if (onProgress) onProgress(loadedCount, total);
    };

    // Load frames in parallel batches to balance speed vs. browser
    // connection limits. Batching avoids firing 300 simultaneous
    // requests, which can choke slower connections.
    const BATCH_SIZE = 12;
    for (let start = 0; start < total; start += BATCH_SIZE) {
      const end = Math.min(start + BATCH_SIZE, total);
      const batchPromises = [];
      for (let i = start; i < end; i++) {
        batchPromises.push(
          loadFrame(i).then((img) => {
            frames[i] = img;
            updateProgress();
          })
        );
      }
      // eslint-disable-next-line no-await-in-loop
      await Promise.all(batchPromises);
    }

    return frames;
  }

  return { preloadAll, buildFramePath };
})();
